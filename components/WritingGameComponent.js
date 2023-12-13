import React, { useState, useRef, useEffect } from "react";
import { Righteous, Dancing_Script } from "next/font/google";
import Button from "./Button";
import Image from "next/image";
import { saveTextAnon } from "../lib/backend";
import { ethers } from "ethers";
import Link from "next/link";
import LoggedInUser from "./LoggedInUser";
import { useRouter } from "next/router";
import buildersABI from "../lib/buildersABI.json";

import { usePrivy } from "@privy-io/react-auth";
import Spinner from "./Spinner";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const righteous = Righteous({ weight: "400", subsets: ["latin"] });
const dancingScript = Dancing_Script({ weight: "400", subsets: ["latin"] });

const WritingGameComponent = ({
  notebookType,
  targetTime,
  notebookTypeId,
  backgroundImage,
  preloadedBackground,
  prompt,
  musicUrl,
  minimumWritingTime = 3,
  fullDisplay,
  messagesWhileUploading,
  text,
  setText,
  onFinish,
  lifeBarLength,
  setLifeBarLength,
  time,
  cancel,
  setTime,
}) => {
  const router = useRouter();
  const { login, authenticated, user } = usePrivy();
  const audioRef = useRef();
  const [preparing, setPreparing] = useState(true);
  const [saveText, setSaveText] = useState("save anon");
  const [uploadingWriting, setUploadingWriting] = useState(false);
  const [upscaledUrls, setUpscaledUrls] = useState([]);
  const [userNeedsToWriteAgain, setUserNeedsToWriteAgain] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [savingRound, setSavingRound] = useState(false);
  const [moreThanMinRun, setMoreThanMinRound] = useState(null);
  const [chosenUpscaledImage, setChosenUpscaledImage] = useState("");
  const [savingTextAnon, setSavingTextAnon] = useState(false);
  const [savedText, setSavedText] = useState(false);

  const [generatedImages, setGeneratedImages] = useState("");
  const [loadingAnkyResponse, setLoadingAnkyResponse] = useState(false);
  const [loadButtons, setLoadButtons] = useState(false);

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
  const [failureMessage, setFailureMessage] = useState("");
  const [secondLoading, setSecondLoading] = useState(false);
  const [thirdLoading, setThirdLoading] = useState(false);
  const [copyText, setCopyText] = useState("copy my writing");
  const [metadata, setMetadata] = useState(null);
  const [writingSaved, setWritingSaved] = useState(false);
  const [writingSavingLoading, setWritingSavingLoading] = useState(false);

  const [progress, setProgress] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const textareaRef = useRef(null);
  const intervalRef = useRef(null);
  const keystrokeIntervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isDone) {
      intervalRef.current = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    } else if (!isActive && !isDone) {
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
          if (time >= minimumWritingTime - 5) {
            finishRun();
          } else {
            setFinished(true);
            clearInterval(intervalRef.current);
            clearInterval(keystrokeIntervalRef.current);
            setCopyText("copy what i wrote");
            setUserNeedsToWriteAgain(true);
          }
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
    setLifeBarLength(0);
    setUserNeedsToWriteAgain(false);
    setFinished(true);
    setEndTime(Date.now());
    setIsDone(true);
    setIsActive(false);
    clearInterval(intervalRef.current);
    clearInterval(keystrokeIntervalRef.current);
    await navigator.clipboard.writeText(text);
    setMoreThanMinRound(true);
    setFailureMessage(`You're done! This run lasted ${time}.}`);
    // if (time > 3) {
    //   setLoadButtons(true);
    // }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopyText("copied");
  };

  const startNewRun = () => {
    copyToClipboard();
    setCopyText("Copy my writing");
    setTime(0);
    setLifeBarLength(100);
    setText("");
    setSavingRound(false);
    setSavedToDb(false);
    setIsDone(false);
    setFinished(false);
    setSavedText(false);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
    if (!isActive && event.target.value.length > 0) {
      setIsActive(true);
      setFailureMessage("");
      setStartTime(Date.now());
    }
    setLastKeystroke(Date.now());
  };

  const pasteText = async () => {
    await navigator.clipboard.writeText(text);
    setCopyText("copied.");
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

  if (uploadingWriting) {
    return (
      <div
        className={`${righteous.className} text-black relative overflow-y-scroll flex flex-col items-center  w-full bg-cover bg-center`}
        style={{
          boxSizing: "border-box",
          height: "calc(100vh - 33px)",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${
            preloadedBackground || "/images/mintbg.jpg"
          })`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Spinner />
        <p className="text-white">loading...</p>
        {messagesWhileUploading && messagesWhileUploading()}
      </div>
    );
  }

  return (
    <div
      className={`${righteous.className} text-black relative overflow-y-scroll  flex flex-col items-center  w-full bg-cover bg-center`}
      style={{
        boxSizing: "border-box",
        height: "calc(100vh - 33px)",
        // backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${
        //   preloadedBackground || "/images/mintbg.jpg"
        // })`,
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <audio ref={audioRef}>
        <source src="/sounds/bell.mp3" />
      </audio>
      <div className="md:block text-white  w-screen h-full ">
        <div className="flex h-full  items-center flex-col">
          <div
            className={`${righteous.className} w-full bg-black/50 pt-4 justify-center items-center flex h-24 items-center px-2 flex`}
          >
            <p
              className={`text-left h-24 w-10/12  text-purple-600 md:mt-0 text-xl overflow-y-scroll md:text-4xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}
            >
              {prompt}
            </p>
            <p className="w-2/12 text-2xl md:text-6xl text-yellow-600 h-full items-center justify-center ">
              {time}
            </p>
          </div>

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
            className={`${dancingScript.className} ${
              text ? "md:aspect-video md:flex w-full" : "w-4/5 md:w-3/5 h-48"
            } p-4 text-white ${
              time > 2 && "opacity-80"
            } placeholder-white  text-2xl border border-white rounded-md  bg-opacity-10 bg-black`}
            value={text}
            placeholder="just write..."
            onChange={handleTextChange}
          ></textarea>
          {!text && (
            <div className="w-48 mx-auto mt-8">
              <Button
                buttonText="Cancel"
                buttonColor="bg-red-600"
                buttonAction={cancel}
              />
            </div>
          )}
          {text && (
            <div
              className={`${
                text && "fade-in"
              } flex flex-col justify-center absolute top-1/2 -translate-y-1/2 items-center text-opacity-20 mb-4`}
            >
              {finished && (
                <>
                  {userNeedsToWriteAgain ? (
                    <div className="p-4 bg-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] rounded-xl  z-50">
                      <p
                        className={`${righteous.className} mb-2 text-xl font-bold`}
                      >
                        you lost.
                      </p>
                      <p
                        className={`${righteous.className} mb-2 text-xl font-bold`}
                      >
                        the minimum to move to the next stage is{" "}
                        {minimumWritingTime} seconds.
                      </p>

                      <div className="flex mx-auto justify-center">
                        <Button
                          buttonAction={copyToClipboard}
                          buttonColor="bg-cyan-200 text-black"
                          buttonText={copyText}
                        />
                        <Button
                          buttonAction={startNewRun}
                          buttonColor="bg-green-600 text-black"
                          buttonText="start again"
                        />
                        <Link passHref href="/library">
                          <Button
                            buttonText="library"
                            buttonColor="bg-purple-600"
                          />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] rounded-xl  z-50">
                      <p
                        className={`${righteous.className} mb-2 text-xl font-bold`}
                      >
                        you are ready.
                      </p>
                      <p
                        className={`${righteous.className} mb-2 text-xl font-bold`}
                      >
                        do you want to save your writing and move on?
                      </p>

                      <div className="flex justify-center ">
                        <Button
                          buttonAction={async () => {
                            setUploadingWriting(true);
                            setSavingTextAnon(true);
                            await onFinish(text);
                            startNewRun();
                            setUploadingWriting(false);
                          }}
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingGameComponent;
