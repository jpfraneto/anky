import React, { useState, useRef, useEffect } from "react";
import { Righteous, Dancing_Script } from "next/font/google";
import Button from "./Button";
import Image from "next/image";
import { WebIrys } from "@irys/sdk";
import { useWallets } from "@privy-io/react-auth";
import { saveTextAnon } from "../lib/backend";
import { ethers } from "ethers";
import { setUserData } from "../lib/idbHelper";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import LoggedInUser from "./LoggedInUser";
import { useRouter } from "next/router";
import buildersABI from "../lib/buildersABI.json";
import { encodeToAnkyverseLanguage } from "../lib/ankyverse";

import { usePrivy } from "@privy-io/react-auth";
import Spinner from "./Spinner";
import { useUser } from "../context/UserContext";

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
  setUserAppInformation,
  setThisIsTheFlag,
  userAppInformation,
  setDisplayNavbar,
  setDisplayWritingGameLanding,
  displayWritingGameLanding,
  lifeBarLength,
  farcasterUser,
  countdownTarget,
}) => {
  const mappedUserJournals =
    [] || userAppInformation?.userJournals?.map((x) => x.title);
  const router = useRouter();
  const { login, authenticated, user, getAccessToken } = usePrivy();
  const { setUserDatabaseInformation } = useUser();
  const audioRef = useRef();
  const [text, setText] = useState("");
  const [time, setTime] = useState(countdownTarget || 0);
  const [preparing, setPreparing] = useState(true);
  const [saveText, setSaveText] = useState("save anon");
  const [upscaledUrls, setUpscaledUrls] = useState([]);
  const [whatIsThis, setWhatIsThis] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [randomUUID, setRandomUUID] = useState("");
  const [savingRoundLoading, setSavingRoundLoading] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [userWantsToCastAnon, setUserWantsToCastAnon] = useState(true);
  const [savingRound, setSavingRound] = useState(false);
  const [castAs, setCastAs] = useState("");
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [moreThanMinRun, setMoreThanMinRound] = useState(null);
  const [chosenUpscaledImage, setChosenUpscaledImage] = useState("");
  const [savingTextAnon, setSavingTextAnon] = useState(false);
  const [savedText, setSavedText] = useState(false);
  const [cid, setCid] = useState("");
  const [everythingWasUploaded, setEverythingWasUploaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(!authenticated);
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
  const [journalIdToSave, setJournalIdToSave] = useState("");
  const [missionAccomplished, setMissionAccomplished] = useState(false);
  const [secondLoading, setSecondLoading] = useState(false);
  const [responseFromPinging, setResponseFromPinging] = useState("");
  const [thirdLoading, setThirdLoading] = useState(false);
  const [copyText, setCopyText] = useState("copy my writing");
  const [hardcoreContinue, setHardcoreContinue] = useState(false);
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
    try {
      const finishTimestamp = Date.now();
      if (countdownTarget === 0) setMissionAccomplished(true);
      setLifeBarLength(0);
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
      console.log("inside the finish run thing", frontendWrittenTime);

      if (frontendWrittenTime > 30) {
        pingServerToEndWritingSession(finishTimestamp, frontendWrittenTime);
      }
    } catch (error) {
      console.log("there was an error", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyText("copied");
    } catch (error) {
      console.log("there was an error copying this");
    }
  };

  const startNewRun = () => {
    try {
      audioRef.current.pause();
      setTime(0);
      setDisableButton(false);
      setLifeBarLength(100);
      setText("");
      setSavingRound(false);
      setSavedToDb(false);
      setIsDone(false);
      setFinished(false);
      setSavedText(false);
      copyToClipboard();
      setCopyText("Copy my writing");
    } catch (error) {
      console.log("there was an error in the start new run function");
    }
  };

  const startNewCountdownRun = () => {
    try {
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
      copyToClipboard();
    } catch (error) {
      console.log("there was an error");
    }
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
    const now = Date.now();
    if (!isActive && event.target.value.length > 0) {
      setDisableButton(true);
      setDisplayNavbar(false);
      setIsActive(true);
      setFailureMessage("");
      setStartTime(now);
      if (authenticated) {
        pingServerToStartWritingSession(now);
      }
    }
    setLastKeystroke(now);
  };

  async function pingServerToStartWritingSession(now) {
    console.log("inside the ping server to start writing session");
    try {
      let response;
      if (authenticated) {
        const authToken = await getAccessToken();
        response = await axios.post(
          `${apiRoute}/mana/session-start`,
          {
            timestamp: now,
            user: user.id.replace("did:privy:", ""),
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      } else {
        const newRandomUUID = uuidv4();
        setRandomUUID(newRandomUUID);
        response = await axios.post(
          `${apiRoute}/mana/anon-session-start`,
          {
            timestamp: now,
            randomUUID: newRandomUUID,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      console.log("the response is: ", response);
    } catch (error) {
      console.log("there was an error requesting to ping the serve", error);
    }
  }

  async function pingServerToEndWritingSession(now, frontendWrittenTime) {
    try {
      console.log("pinging the server to finish the writing session");
      let response;
      if (authenticated) {
        const authToken = await getAccessToken();
        response = await axios.post(
          `${apiRoute}/mana/session-end`,
          {
            timestamp: now,
            user: user.id.replace("did:privy:", ""),
            frontendWrittenTime,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${apiRoute}/mana/anon-session-end`,
          {
            timestamp: now,
            randomUUID: randomUUID,
            frontendWrittenTime,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      setResponseFromPinging(response.data.message);
      setUserDatabaseInformation((x) => {
        console.log(
          "updating the userdatabaseinformation",
          x.manaBalance,
          frontendWrittenTime
        );
        return {
          ...x,
          manaBalance: response.data.data.manaBalance,
          streak: response.data.data.activeStreak,
        };
      });
      console.log("the response is: ", response);
    } catch (error) {
      console.log("there was an error pinging the server here.", error);
    }
  }

  const pasteText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyText("copied.");
    } catch (error) {
      console.log("there was an error copying the text.");
    }
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
      alert(
        "your session ended. im working on the transition that comes now. any feedback is more than welcome."
      );
      // router.push(`/me`);
      // setTimeout(() => {
      //   setDisplayWritingGameLanding(false);
      // }, 1000);
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
    try {
      const responseFromIrys = await axios.post(`${apiRoute}/upload-writing`, {
        text,
      });
      const cid = responseFromIrys.data.cid;
      setCid(cid);

      const kannadaCid = encodeToAnkyverseLanguage(cid);

      const newCastText = `${kannadaCid}\n\nwritten as anky - you can decode this by clicking on the embed on the next cast`;

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
        }
      }
    } catch (error) {
      setIsCasting(false);
      console.error("Could not send the cast", error);
    }
  };

  async function saveTextToJournal() {
    console.log("the journal id to save is: ", journalIdToSave);
    const chosenJournal = userAppInformation.userJournals.filter(
      (x) => x.journalId == journalIdToSave
    )[0];
    console.log("the chosen journal is: ", chosenJournal);
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
    console.log("JHSALCHSAKJHCAS", chosenJournal.entries);
    if (chosenJournal.entries.length > 0) {
      previousPageCid =
        chosenJournal.entries[chosenJournal.entries.length - 1].cid;
    }
    const tags = [
      { name: "Content-Type", value: "text/plain" },
      { name: "application-id", value: "Anky Dementors" },
      { name: "container-type", value: "journal" },
      { name: "container-id", value: journalIdToSave },
      { name: "page-number", value: chosenJournal.entries.length.toString() },
      {
        name: "smart-contract-address",
        value: process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
      },
      {
        name: "previous-page",
        value: previousPageCid.toString(),
      },
    ];
    try {
      const receipt = await webIrys.upload(text, { tags });
      console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
      let newJournalEntry;
      setUserAppInformation((x) => {
        // Find the specific journal index by its id
        const journalIndex = x.userJournals.findIndex(
          (j) => j.journalId == journalIdToSave
        );

        newJournalEntry = {
          text: text,
          timestamp: new Date().getTime(),
          pageNumber: chosenJournal.entries.length,
          previousPageCid: previousPageCid,
          cid: receipt.id,
        };

        const updatedJournal = {
          ...x.userJournals[journalIndex],
          entries: [...x.userJournals[journalIndex].entries, newJournalEntry],
        };

        const updatedUserJournals = [
          ...x.userJournals.slice(0, journalIndex),
          updatedJournal,
          ...x.userJournals.slice(journalIndex + 1),
        ];

        setUserData("userJournals", updatedUserJournals);

        return {
          ...x,
          userJournals: updatedUserJournals,
        };
      });

      // setJournal((x) => {
      //   return {
      //     ...x,
      //     entries: [...chosenJournal.entries, newJournalEntry],
      //   };
      // });

      setLifeBarLength(0);
    } catch (e) {
      console.log("Error uploading data ", e);
    }
  }

  async function handleSaveRun() {
    try {
      setSavingRoundLoading(true);
      console.log(
        "INSIDE THE SAVE RUN",
        castAs,
        userWantsToCastAnon,
        journalIdToSave,
        authenticated
      );
      if (castAs == "anon" || userWantsToCastAnon) await handleAnonCast();
      if (castAs == "me") await handleCast();
      if (journalIdToSave != "") {
        await saveTextToJournal();
      } else {
        if (authenticated) await sendTextToIrys();
      }
      setEverythingWasUploaded(true);
      setSavingRoundLoading(true);
    } catch (error) {
      console.log("there was an error in here, saving the run", error);
      setThereWasAnError(true);
    }
  }

  const handleAnonCast = async () => {
    try {
      setIsCasting(true);
      if (!authenticated) setSavingRoundLoading(true);
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
      setCastHash(response.data.cast.hash);

      if (response.status === 200) {
        setText(""); // Clear the text field
        router.push(`https://www.anky.lat/r/${response.data.cast.hash}`);
        setDisplayWritingGameLanding(false);
      }
    } catch (error) {
      alert("there was an error casting your cast anon");
      console.log(error);
    }
  };

  if (errorProblem)
    return (
      <div
        className={`${righteous.className} text-white relative flex flex-col items-center justify-center w-full bg-cover bg-center`}
        style={{
          boxSizing: "border-box",
          height: "calc(100vh)",
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
              className={`text-left h-fit w-10/12 text-purple-600 md:mt-0 text-xl md:text-3xl overflow-y-scroll  drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}
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
              } p-4 text-white opacity-80 placeholder-white text-xl border placeholder:text-gray-300 border-white rounded-md bg-opacity-10 bg-black`}
              placeholder="write here.."
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
                        setThisIsTheFlag(true);
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
                          setDisplayWritingGameLanding(false);
                          router.back();
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {everythingWasUploaded ? (
            <>
              {thereWasAnError ? (
                <p>
                  there was an error, but you wrote. that is the important part.
                  i will fix stuff asap.
                </p>
              ) : (
                <div
                  className={`${
                    text && "fade-in"
                  } flex flex-col justify-center items-center absolute w-screen top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-opacity-20 mb-4`}
                >
                  everything was was was uploaded.
                </div>
              )}
            </>
          ) : (
            <>
              {text && (
                <div
                  className={`${
                    text && "fade-in"
                  } flex flex-col justify-center items-center absolute w-screen top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-opacity-20 mb-4`}
                >
                  {finished && (
                    <div className="border-white border-2 mx-16 md:mx-auto w-5/6 md:w-2/3 rounded-xl bg-black p-4 text-white">
                      <p className="text-3xl">Save this run</p>
                      {time < 30 ? (
                        <p className="text-red-400 text-sm">
                          *you need to write more than 30 seconds{" "}
                          {!authenticated && "(and log in)"} to earn $NEWEN
                        </p>
                      ) : (
                        <p className="text-red-400 text-sm">
                          {!authenticated
                            ? "you need to be logged in to earn $NEWEN"
                            : responseFromPinging}
                        </p>
                      )}
                      {farcasterUser.status == "approved" && (
                        <div className="bg-purple-500 text-black p-2 my-2 rounded-xl flex space-x-2 items-center justify-center">
                          {farcasterUser.status == "approved" && (
                            <div className="flex space-x-2 items-center">
                              <p>send to farcaster?</p>
                              <div className="flex space-x-2">
                                <p
                                  onClick={() => setCastAs("")}
                                  className={` p-2 border-black   cursor-pointer rounded-xl ${
                                    castAs == ""
                                      ? "bg-red-500 shadow-md shadow-black border-2"
                                      : "bg-red-200 hover:bg-red-300 "
                                  }`}
                                >
                                  don&apos;t cast
                                </p>
                                <p
                                  onClick={() => {
                                    setCastAs("me");
                                    setUserWantsToCastAnon(false);
                                  }}
                                  className={` p-2 border-black  cursor-pointer rounded-xl ${
                                    castAs == "me"
                                      ? "bg-green-500 shadow-md shadow-black border-2"
                                      : "bg-green-300 hover:bg-green-300"
                                  }`}
                                >
                                  cast as {farcasterUser.fid}
                                </p>
                                <p
                                  onClick={() => {
                                    setCastAs("anon");
                                    setUserWantsToCastAnon(true);
                                  }}
                                  className={` p-2 border-black   cursor-pointer rounded-xl ${
                                    castAs == "anon"
                                      ? "bg-purple-600 shadow-md shadow-black border-2"
                                      : "bg-purple-300 hover:bg-purple-300"
                                  }`}
                                >
                                  cast anon
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {authenticated && userAppInformation.userJournals && (
                        <div className="bg-purple-500 text-black p-2 my-2 rounded-xl flex space-x-2 items-center justify-center">
                          <p>save to journal? </p>
                          {userAppInformation.userJournals &&
                            userAppInformation.userJournals.length > 0 && (
                              <div>
                                <select
                                  onChange={(e) => {
                                    console.log("in here", e.target.value);
                                    setJournalIdToSave(e.target.value);
                                  }}
                                  className="p-2 text-black rounded-xl my-2"
                                >
                                  <option value="">
                                    don&apos;t save to journal
                                  </option>
                                  {userAppInformation.userJournals.map(
                                    (x, i) => {
                                      return (
                                        <option key={i} value={x.journalId}>
                                          {x.title}
                                        </option>
                                      );
                                    }
                                  )}
                                </select>
                              </div>
                            )}
                        </div>
                      )}

                      {!farcasterUser ||
                        (farcasterUser.status != "approved" && (
                          <div className="bg-purple-600 p-3 mt-2 mb-0 w-fit rounded-xl mx-auto flex justify-center ">
                            <p className="text-black">
                              do you want to cast your writing anon?
                            </p>
                            <input
                              className="mx-4"
                              type="checkbox"
                              onChange={(e) => {
                                setUserWantsToCastAnon(!userWantsToCastAnon);
                              }}
                              checked={userWantsToCastAnon}
                            />
                          </div>
                        ))}
                      {missionAccomplished ||
                      (countdownTarget > 0 && time === 0) ? (
                        <>
                          <>
                            {farcasterUser.status == "approved" ? (
                              <div className="p-4 bg-black w-full mx-auto md:w-fit rounded-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-50">
                                <div className="flex flex-col md:flex-row md:space-y-0 justify-center w-full space-y-2 space-x-2 mt-0">
                                  <Button
                                    buttonText={
                                      savingRoundLoading
                                        ? `saving...`
                                        : `save run`
                                    }
                                    buttonAction={handleSaveRun}
                                    buttonColor="bg-green-600"
                                  />
                                  <Button
                                    buttonText={`copy written text and go back`}
                                    buttonAction={() => {
                                      pasteText();
                                      startNewRun();
                                      setDisplayWritingGameLanding(false);
                                      setThisIsTheFlag(true);
                                      setTimeout(() => {
                                        router.push("/");
                                      }, 10);
                                    }}
                                    buttonColor="bg-red-600"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-black  md:w-full rounded-xl mx-auto drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-50">
                                <div className="flex flex-col items-center md:flex-row md:space-y-0 justify-center w-full space-y-2 mt-2">
                                  {userWantsToCastAnon && (
                                    <Button
                                      buttonText={
                                        savingRoundLoading
                                          ? `saving...`
                                          : `cast anon`
                                      }
                                      buttonAction={handleSaveRun}
                                      buttonColor="bg-green-600 w-32"
                                    />
                                  )}
                                  <Button
                                    buttonText={`copy written text and go back`}
                                    buttonAction={() => {
                                      setFinished(false);
                                      // pasteText();
                                      // startNewRun();
                                      // setDisplayWritingGameLanding(false);
                                      // setThisIsTheFlag(true);
                                      // setTimeout(() => {
                                      //   router.push("/");
                                      // }, 10);
                                    }}
                                    buttonColor="bg-red-600"
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
                              <div className="flex space-x-2 flex-col md:flex-row ">
                                <Button
                                  buttonAction={handleSaveRun}
                                  buttonColor="bg-green-600 text-black"
                                  buttonText={
                                    savingTextAnon ? "saving..." : "save text"
                                  }
                                />

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
                            <div className="bg-black p-4 flex flex-col items-center rounded-xl">
                              <p className="mb-2">you didnt finish</p>
                              <p className="mb-2">
                                you said you would write for {countdownTarget}
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
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {hardcoreContinue ||
        (!authenticated && (
          <div
            className={`${
              text && "fade-in"
            } flex flex-col justify-center text-white items-center absolute bg-black h-full opacity-80 w-full py-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mb-4`}
          >
            {farcasterUser?.fid && (
              <div className="flex flex-col h-fit justify-center items-center w-fit p-12 ">
                <p>you are only logged in with farcaster</p>
                <p>
                  if you want to store your writings inside this system, login
                  down here:
                </p>
                <div className="flex  space-x-2">
                  <Button
                    buttonAction={login}
                    buttonText="login"
                    buttonColor="bg-green-600 mx-auto w-fit my-2"
                  />
                  <Button
                    buttonAction={() => {
                      setShowOverlay(false);
                      setHardcoreContinue(true);
                    }}
                    buttonText="continue without logging in"
                    buttonColor="bg-purple-600 mx-auto w-fit my-2"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      <Overlay show={showOverlay && !authenticated && !farcasterUser?.fid}>
        <div className="flex flex-col h-full justify-center items-center w-full ">
          <div className="flex flex-col text-white h-48">
            <p>you haven&apos;t logged in</p>
            <p>you won&apos;t be able to store your writings forever</p>
            <div className="flex justify-center">
              <Button
                buttonAction={login}
                buttonText="log in"
                buttonColor="bg-green-600 mx-auto w-fit my-2"
              />
              <Button
                buttonAction={() => {
                  setShowOverlay(false);
                  setHardcoreContinue(true);
                }}
                buttonText="continue anon"
                buttonColor="bg-purple-600 mx-auto w-fit my-2"
              />
            </div>
            <p
              onClick={() => setWhatIsThis(!whatIsThis)}
              className={`small  ${
                whatIsThis ? "text-purple-400" : "text-gray-300"
              } hover:text-purple-400 cursor-pointer mb-2`}
            >
              what is this?
            </p>
            {whatIsThis && (
              <div>
                <p className="text-white mb-2">just write</p>
                <p className="text-white">it is all an excuse</p>
              </div>
            )}
          </div>
        </div>
      </Overlay>
    </div>
  );
};

const Overlay = ({ show, children }) => {
  if (!show) return null;

  return (
    <div className="fixed top-0 h-screen w-screen left-0 right-0 bottom-0 bg-black bg-opacity-60 z-40">
      {children}
    </div>
  );
};

export default DesktopWritingGame;
