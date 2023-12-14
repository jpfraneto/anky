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

const FarcasterPage = ({ setDisplayWritingGameLanding, setGameProps }) => {
  const [loading, setLoading] = useState();
  const [farcasterUser, setFarcasterUser] = useState(null);
  const [text, setText] = useState("");
  const [cid, setCid] = useState("");
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

  // Load the Neynar script and define the callback
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://neynarxyz.github.io/siwn/raw/1.0.0/index.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSignInSuccess = (data) => {
      console.log("Sign-in success with data:", data);
      // Your code to handle the sign-in data
    };

    return () => {
      // Cleanup the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

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
    //setGameProps({});
    // return setDisplayWritingGameLanding(true);
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
      console.log("the response is: ", response);
      if (response.status === 200) {
        setCastHash(response.data.cast.hash);

        const secondCastText = `welcome to a limitless era of farcaster:`;
        console.log("sending the second cast");
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
        console.log("the second cast was sent");
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

  const handleAnonCast = async () => {
    alert("cast to ankycaster");
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
    <div className="text-white pt-5 h-full">
      {!farcasterUser?.status && (
        <div className="w-96 mx-auto">
          <p className="text-white">
            all of this is being developed now! use at your own risk
          </p>
          <p className="text-white">
            if you want to be an active part of the development of this place,
            consider joining this telegram group:
          </p>
          <a href="https://t.me/ankycommunity" target="_blank">
            open telegram
          </a>
          <Button
            buttonAction={handleSignIn}
            buttonColor="w-96 mx-auto bg-green-600 mt-4"
            buttonText={loading ? "loading..." : "connect with farcaster"}
          />
        </div>
      )}

      {/* {!farcasterUser?.status && (
        <div className="w-96 mx-auto">
          <p className="text-white">
            all of this is being developed now! use at your own risk
          </p>
          <p className="text-white">
            if you want to be an active part of the development of this place,
            consider joining this telegram group:
          </p>
          <a href="https://t.me/ankycommunity" target="_blank">
            open telegram
          </a>
          <div className="neynar_signin_container">
            <div
              className="neynar_signin"
              data-client_id="f4625c2d-aa4d-4870-8798-8df8e6b47cee"
              data-theme="dark"
            ></div>
          </div>
        </div>
      )} */}

      {farcasterUser?.status == "pending_approval" &&
        farcasterUser?.signer_approval_url && (
          <div className="signer-approval-container pt-12">
            <p className="mb-2">
              scan this qr code to authenticate with warpcast
            </p>
            <div className="hidden md:flex px-8 py-2 bg-black rounded-xl w-fit mx-auto">
              <div className="hidden w-full md:flex justify-center my-4">
                <QRCode value={farcasterUser.signer_approval_url} />
              </div>
            </div>
            <p>
              <span
                className="hover:text-purple-600 active:text-yellow-500"
                onClick={copyText}
              >
                {copiedText}
              </span>
            </p>
            <div className="mt-8 w-96 mx-auto ">
              <Link href="/what-is-this" passHref>
                <Button
                  buttonText="wtf is this?"
                  buttonColor="bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black"
                />
              </Link>
            </div>

            <div className="mt-12">
              {" "}
              <a
                className="bg-gradient-to-r md:hidden from-red-500 via-yellow-600 to-violet-500 text-black p-2 rounded-xl mt-48"
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
                      <div className="w-full flex flex-col items-center">
                        <p>
                          your cast was translated into the language of the
                          ankyverse
                        </p>
                        <p className="w-fit mx-auto text-center text-lg md:text-2xl">
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
                <p className="mb-2">
                  (there is no character limit in here. write as much as you
                  can)
                </p>
                <p className="mb-2">
                  what you write will be casted on the language of the
                  ankyverse, and only people that access that cast from anky
                  will be able to decode it.
                </p>
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
                <div className="flex justify-center w-96 mx-auto">
                  <Button
                    buttonAction={handleCast}
                    buttonColor="bg-purple-600 w-fit"
                    buttonText={isCasting ? "casting" : "cast"}
                  />
                  {/* <Button
                    buttonAction={handleAnonCast}
                    buttonColor="bg-green-600 w-fit"
                    buttonText={isCasting ? "casting" : "cast anon"}
                  /> */}
                  <Link href="/library">
                    <Button
                      buttonColor="bg-red-600 w-fit"
                      buttonText="go back"
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
