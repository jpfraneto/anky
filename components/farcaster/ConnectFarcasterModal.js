import React, { useState, useEffect } from "react";
import { LOCAL_STORAGE_KEYS } from "../../lib/constants";
import Button from "../Button";
import axios from "axios";
import Image from "next/image";
import QRCode from "qrcode.react";
import { useUser } from "../../context/UserContext";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

const ConnectFarcasterModal = () => {
  const [copiedText, setCopiedText] = useState("or click here to copy the url");
  const [wtf, setWtf] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getAccessToken, user, authenticated } = usePrivy();
  const { farcasterUser, setFarcasterUser } = useUser();
  console.log("the farcaster user is: ", farcasterUser);

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData) {
      const userData = JSON.parse(storedData);
      setFarcasterUser(userData);
    }
  }, []);

  useEffect(() => {
    let intervalId;

    if (farcasterUser && farcasterUser.status === "pending_approval") {
      const startPolling = () => {
        if (!authenticated) return;
        intervalId = setInterval(async () => {
          try {
            const response = await axios.get(
              `${apiRoute}/farcaster/api/signer?signer_uuid=${
                farcasterUser?.signer_uuid
              }?privyId=${user.id.split("did:privy:")[1]}`
            );
            const userData = response.data;

            if (userData?.status === "approved") {
              localStorage.setItem(
                LOCAL_STORAGE_KEYS.FARCASTER_USER,
                JSON.stringify(userData)
              );

              setFarcasterUser(userData);
              clearInterval(intervalId);
            }
          } catch (error) {
            console.error("Error during polling", error);
          }
        }, 3333);
      };

      const stopPolling = () => {
        clearInterval(intervalId);
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      startPolling();

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        clearInterval(intervalId);
      };
    }
  }, [farcasterUser]);

  const copyText = async () => {
    if (!farcasterUser.signer_approval_url) return;
    await navigator.clipboard.writeText(farcasterUser.signer_approval_url);
    setCopiedText("copied");
  };

  async function handleSignIn() {
    setLoading(true);
    const response = await createAndStoreSigner();
    console.log("the response from the create and store signer is: ", response);

    setLoading(false);
  }

  async function createAndStoreSigner() {
    try {
      if (!authenticated) return;
      const authToken = await getAccessToken();
      const response = await axios.post(
        `${apiRoute}/farcaster/api/signer`,
        { privyId: user.id.split("did:privy:")[1] },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.status === 200) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.FARCASTER_USER,
          JSON.stringify(response.data)
        );
        setFarcasterUser(response.data);
      }
    } catch (error) {
      console.error("API Call failed", error);
    }
  }

  return (
    <div>
      {!farcasterUser?.status && (
        <div className="w-96 mx-auto">
          <p>You can link your farcaster account to your profile here:</p>
          <Button
            buttonAction={handleSignIn}
            buttonColor="w-96 mx-auto bg-green-600 mt-4"
            buttonText={loading ? "loading..." : "connect with farcaster"}
          />
        </div>
      )}
      {farcasterUser?.status == "approved" && (
        <div className="px-0 py-2">
          <p>your farcaster user is connected, it is {farcasterUser.fid}</p>

          {farcasterUser.pfp && (
            <>
              <div className="w-48 h-48 rounded-full overflow-hidden relative">
                <Image src={farcasterUser.pfp} fill alt="user pfp" />
              </div>
              <p>
                @{farcasterUser.username} - {farcasterUser.displayName}
              </p>
            </>
          )}
        </div>
      )}
      {farcasterUser?.status == "pending_approval" &&
        farcasterUser?.signer_approval_url && (
          <div className="signer-approval-container flex flex-col  bg-black  p-0 items-left justify-center ">
            <p className="hidden md:flex mb-2 justify-center mt-2">
              scan this qr code to authenticate with warpcast and link your
              account to anky
            </p>
            <div className="hidden w-full md:flex justify-center my-4">
              <QRCode size={222} value={farcasterUser.signer_approval_url} />
            </div>
            <p className="hidden md:flex justify-center">
              <span
                className="hover:text-red-600 cursor-pointer active:text-yellow-500"
                onClick={copyText}
              >
                {copiedText}
              </span>
            </p>

            <div className="mt-12">
              <a
                className="bg-gradient-to-r md:hidden from-purple-500 via-yellow-600 to-violet-500 text-black p-2 rounded-xl mt-48"
                href={farcasterUser.signer_approval_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Login with warpcast
              </a>
            </div>
          </div>
        )}
    </div>
  );
};

export default ConnectFarcasterModal;
