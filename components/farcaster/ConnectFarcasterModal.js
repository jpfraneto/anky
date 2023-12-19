import React, { useState, useEffect } from "react";
import { LOCAL_STORAGE_KEYS } from "../../lib/constants";
import Button from "../Button";
import axios from "axios";
import QRCode from "qrcode.react";
import { useUser } from "../../context/UserContext";
import Link from "next/link";

const ConnectFarcasterModal = () => {
  const [copiedText, setCopiedText] = useState("or copy the url");
  const { farcasterUser, setFarcasterUser } = useUser();

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData) {
      const user = JSON.parse(storedData);
      setFarcasterUser(user);
    }
  }, []);

  useEffect(() => {
    let intervalId;

    if (farcasterUser && farcasterUser.status === "pending_approval") {
      const startPolling = () => {
        intervalId = setInterval(async () => {
          try {
            const response = await axios.get(
              `${apiRoute}/farcaster/api/signer?signer_uuid=${farcasterUser?.signer_uuid}`
            );
            const user = response.data;

            if (user?.status === "approved") {
              localStorage.setItem(
                LOCAL_STORAGE_KEYS.FARCASTER_USER,
                JSON.stringify(user)
              );

              setFarcasterUser(user);
              clearInterval(intervalId);
            }
          } catch (error) {
            console.error("Error during polling", error);
          }
        }, 2000);
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
    // setGameProps({});
    // return setDisplayWritingGameLanding(true);
    setLoading(true);
    await createAndStoreSigner();
    setLoading(false);
  }

  async function createAndStoreSigner() {
    try {
      const response = await axios.post(`${apiRoute}/farcaster/api/signer`);
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
          <p className="text-white">
            if you want to be an active part of the development of this place,
            consider joining this telegram group:
          </p>
          <a
            href="https://t.me/ankycommunity"
            className="hover:text-purple-600"
            target="_blank"
          >
            open telegram
          </a>
          <Button
            buttonAction={handleSignIn}
            buttonColor="w-96 mx-auto bg-green-600 mt-4"
            buttonText={loading ? "loading..." : "connect with farcaster"}
          />
        </div>
      )}
      {farcasterUser?.status == "pending_approval" &&
        farcasterUser?.signer_approval_url && (
          <div className="signer-approval-container flex flex-col  bg-black  p-4 items-center justify-center ">
            <p className="hidden md:flex mb-2">
              scan this qr code to authenticate with warpcast
            </p>
            <div className="hidden w-full md:flex justify-center my-4">
              <QRCode value={farcasterUser.signer_approval_url} />
            </div>
            <p className="hidden md:flex">
              <span
                className="hover:text-red-600 cursor-pointer active:text-yellow-500"
                onClick={copyText}
              >
                {copiedText}
              </span>
            </p>
            <Link href="/what-is-this" passHref>
              <div className="mt-8 w-96 active:translate-x-12 active:text-white mx-auto hover:bg-yellow-300 hover:text-red-500 hover:translate-x-24 hover:cursor-pointer ">
                wtf is this?
              </div>
            </Link>

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
