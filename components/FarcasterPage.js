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

const FarcasterPage = () => {
  const [loading, setLoading] = useState();
  const [farcasterUser, setFarcasterUser] = useState(null);
  const [text, setText] = useState("");
  const [cid, setCid] = useState("");
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

  async function handleSignIn() {
    setLoading(true);
    await createAndStoreSigner();
    setLoading(false);
  }

  function manageEmbeds(e) {
    console.log("e", e.target.value);
    setEmbeds((prev) => {
      console.log("prev");
    });
  }

  async function createAndStoreSigner() {
    try {
      console.log("inside the create and store signer function");
      const response = await axios.post(`${apiRoute}/farcaster/api/signer`);
      console.log("the response is: ", response);
      if (response.status === 200) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.FARCASTER_USER,
          JSON.stringify(response.data)
        );
        console.log("the repsonse data is: ", response.data);
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
      console.log("THEEEEE TEXT IS: ", text);
      const responseFromIrys = await axios.post(`${apiRoute}/upload-writing`, {
        text,
      });
      console.log("IN HERE, THE IRYS CID IS: ", responseFromIrys.data);
      const cid = responseFromIrys.data.cid;
      setCid(cid);
      setAnkyTranslatingCast(false);
      setIsCastBeingBroadcasted(true);
      const kannadaCid = encodeToAnkyverseLanguage(cid);
      setTranslatedCid(kannadaCid);

      const newCastText = `${kannadaCid}\n\nwritten as anky`;
      let embeds = [{ url: `https://www.anky.lat/r/${cid}` }];
      // if (embedOne && embedOne.length > 0) {
      //   embeds.push({ url: embedOne });
      // }
      // if (embedTwo && embedTwo.length > 0) {
      //   embeds.push({ url: embedTwo });
      // }
      const response = await axios.post(`${apiRoute}/farcaster/api/cast`, {
        text: newCastText,
        signer_uuid: farcasterUser?.signer_uuid,
        embeds: embeds,
      });
      console.log("the response is: ", response);
      if (response.status === 200) {
        setText(""); // Clear the text field
        setWasSuccessfullyCasted(true);
        setCastHash(response.data.cast.hash);
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

  return (
    <div className="text-white pt-5 h-full">
      {!farcasterUser?.status && (
        <div className="w-96 mx-auto">
          <p className="text-white">
            all of this is being developed now! use at your own risk
          </p>
          <Button
            buttonAction={handleSignIn}
            buttonColor="w-96 mx-auto bg-green-600 mt-4"
            buttonText={loading ? "loading..." : "connect with farcaster"}
          />
        </div>
      )}

      {farcasterUser?.status == "pending_approval" &&
        farcasterUser?.signer_approval_url && (
          <div className="signer-approval-container pt-12">
            <div className="hidden w-full md:flex justify-center my-4">
              <QRCode value={farcasterUser.signer_approval_url} />
            </div>

            <a
              className="bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black p-2 rounded-xl mt-24"
              href={farcasterUser.signer_approval_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Login with warpcast
            </a>
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
                  <div className="w-full">
                    {isCastBeingBroadcasted ? (
                      <div className="w-full">
                        <p>
                          your cast was translated into the language of the
                          ankyverse
                        </p>
                        <p className="w-screen text-lg md:text-2xl">
                          {translatedCid}
                        </p>
                        <Button
                          buttonAction={decodeCid}
                          buttonColor="bg-green-600"
                          buttonText="decode cid"
                        />
                        {decodedCid && <p>{decodedCid}</p>}
                        <Link href={`/r/${castHash}`}>visit cast</Link>
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
              <div className="w-full h-full">
                <p>target writing time:</p>
                <input
                  type="number"
                  placeholder="480"
                  className="bg-purple-200 text-black my-2 p-2 rounded-xl text-center"
                  min={0}
                  onChange={(e) => setTargetWritingTime(e.target.value)}
                  value={targetWritingTime}
                />
                <textarea
                  className="text-black p-2 rounded-xl mb-2 w-full"
                  placeholder={DEFAULT_CAST}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                />
                {/* <div className="bg-purple-200 mb-4 p-2 rounded-xl w-96 text-black">
                  <p>embeds</p>
                  <input
                    className="px-2 py-1 rounded-xl bg-purple-300 w-full my-2 border-black placeholder:text-gray-500  border-2"
                    onChange={(e) => setEmbedOne(e.target.value)}
                    value={embedOne}
                    placeholder="embed number one..."
                  />
                </div> */}
                <div className="flex justify-center w-64 mx-auto">
                  <Button
                    buttonAction={handleCast}
                    buttonColor="bg-purple-600 w-24"
                    buttonText={isCasting ? "casting" : "cast"}
                  />
                  <Link href="/library">
                    <Button
                      buttonColor="bg-green-600 w-24"
                      buttonText="library"
                    />
                  </Link>
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
