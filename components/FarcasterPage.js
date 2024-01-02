import React, { useState, useEffect } from "react";
import Button from "./Button";
import axios from "axios";
import QRCode from "qrcode.react";
import Link from "next/link";
import { DEFAULT_CAST, LOCAL_STORAGE_KEYS } from "../lib/constants";
import { saveTextAnon } from "../lib/backend";
import {
  encodeToAnkyverseLanguage,
  decodeFromAnkyverseLanguage,
} from "../lib/ankyverse";
import { useUser } from "../context/UserContext";

const FarcasterPage = ({
  setDisplayWritingGameLanding,
  setGameProps,
  setCountdownTarget,
  countdownTarget,
}) => {
  const { farcasterUser, setFarcasterUser } = useUser();
  const [loading, setLoading] = useState();
  const [text, setText] = useState("");
  const [cid, setCid] = useState("");
  const [wtf, setWtf] = useState(false);
  const [copiedText, setCopiedText] = useState("or copy the url");
  const [translatedCid, setTranslatedCid] = useState("");
  const [isCasting, setIsCasting] = useState(false);
  const [embedOne, setEmbedOne] = useState(
    "https://soundcloud.com/oliver-huntemann/oliver-huntemann-fusion-festival-2023-i-tanzwuste-full-set"
  );
  const [embedTwo, setEmbedTwo] = useState("");
  const [castHash, setCastHash] = useState("");
  const [targetWritingTime, setTargetWritingTime] = useState(480);
  const [decodedCid, setDecodedCid] = useState("");
  const [isCastBeingBroadcasted, setIsCastBeingBroadcasted] = useState(false);
  const [wasSuccessfullyCasted, setWasSuccessfullyCasted] = useState(false);
  const [ankyTranslatingCast, setAnkyTranslatingCast] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  useEffect(() => {
    setCountdownTarget(480);
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData && !farcasterUser) {
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

  async function handleSignIn() {
    // setGameProps({});
    // return setDisplayWritingGameLanding(true);
    setLoading(true);
    await createAndStoreSigner();
    setLoading(false);
  }

  function manageEmbeds(e) {
    setEmbeds((prev) => {
      console.log("prev");
    });
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

  const handleCast = async () => {
    if (!text) return alert("please write something");

    setIsCasting(true);
    setAnkyTranslatingCast(true);
    try {
      const responseFromIrys = await axios.post(`${apiRoute}/upload-writing`, {
        text,
      });
      const cid = responseFromIrys.data.cid;
      setCid(cid);
      setAnkyTranslatingCast(false);
      setIsCastBeingBroadcasted(true);
      const kannadaCid = encodeToAnkyverseLanguage(cid);
      setTranslatedCid(kannadaCid);

      const newCastText = `${kannadaCid}\n\nwritten as anky - you can decode this by clicking on the embed on the next cast`;
      // let embeds = [{ url: `https://www.anky.lat/r/${cid}` }];
      // if (embedOne && embedOne.length > 0) {
      //   embeds.push({ url: embedOne });
      // }
      // if (embedTwo && embedTwo.length > 0) {
      //   embeds.push({ url: embedTwo });
      // }
      const response = await axios.post(`${apiRoute}/farcaster/api/cast`, {
        text: newCastText,
        signer_uuid: farcasterUser?.signer_uuid,
      });
      if (response.status === 200) {
        setCastHash(response.data.cast.hash);

        const secondCastText = `welcome to a limitless era of farcaster:`;
        const secondResponse = await axios.post(
          `${apiRoute}/farcaster/api/cast`,
          {
            parent: response.data.cast.hash,
            text: secondCastText,
            signer_uuid: farcasterUser?.signer_uuid,
            embeds: [
              { url: `https://www.anky.lat/r/${response.data.cast.hash}` },
            ],
          }
        );
        if (secondResponse.status === 200) {
          setText(""); // Clear the text field
          setWasSuccessfullyCasted(true);
        }
      }
    } catch (error) {
      setIsCasting(false);
      console.error("Could not send the cast", error);
    }
  };

  const decodeCid = () => {
    const decoded = decodeFromAnkyverseLanguage(translatedCid);
    setDecodedCid(decoded);
  };

  const copyText = async () => {
    if (!farcasterUser.signer_approval_url) return;
    await navigator.clipboard.writeText(farcasterUser.signer_approval_url);
    setCopiedText("copied");
  };

  return (
    <div className="text-white pt-5 h-full bg-black">
      {!farcasterUser?.status && (
        <div className="w-96 mx-auto">
          <p className="text-white">welcome to anky.</p>

          <Button
            buttonAction={handleSignIn}
            buttonColor="w-96 mx-auto bg-green-600 mt-4"
            buttonText={loading ? "loading..." : "connect with farcaster"}
          />
        </div>
      )}

      {farcasterUser?.status == "pending_approval" &&
        farcasterUser?.signer_approval_url && (
          <div className="signer-approval-container flex flex-col  bg-purple-600 p-24 items-center justify-center pt-12">
            <p className="hidden md:flex mb-2">
              scan this qr code to authenticate with warpcast and link your
              account to anky
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
            <div
              onClick={() => setWtf(!wtf)}
              className="mt-8 w-96 active:translate-x-12 active:text-white mx-auto hover:bg-yellow-300 hover:text-red-500 hover:translate-x-24 hover:cursor-pointer "
            >
              wtf is this?
            </div>
            {wtf && (
              <div>
                <p>it is all an excuse to get you writing</p>
              </div>
            )}

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

      {farcasterUser?.status == "approved" && (
        <div className="h-full">
          <div className="flex flex-col h-full w-screen md:w-96 my-2 items-center mx-auto ">
            {isCasting ? (
              <div className="w-full px-2">
                {ankyTranslatingCast ? (
                  <p>anky is translating your cast...</p>
                ) : (
                  <div className="w-full mx-auto">
                    {isCastBeingBroadcasted ? (
                      <div className="w-full flex flex-col items-center justify-center">
                        <p>
                          your cast was translated into the language of the
                          ankyverse
                        </p>
                        <p className="w-fit mx-auto text-center text-lg md:text-2xl">
                          {translatedCid}
                        </p>
                        {/* <Button
                          buttonAction={decodeCid}
                          buttonColor="bg-green-600"
                          buttonText="decode cid"
                        />
                        {decodedCid && <p>{decodedCid}</p>} */}
                        {/* <a href={`https://www.warpcast.com/`} className="p-2 bg-green-600 border border-white">
                          see on warpcast
                        </a> */}
                        <Link href={`/r/${castHash}`}>see cast</Link>
                      </div>
                    ) : (
                      <div>
                        {wasSuccessfullyCasted ? (
                          <div>
                            <p>Your cast is ready on the farcaster network!</p>
                          </div>
                        ) : (
                          <div>There was an error casting this</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center">
                <p>target writing time (seconds)*:</p>
                <small className="text-xs text-purple-300">
                  *(if set to 0, there won&apos;t be time limit)
                </small>
                <input
                  type="number"
                  placeholder="480"
                  className="bg-purple-200 text-black my-2 p-2 rounded-xl text-center"
                  min={0}
                  onChange={(e) => setCountdownTarget(e.target.value)}
                  value={countdownTarget}
                />
                <p className="mb-2">
                  the recommendation is to do this daily for at least 8 minutes
                  - 480 seconds
                </p>
                <p className="mb-2">
                  what you write will be casted on the language of the
                  ankyverse, and only people that access it from anky will be
                  able to decode it.
                </p>
                <p className="mb-2">you can cast it as you or anonymously</p>
                <p className="mb-2">don&apos;t hold anything back</p>

                {/* <div className="bg-purple-200 mb-4 p-2 rounded-xl w-96 text-black">
                  <p>embeds</p>
                  <input
                    className="px-2 py-1 rounded-xl bg-purple-300 w-full my-2 border-black placeholder:text-gray-500  border-2"
                    onChange={(e) => setEmbedOne(e.target.value)}
                    value={embedOne}
                    placeholder="embed number one..."
                  />
                </div> */}
                <div className="flex justify-center w-96 mx-auto">
                  <Button
                    buttonAction={() => {
                      setDisplayWritingGameLanding(true);
                    }}
                    buttonColor="bg-purple-600 text-black w-fit"
                    buttonText={`${
                      countdownTarget > 0
                        ? `write for ${countdownTarget} seconds`
                        : "write without limits"
                    } `}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarcasterPage;
