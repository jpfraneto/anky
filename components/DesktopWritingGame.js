import React, { useState, useRef, useEffect } from "react";
import { Righteous, Dancing_Script } from "next/font/google";
import Button from "./Button";
import Image from "next/image";
import { WebIrys } from "@irys/sdk";
import { useWallets } from "@privy-io/react-auth";
import { saveTextAnon } from "../lib/backend";
import { ethers } from "ethers";
import axios from "axios";
import LoggedInUser from "./LoggedInUser";
import { useRouter } from "next/router";
import buildersABI from "../lib/buildersABI.json";
import { encodeToAnkyverseLanguage } from "../lib/ankyverse";

import { usePrivy } from "@privy-io/react-auth";
import Spinner from "./Spinner";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const righteous = Righteous({ weight: "400", subsets: ["latin"] });
const dancingScript = Dancing_Script({ weight: "400", subsets: ["latin"] });

const DesktopWritingGame = ({
  userPrompt,
  setLifeBarLength,
  setLoadButtons,
  ankyverseDate,
  gamePrompts = {},
  setDisableButton,
  userAppInformation,
  setDisplayWritingGameLanding,
  displayWritingGameLanding,
  lifeBarLength,
  farcasterUser,
  countdownTarget,
}) => {
  const router = useRouter();
  const { login, authenticated, user } = usePrivy();
  const audioRef = useRef();
  const [text, setText] = useState("");
  const [time, setTime] = useState(countdownTarget || 0);
  const [preparing, setPreparing] = useState(true);
  const [saveText, setSaveText] = useState("save anon");
  const [upscaledUrls, setUpscaledUrls] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [savingRound, setSavingRound] = useState(false);
  const [moreThanMinRun, setMoreThanMinRound] = useState(null);
  const [chosenUpscaledImage, setChosenUpscaledImage] = useState("");
  const [savingTextAnon, setSavingTextAnon] = useState(false);
  const [savedText, setSavedText] = useState(false);
  const [cid, setCid] = useState("");

  const [generatedImages, setGeneratedImages] = useState("");
  const [loadingAnkyResponse, setLoadingAnkyResponse] = useState(false);

  const [characterIsReady, setCharacterIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const [character, setCharacter] = useState(null);
  const [ankyIsReady, setAnkyIsReady] = useState(false);
  const [ankyReflection, setAnkyReflection] = useState(null);

  const [gettingAnkyverseCharacter, setGettingAnkyverseCharacter] =
    useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const [lastKeystroke, setLastKeystroke] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [errorProblem, setErrorProblem] = useState(false);
  const [castHash, setCastHash] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [missionAccomplished, setMissionAccomplished] = useState(false);
  const [secondLoading, setSecondLoading] = useState(false);
  const [thirdLoading, setThirdLoading] = useState(false);
  const [copyText, setCopyText] = useState("copy my writing");
  const [metadata, setMetadata] = useState(null);
  const [writingSaved, setWritingSaved] = useState(false);
  const [writingSavingLoading, setWritingSavingLoading] = useState(false);

  const [progress, setProgress] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const { wallets } = useWallets();

  const textareaRef = useRef(null);
  const intervalRef = useRef(null);
  const keystrokeIntervalRef = useRef(null);
  const thisWallet = wallets[0];

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  useEffect(() => {
    if (isActive && !isDone) {
      if (countdownTarget > 0) {
        intervalRef.current = setInterval(() => {
          setTime((time) => +time - 1);
          if (time < 1) {
            setTime(countdownTarget);
            setFinished(true);
            setMissionAccomplished(true);
            setIsActive(false);
          }
        }, 1000);
      } else {
        intervalRef.current = setInterval(() => {
          setTime((time) => +time + 1);
        }, 1000);
      }
    } else if ((countdownTarget > 0 && time === 0) || (!isActive && !isDone)) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, time, isDone]);

  useEffect(() => {
    if (isActive) {
      keystrokeIntervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - lastKeystroke;
        if (time === 480) {
          // audioRef.current.play();
        }
        if (elapsedTime > 3000 && !isDone) {
          finishRun();
        } else {
          // calculate life bar length
          const newLifeBarLength = 100 - elapsedTime / 30; // 100% - (elapsed time in seconds * (100 / 3))
          setLifeBarLength(Math.max(newLifeBarLength, 0)); // do not allow negative values
        }
      }, 100);
    } else {
      clearInterval(keystrokeIntervalRef.current);
    }

    return () => clearInterval(keystrokeIntervalRef.current);
  }, [isActive, lastKeystroke]);

  const finishRun = async () => {
    const finishTimestamp = Date.now();
    if (countdownTarget === 0) setMissionAccomplished(true);
    setLifeBarLength(0);
    audioRef.current.volume = 0.1;
    // audioRef.current.play();
    setFinished(true);
    setEndTime(finishTimestamp);
    setIsDone(true);
    setIsActive(false);
    clearInterval(intervalRef.current);
    clearInterval(keystrokeIntervalRef.current);
    await navigator.clipboard.writeText(text);
    setMoreThanMinRound(true);
    setFailureMessage(`You're done! This run lasted ${time}.}`);
    const frontendWrittenTime = Math.floor(
      (finishTimestamp - startTime) / 1000
    );
    pingServerToEndWritingSession(finishTimestamp, frontendWrittenTime);
    if (time > 30) {
      // setLoadButtons(true);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopyText("copied");
  };

  const startNewRun = () => {
    copyToClipboard();
    audioRef.current.pause();
    setCopyText("Copy my writing");
    setTime(0);
    setDisableButton(false);
    setLifeBarLength(100);
    setText("");
    setSavingRound(false);
    setSavedToDb(false);
    setIsDone(false);
    setFinished(false);
    setSavedText(false);
  };

  const startNewCountdownRun = () => {
    copyToClipboard();
    audioRef.current.pause();
    setCopyText("Copy my writing");
    setTime(countdownTarget);
    setDisableButton(false);
    setLifeBarLength(100);
    setText("");
    // setSavingRound(false);
    // setSavedToDb(false);
    setIsDone(false);
    setFinished(false);
    // setSavedText(false);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
    const now = Date.now();
    if (!isActive && event.target.value.length > 0) {
      console.log("IN HEEEEREAKHCJKAS");
      setDisableButton(true);
      setIsActive(true);
      setFailureMessage("");
      setStartTime(now);
      if (user) {
        pingServerToStartWritingSession(now);
      }
    }
    setLastKeystroke(now);
  };

  async function pingServerToStartWritingSession(now) {
    try {
      const response = await axios.post(`${apiRoute}/mana/session-start`, {
        timestamp: now,
        user: user.id.replace("did:privy:", ""),
      });
      console.log("the response is: ", response);
    } catch (error) {}
  }

  async function pingServerToEndWritingSession(now, frontendWrittenTime) {
    try {
      const response = await axios.post(`${apiRoute}/mana/session-end`, {
        timestamp: now,
        user: user.id.replace("did:privy:", ""),
        frontendWrittenTime,
      });
      console.log("the response is: ", response);
    } catch (error) {}
  }

  const pasteText = async () => {
    await navigator.clipboard.writeText(text);
    setCopyText("copied.");
  };

  const sendTextToIrys = async () => {
    if (!authenticated) {
      if (confirm("You need to login to save your writings")) {
        return login();
      }
      return router.push("/what-is-this");
    }
    setSavingTextAnon(true);
    const getWebIrys = async () => {
      // Ethers5 provider
      // await window.ethereum.enable();
      if (!thisWallet) return;
      // const provider = new providers.Web3Provider(window.ethereum);
      console.log("thiiiiis wallet is: ", thisWallet);
      const provider = await thisWallet.getEthersProvider();

      const url = "https://node2.irys.xyz";
      const token = "ethereum";
      const rpcURL = "https://rpc-mumbai.maticvigil.com"; // Optional parameter

      // Create a wallet object
      const wallet = { rpcUrl: rpcURL, name: "ethersv5", provider: provider };
      // Use the wallet object
      const webIrys = new WebIrys({ url, token, wallet });
      await webIrys.ready();
      return webIrys;
    };

    const webIrys = await getWebIrys();
    let previousPageCid = 0;
    previousPageCid = "";

    const containerId = "alohomora" || getAnkyverseDay();
    const pageNumber = "3";

    const tags = [
      { name: "Content-Type", value: "text/plain" },
      { name: "application-id", value: "Anky Dementors" },
      { name: "container-type", value: "community-notebook" },
      { name: "container-id", value: containerId },
      { name: "page-number", value: pageNumber },
      {
        name: "previous-page",
        value: previousPageCid.toString(),
      },
    ];
    try {
      const receipt = await webIrys.upload(text, { tags });
      setLifeBarLength(0);
      router.push(`/me`);
      setTimeout(() => {
        setDisplayWritingGameLanding(false);
      }, 1000);
    } catch (error) {
      console.log("there was an error");
      console.log("the error is:", error);
      setDisplayWritingGameLanding(false);
    }
  };

  const handleCast = async () => {
    if (!!farcasterUser.status === "approved")
      return alert("you are not completely logged in yet");
    if (!text) return alert("please write something");

    setIsCasting(true);
    //setAnkyTranslatingCast(true);
    try {
      const responseFromIrys = await axios.post(`${apiRoute}/upload-writing`, {
        text,
      });
      const cid = responseFromIrys.data.cid;
      setCid(cid);
      //setAnkyTranslatingCast(false);
      // setIsCastBeingBroadcasted(true);
      const kannadaCid = encodeToAnkyverseLanguage(cid);
      // setTranslatedCid(kannadaCid);

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
        parent: "https://warpcast.com/~/channel/anky",
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
        console.log("the second cast was sent");
        if (secondResponse.status === 200) {
          setText(""); // Clear the text field
          setDisplayWritingGameLanding(false);
          router.push(`https://www.anky.lat/r/${response.data.cast.hash}`);
          //setWasSuccessfullyCasted(true);
        }
      }
    } catch (error) {
      setIsCasting(false);
      console.error("Could not send the cast", error);
    }
  };

  const handleAnonCast = async () => {
    try {
      setIsCasting(true);
      const responseFromIrys = await axios.post(`${apiRoute}/upload-writing`, {
        text,
      });
      const cid = responseFromIrys.data.cid;

      const kannadaCid = encodeToAnkyverseLanguage(cid);
      const newCastText = `${kannadaCid}\n\nwritten as anky - you can decode this by clicking on the embed on the next cast`;

      const response = await axios.post(`${apiRoute}/farcaster/api/cast/anon`, {
        text: newCastText,
        parent: "",
        embeds: [],
      });
      console.log("the response is: ", response);

      if (response.status === 200) {
        setText(""); // Clear the text field
        setDisplayWritingGameLanding(false);
        router.push(`https://www.anky.lat/r/${response.data.cast.hash}`);
        setTimeout(() => {
          setDisplayWritingGameLanding(false);
        }, 111);
        //setWasSuccessfullyCasted(true);
      }
    } catch (error) {
      alert("there was an error casting your cast anon");
      console.log(error);
    }
  };

  if (errorProblem)
    return (
      <div
        className={`${righteous.className} text-thewhite relative  flex flex-col items-center justify-center w-full bg-cover bg-center`}
        style={{
          boxSizing: "border-box",
          height: "calc(100vh  - 90px)",
          backgroundImage: "url('/images/the-monumental-game.jpeg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <p>
          There was an error. But you can always keep your writing if you want.
        </p>
        <p>I&apos;m sorry. I&apos;m doing my best to make this thing work.</p>
        <Button
          buttonColor="bg-thegreenbtn"
          buttonAction={pasteText}
          buttonText={copyText}
        />
      </div>
    );

  if (savingTextAnon)
    return (
      <div>
        <p>loading...</p>
        <Spinner />
      </div>
    );

  return (
    <div className="h-full">
      <audio ref={audioRef}>
        <source src="/sounds/bell.mp3" />
      </audio>
      <div className="md:block text-white relative w-full h-full mx-auto">
        <div className="flex h-full flex-col">
          <div
            className={`${righteous.className} w-full grow-0 bg-black/50 py-2 justify-center items-center flex h-fit items-center px-2 flex `}
          >
            <p
              className={`text-left h-fit w-10/12 text-purple-600 md:mt-0 text-lg md:text-3xl overflow-y-scroll  drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}
            >
              {userPrompt}
            </p>
            <p className="w-2/12 text-4xl md:text-6xl text-yellow-600 h-full flex  items-center justify-center ">
              {time}
            </p>
          </div>

          <div className="w-full grow relative">
            <textarea
              ref={textareaRef}
              disabled={finished}
              style={{
                top: `${text && "0"}%`,
                bottom: `${text && "0"}%`,
                left: `${text && "0"}%`,
                right: `${text && "0"}%`,
                transition: "top 1s, bottom 1s, left 1s, right 1s", // smooth transition over 1 second
              }}
              className={`${text && "absolute"} ${
                text
                  ? "md:aspect-video md:flex w-full h-full text-left"
                  : "mt-8 w-4/5 md:w-3/5 h-64"
              } p-4 text-white opacity-80 placeholder-white text-xl border border-white rounded-md bg-opacity-10 bg-black`}
              placeholder="just write..."
              value={text}
              onChange={handleTextChange}
            ></textarea>

            {text.length > 0 ||
              (!finished && (
                <div>
                  <div className="flex w-48 justify-center mx-auto mt-4">
                    <Button
                      buttonText="cancel"
                      buttonColor="bg-red-600"
                      buttonAction={() => {
                        if (displayWritingGameLanding) {
                          console.log("in here!", router.pathname);
                          if (
                            router.pathname.includes("write") ||
                            router.pathname.includes("w")
                          ) {
                            router.push("/");
                          }
                          setDisplayWritingGameLanding(false);
                        } else {
                          if (
                            router.pathname.includes("write") ||
                            router.pathname.includes("w")
                          )
                            return router.push("/");
                          router.back();
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {text && (
            <div
              className={`${
                text && "fade-in"
              } flex flex-col justify-center items-center absolute w-screen top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-opacity-20 mb-4`}
            >
              {finished && (
                <>
                  {missionAccomplished ||
                  (countdownTarget > 0 && time === 0) ? (
                    <>
                      <>
                        {farcasterUser ? (
                          <div className="p-4 bg-black w-2/3 md:w-fit rounded-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-50">
                            {farcasterUser.status === "approved" && (
                              <p>you are logged in on farcaster</p>
                            )}
                            <div className="flex flex-col md:flex-row md:space-y-0 space-y-2 space-x-2 mt-2">
                              <Button
                                buttonText={`${
                                  isCasting ? "casting..." : "cast anon"
                                }`}
                                buttonAction={handleAnonCast}
                                buttonColor="bg-purple-600"
                              />
                              {farcasterUser.status === "approved" && (
                                <Button
                                  buttonText={`${
                                    isCasting ? "casting..." : "cast as you"
                                  }`}
                                  buttonAction={handleCast}
                                  buttonColor="bg-green-600"
                                />
                              )}

                              <Button
                                buttonText={`copy written text and go back`}
                                buttonAction={() => {
                                  pasteText();
                                  setText("");
                                  setTime(0);
                                  setIsActive(false);
                                  router.push("/");
                                  setDisplayWritingGameLanding(false);
                                }}
                                buttonColor="bg-red-600"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-black w-2/3 md:w-1/3 rounded-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-50">
                            <button onClick={() => console.log(farcasterUser)}>
                              aloja
                            </button>
                            <p
                              className={`${righteous.className} mb-2 text-xl font-bold`}
                            >
                              great job.
                            </p>
                            <p
                              className={`${righteous.className} mb-2 text-xl font-bold`}
                            >
                              you can add what you wrote to a special notebook
                              that will be stored forever.
                            </p>

                            <div className="flex justify-center ">
                              <Button
                                buttonAction={sendTextToIrys}
                                buttonColor="bg-green-600 text-black"
                                buttonText={
                                  savingTextAnon ? "saving..." : "save text"
                                }
                              />
                              <Button
                                buttonAction={startNewRun}
                                buttonColor="bg-cyan-200 text-black"
                                buttonText="start again"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    </>
                  ) : (
                    <>
                      {countdownTarget == 0 ||
                      (countdownTarget > 0 && time === 0) ? (
                        <div className="p-4 bg-black w-2/3 md:w-fit rounded-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-50">
                          {farcasterUser.status === "approved" && (
                            <p>you are logged in on farcaster</p>
                          )}
                          <div className="flex space-x-2 flex-col md:flex-row ">
                            <Button
                              buttonText="cast anosn"
                              buttonAction={handleAnonCast}
                              buttonColor="bg-purple-600"
                            />
                            {farcasterUser.status === "approved" && (
                              <Button
                                buttonText={`${
                                  isCasting ? "casting..." : "cast as you"
                                }`}
                                buttonAction={handleCast}
                                buttonColor="bg-green-600"
                              />
                            )}

                            <Button
                              buttonText={`copy written text and go back`}
                              buttonAction={() => {
                                pasteText();
                                setText("");
                                setIsActive(false);
                                setTime(0);
                                router.push("/");
                                setDisplayWritingGameLanding(false);
                              }}
                              buttonColor="bg-red-600"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-black p-4 rounded-xl">
                          <p className="mb-2">you didnt finish</p>
                          <p className="mb-2">
                            you said you would write for {countdownTarget}{" "}
                            seconds
                          </p>
                          <p className="mb-2">
                            (what you wrote is on your clipboard)
                          </p>
                          <div className="w-fit flex space-x-2">
                            <Button
                              buttonAction={startNewCountdownRun}
                              buttonColor="bg-cyan-200 text-black"
                              buttonText="start again"
                            />
                            <Button
                              buttonAction={() => {
                                pasteText();
                                setText("");
                                setTime(0);
                                router.push("/what-is-this");
                                setDisplayWritingGameLanding(false);
                              }}
                              buttonColor="bg-red-600 text-black"
                              buttonText="copy text and escape"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopWritingGame;
