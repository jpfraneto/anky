import React, { useState, useRef, useEffect } from "react";
import { Righteous, Dancing_Script } from "next/font/google";
import Button from "./Button";
import Image from "next/image";
import { WebIrys } from "@irys/sdk";
import { useWallets } from "@privy-io/react-auth";
import { LuCopyCheck, LuCopy } from "react-icons/lu";
import { setUserData } from "../lib/idbHelper";
import { v4 as uuidv4 } from "uuid";
import { PiPillFill } from "react-icons/pi";
import axios from "axios";
import { useRouter } from "next/router";
import { BsArrowRepeat } from "react-icons/bs";
import { FaRegCommentAlt, FaRegHeart } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { usePrivy } from "@privy-io/react-auth";
import Spinner from "./Spinner";
import { useUser } from "../context/UserContext";
import { useSettings } from "../context/SettingsContext";
import IndividualDecodedCastCard from "./farcaster/IndividualDecodedCastCard";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const BigOverlay = ({ show, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      {children}
    </div>
  );
};

const righteous = Righteous({ weight: "400", subsets: ["latin"] });
const dancingScript = Dancing_Script({ weight: "400", subsets: ["latin"] });

const DesktopWritingGame = ({
  theAsyncCastToReply = null,
  userPrompt,
  setLifeBarLength,
  setLoadButtons,
  ankyverseDate,
  gamePrompts = {},
  setDisableButton,
  castWrapper = null,
  setUserAppInformation,
  setThisIsTheFlag,
  userAppInformation,
  parentCastForReplying,
  setDisplayNavbar,
  setDisplayWritingGameLanding,
  displayWritingGameLanding,
  setDisplaySettingsModal,
  lifeBarLength,
  farcasterUser,
  countdownTarget,
  text,
  setText,
}) => {
  const mappedUserJournals =
    [] || userAppInformation?.userJournals?.map((x) => x.title);
  const router = useRouter();
  const { login, authenticated, user, getAccessToken, sendTransaction } =
    usePrivy();
  const { userSettings, setUserSettings } = useSettings();
  const [textareaHeight, setTextareaHeight] = useState("20vh"); // default height
  const {
    setUserDatabaseInformation,
    setAllUserWritings,
    userDatabaseInformation,
  } = useUser();
  const audioRef = useRef();

  const [maxTimeBetweenKeystrokes, setMaxTimeBetweenKeystrokes] = useState(
    userSettings.secondsBetweenKeystrokes
  );

  const [displayChangeTimeForWriting, setDisplayChangeTimeForWriting] =
    useState(false);
  const [amountOfManaAdded, setAmountOfManaAdded] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const tracks = [
    "/music/uno.mp3",
    "/music/dos.mp3",
    "/music/tres.mp3",
    "/music/cuatro.mp3",
    "/music/cinco.mp3",
  ];

  const [time, setTime] = useState(countdownTarget || 0);
  const [bottomMessage, setBottomMessage] = useState("");
  const [whatIsThis, setWhatIsThis] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [randomUUID, setRandomUUID] = useState("");
  const [savingRoundLoading, setSavingRoundLoading] = useState(false);
  const [userWantsFeedbackFromAnky, setUserWantsFeedbackFromAnky] =
    useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [userWantsToCastAnon, setUserWantsToCastAnon] = useState(true);
  const [savingRound, setSavingRound] = useState(false);
  const [castAs, setCastAs] = useState("anon");
  const [showMusicModal, setShowMusicModal] = useState(true); // For controlling the visibility of the modal
  const [playMusic, setPlayMusic] = useState(false);
  const [
    userWantsToCreateImageFromWriting,
    setUserWantsToCreateImageFromWriting,
  ] = useState(true);
  const [castForPreview, setCastForPreview] = useState(null);
  const [userWantsToStoreWritingForever, setUserWantsToStoreWritingForever] =
    useState(true);
  const [displayAnkyExamples, setDisplayAnkyExamples] = useState(false);
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [moreThanMinRun, setMoreThanMinRound] = useState(null);
  const [savingTextAnon, setSavingTextAnon] = useState(false);
  const [savedText, setSavedText] = useState(false);
  const [backgroundVisible, setBackgroundVisible] = useState(false);
  const [cid, setCid] = useState("");
  const [sessionIsOver, setSessionIsOver] = useState(false);
  const [previewCast, setPreviewCast] = useState(false);
  const [userWantsToEncryptWriting, setUserWantsToEncryptWriting] =
    useState(false);
  const [everythingWasUploaded, setEverythingWasUploaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(!authenticated);
  const [copyToClipboardState, setCopyToClipboardState] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const [lastKeystroke, setLastKeystroke] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [errorProblem, setErrorProblem] = useState(false);
  const [castHash, setCastHash] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [savingSessionState, setSavingSessionState] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const [journalIdToSave, setJournalIdToSave] = useState("");
  const [missionAccomplished, setMissionAccomplished] = useState(false);
  const [responseFromPinging, setResponseFromPinging] = useState("");
  const [copyText, setCopyText] = useState("copy my writing");
  const [hardcoreContinue, setHardcoreContinue] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const { wallets } = useWallets();

  const textareaRef = useRef(null);
  const intervalRef = useRef(null);
  const keystrokeIntervalRef = useRef(null);
  const thisWallet = wallets[0];

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const handleResize = () => {
    if (isKeyboardOpen) {
      // Adjust the height of the textarea when the keyboard is open
      const availableHeight = window.innerHeight;
      if (textareaRef.current) {
        textareaRef.current.style.height = `${availableHeight * 0.6}px`; // Adjust the 0.6 (60%) as necessary
      }
    } else {
      // Reset the height of the textarea when the keyboard is closed
      if (textareaRef.current) {
        textareaRef.current.style.height = "64px"; // Reset to default height or any other value as needed
      }
    }
  };

  useEffect(() => {
    // Play music when playMusic is true and there's a track to play
    if (playMusic && audioRef.current && tracks[currentTrackIndex]) {
      audioRef.current.src = tracks[currentTrackIndex]; // Set current track source
      audioRef.current.play();
    }
  }, [playMusic, currentTrackIndex]);

  const handlePlayMusic = () => {
    setPlayMusic(true);
    setShowMusicModal(false); // Hide modal after selection
  };

  const handleSkipMusic = () => {
    setShowMusicModal(false); // Hide modal without playing music
  };

  const handleTrackEnd = () => {
    // Move to the next track, or loop back to the first one
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isKeyboardOpen]);

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
        if (
          elapsedTime > userSettings.secondsBetweenKeystrokes * 1000 &&
          !isDone
        ) {
          finishRun();
        } else {
          // calculate life bar length
          const newLifeBarLength =
            100 - elapsedTime / (10 * userSettings.secondsBetweenKeystrokes); // 100% - (elapsed time in seconds * (100 / 3))
          setLifeBarLength(Math.max(newLifeBarLength, 0)); // do not allow negative values
        }
      }, 100);
    } else {
      clearInterval(keystrokeIntervalRef.current);
    }

    return () => clearInterval(keystrokeIntervalRef.current);
  }, [isActive, lastKeystroke]);

  const resetKeyboardState = () => {
    setIsKeyboardOpen(false);
    handleResize();
  };

  const finishRun = async () => {
    try {
      const finishTimestamp = Date.now();
      if (countdownTarget === 0) setMissionAccomplished(true);
      setModalVisible(true);
      setSessionIsOver(true);
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

      if (frontendWrittenTime > 30 && authenticated) {
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
      setTime(0);
      setDisableButton(false);
      setLifeBarLength(100);
      setText("");
      setSavingRound(false);
      setSavedToDb(false);
      setIsDone(false);
      setFinished(false);
      setSavedText(false);
      // copyToClipboard();
      setCopyText("Copy my writing");
    } catch (error) {
      console.log("there was an error in the start new run function");
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
    if (!text && event.target.value.length > 0) {
      setIsKeyboardOpen(true);
    }
    setLastKeystroke(now);
  };

  async function pingServerToStartWritingSession(now) {
    try {
      let response;
      if (authenticated) {
        const authToken = await getAccessToken();
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/session-start`,
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
          `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/anon-session-start`,
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
    } catch (error) {
      console.log("there was an error requesting to ping the serve", error);
    }
  }

  async function pingServerToEndWritingSession(now, frontendWrittenTime) {
    try {
      let response;
      if (authenticated) {
        const authToken = await getAccessToken();
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/session-end`,
          {
            timestamp: now,
            user: user.id.replace("did:privy:", ""),
            frontendWrittenTime,
            dataForCalculatingMultiplier: {
              amountOfKeystrokes: "",
              keystrokesPerMinute: "",
              backkeystrokes: "",
              newenMultiplierFromSpeed: 1,
            },
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
          `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/anon-session-end`,
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
      setAmountOfManaAdded(frontendWrittenTime);
      setResponseFromPinging(response.data.message);
      setUserDatabaseInformation((x) => {
        return {
          ...x,
          manaBalance: response.data.data.manaBalance,
          streak: response.data.data.activeStreak,
        };
      });
    } catch (error) {
      console.log("there was an error pinging the server here.", error);
    }
  }

  const pasteText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyText("copied.");
      setCopyToClipboardState(true);
      setTimeout(() => {
        setCopyToClipboardState(false);
      }, 1500);
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
    const getWebIrys = async () => {
      const url = "https://node2.irys.xyz";
      const token = "base-eth";

      const provider = await thisWallet?.getEthersProvider();
      // const ethereumProvider = await thisWallet?.getEthereumProvider();
      // const provider = await ethereumProvider.provider;

      if (!provider) throw new Error(`Cannot find privy wallet`);

      const rpcURL = "https://mainnet.base.org";
      const irysWallet =
        thisWallet?.walletClientType === "privy"
          ? {
              name: "privy-embedded",
              provider,
              sendTransaction,
            }
          : { name: "privy", provider };

      const webIrys = new WebIrys({
        url: url,
        token: token,
        wallet: irysWallet,
        config: { providerUrl: rpcURL },
      });

      await webIrys.ready();
      return webIrys;
    };
    const webIrys = await getWebIrys();
    const tags = [
      { name: "Content-Type", value: "text/plain" },
      { name: "application-id", value: "Anky Dementors" },
      { name: "container-type", value: "community-notebook" },
    ];
    try {
      const receipt = await webIrys.upload(text, { tags });
      return receipt;
    } catch (error) {
      console.log("there was an error uploading the text");
      console.log("the error is:", error);
      // setDisplayWritingGameLanding(false);
    }
  };

  const handleCast = async (cid) => {
    if (!text) return alert("please write something");
    setIsCasting(true);
    try {
      let forEmbedding;
      if (text.length > 320) {
        forEmbedding = [{ url: `https://www.anky.lat/i/${cid || cid.id}` }];
      }
      const newCastText = text.length > 320 ? `${text.slice(0, 317)}...` : text;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/cast`,
        {
          text: newCastText,
          signer_uuid: farcasterUser.signerUuid,
          embeds: forEmbedding,
          parent:
            parentCastForReplying || "https://warpcast.com/~/channel/anky",
          cid: cid,
          manaEarned: amountOfManaAdded,
        }
      );

      if (response.status === 200) {
        setCastHash(response.data.cast.hash);
        return response.data.cast.hash;
      }
    } catch (error) {
      setIsCasting(false);
      console.error("Could not send the cast", error);
    }
  };

  async function saveTextToJournal() {
    const chosenJournal = userAppInformation.userJournals.filter(
      (x) => x.journalId == journalIdToSave
    )[0];
    const getWebIrys = async () => {
      if (!thisWallet) return;
      const url = "https://node2.irys.xyz";
      const token = "ethereum";
      const rpcURL = "";

      const providerResponse = await thisWallet.getEthereumProvider();
      const provider = providerResponse.provider;
      console.log("inside here,asdasdjas", provider);
      if (!provider) throw new Error(`Cannot find privy wallet`);

      const irysWallet =
        thisWallet?.walletClientType === "privy"
          ? { name: "privy-embedded", provider, sendTransaction }
          : { name: "privy", provider };

      const webIrys = new WebIrys({ url, token, wallet: irysWallet });
      await webIrys.ready();
      return webIrys;
    };
    const webIrys = await getWebIrys();
    let previousPageCid = 0;
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
      return receipt;
    } catch (e) {
      console.log("Error uploading data ", e);
    }
  }

  const handleAnonCast = async (irysResponseCid = null) => {
    try {
      setIsCasting(true);
      let responseFromIrys, cid;
      if (!authenticated) setSavingRoundLoading(true);
      if (!irysResponseCid) {
        responseFromIrys = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/upload-writing`,
          {
            text,
          }
        );
        cid = responseFromIrys.data.cid;
      } else {
        cid = irysResponseCid;
      }
      let forEmbedding;
      if (text.length > 320) {
        forEmbedding = [{ url: `https://www.anky.lat/i/${cid}` }];
      }
      const newCastText = text.length > 320 ? `${text.slice(0, 317)}` : text;

      let forReplyingVariable = "https://warpcast.com/~/channel/anky";
      if (theAsyncCastToReply) {
        forReplyingVariable = theAsyncCastToReply.hash;
      } else if (parentCastForReplying) {
        forReplyingVariable = parentCastForReplying;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/cast/anon`,
        {
          time: time,
          cid: cid,
          manaEarned: amountOfManaAdded,
          text: newCastText,
          parent: forReplyingVariable,
          embeds: forEmbedding,
        }
      );

      // setCastHash(response.data.cast.hash);
      return {
        castHash: response.data.cast.hash,
        responseFromIrys: responseFromIrys || irysResponseCid,
      };
    } catch (error) {
      alert("there was an error casting your cast anon");
      console.log(error);
    }
  };

  async function handleSaveSession() {
    try {
      let castResponse,
        irysResponseCid,
        irysResponseReceipt,
        responseFromIrys,
        publishedCast;
      publishedCast = { cast: {}, pfp: "", userInfo: null };
      setSavingSessionState(true);
      if (authenticated) {
        if (journalIdToSave) {
          irysResponseReceipt = await saveTextToJournal();
        } else {
          if (userWantsToStoreWritingForever) {
            irysResponseReceipt = await sendTextToIrys();
            irysResponseCid = irysResponseReceipt.id;
          } else {
            responseFromIrys = await axios.post(
              `${process.env.NEXT_PUBLIC_API_ROUTE}/upload-writing`,
              {
                text,
              }
            );
            console.log(
              "in here, the response from irys is: ?",
              responseFromIrys
            );
            irysResponseCid = responseFromIrys.data.cid;
          }
        }
      }
      if (!authenticated) {
        if (userWantsToCastAnon) {
          castResponse = await handleAnonCast();
          irysResponseCid = castResponse.responseFromIrys.data.cid;
        } else {
          setDisplayWritingGameLanding(false);
          setTimeout(() => {
            startNewRun();
          }, 4000);
          return router.push("/welcome");
        }
      }

      if (
        (authenticated && farcasterUser.signerStatus == "approved") ||
        (authenticated && farcasterUser.status == "approved")
      ) {
        if (castAs == "me") {
          castResponse = await handleCast(irysResponseCid);
        } else if (castAs == "anon") {
          castResponse = await handleAnonCast();
        }
        if (userWantsToStoreWritingForever) {
          setAllUserWritings((x) => [
            {
              cid: irysResponseCid,
              text: text,
              timestamp: new Date().getTime(),
            },
            ...x,
          ]);
        }
      }
      if (time > 30 && userWantsToCreateImageFromWriting) {
        const authToken = await getAccessToken();
        const responseFromMidjourneyServer = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ai/process-writing`,
          {
            text,
            cid: irysResponseCid,
            userFid: farcasterUser?.fid || 18350,
            parentCastHash: castResponse.castHash,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
      }

      startNewRun();
      setDisplayWritingGameLanding(false);
      router.push(`/i/${irysResponseCid}`, null, { shallow: true });
      setModalVisible(false);
    } catch (error) {
      console.log(
        "There was an error in the handle finish session function",
        error
      );
      setThereWasAnError(true);
    }
  }

  function renderSessionIsOver() {
    return (
      <BigOverlay show={modalVisible}>
        <div
          className={`${
            text && "fade-in"
          } flex flex-col justify-center items-center absolute w-screen top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-opacity-20 mb-4`}
        >
          <div
            className={`relative  text-2xl border-white border-2 mx-16 md:mx-auto w-5/6 md:w-2/3 xl:w-2/5 rounded-xl ${
              backgroundVisible ? "bg-transparent" : "bg-black"
            } p-2 text-white`}
          >
            <span className="absolute top-2 right-2 cursor-pointer ">
              {copyToClipboardState ? (
                <LuCopyCheck className="text-yellow-600" />
              ) : (
                <LuCopy onClick={pasteText} className="hover:text-yellow-600" />
              )}
            </span>
            <p className="text-2xl md:text-3xl">your writing session is over</p>
            {time < 30 ? (
              <p className="text-red-400 text-lg">
                *maybe that was a bit fast. the interface recognizes when you
                write, and it is set to end your session after{" "}
                {userSettings.secondsBetweenKeystrokes} seconds without writing.
                you can change that{" "}
                <span
                  onClick={() => {
                    setDisplayChangeTimeForWriting(
                      !displayChangeTimeForWriting
                    );
                  }}
                  className="text-purple-500 hover:text-yellow-600 cursor-pointer"
                >
                  HERE
                </span>
              </p>
            ) : (
              <p className="text-red-400 text-sm">
                {!authenticated
                  ? "for the next time, you can login before writing and you will earn $newen"
                  : responseFromPinging}
              </p>
            )}
            {displayAnkyExamples && (
              <div className="flex text-xl flex-col border-white border-2 w-full h-fit px-1 py-2 bg-purple-200 text-black rounded-xl relative">
                <p className="mb-2">this is how some of them look:</p>
                <div className="flex">
                  <div className="w-1/4 mx-1 aspect-square relative">
                    <Image src="/images/generated-ankys/1.png" fill />
                  </div>
                  <div className="w-1/4 mx-1 aspect-square relative">
                    <Image src="/images/generated-ankys/2.png" fill />
                  </div>
                  <div className="w-1/4 mx-1 aspect-square relative">
                    <Image src="/images/generated-ankys/3.png" fill />
                  </div>
                  <div className="w-1/4 mx-1 aspect-square relative">
                    <Image src="/images/generated-ankys/4.png" fill />
                  </div>
                </div>
              </div>
            )}
            {displayChangeTimeForWriting && (
              <div className="mt-4 flex flex-col border-white border-2 w-full h-fit px-1 py-2 bg-purple-800 text-gray-400 rounded-xl relative">
                <span
                  className="absolute right-1 top-1 text-red-600 cursor-pointer"
                  onClick={() => setDisplayChangeTimeForWriting(false)}
                >
                  X
                </span>
                <span className=" mb-2">
                  <span className="text-2xl text-yellow-600">
                    {maxTimeBetweenKeystrokes}
                  </span>{" "}
                  seconds between keystrokes before your writing session ends
                </span>
                <input
                  className="w-full"
                  type="range"
                  min={1}
                  max={8}
                  value={maxTimeBetweenKeystrokes}
                  onChange={(e) => setMaxTimeBetweenKeystrokes(e.target.value)}
                />
                <span className=" mb-2">
                  you will earn{" "}
                  <span className="text-xl text-yellow-600">
                    {Math.floor(300 / maxTimeBetweenKeystrokes)}%
                  </span>{" "}
                  of the amount of newen for each second written.
                </span>
              </div>
            )}

            {authenticated &&
            (farcasterUser.status == "approved" ||
              farcasterUser.signerStatus == "approved") ? (
              <div className="bg-purple-500 text-black p-2 my-2 rounded-xl flex space-x-2 items-center justify-center">
                <div className="w-full flex flex-col">
                  <div className="flex  md:flex-row flex-col space-x-2 items-center justify-center">
                    <p className="mb-2">share on farcaster?</p>
                    <div className="flex  space-x-2">
                      <p
                        onClick={() => setCastAs("")}
                        className={` p-2 border-black   cursor-pointer rounded-xl ${
                          castAs == ""
                            ? "bg-red-500 shadow-md shadow-black border-2"
                            : "bg-red-200 hover:bg-red-300 "
                        }`}
                      >
                        don&apos;t {theAsyncCastToReply ? "reply" : "cast"}
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
                        {theAsyncCastToReply ? "reply" : "cast"} as{" "}
                        {farcasterUser.fid}
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
                        {theAsyncCastToReply ? "reply" : "cast"} anon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {time > 30 && (
                  <div className="bg-purple-500 text-black p-3 my-2 rounded-xl flex space-x-2 items-center justify-center">
                    {time > 30 && (
                      <div className="h-fit flex justify-center mx-auto items-center">
                        <p className="text-left text-black">
                          do you want to share what you wrote anonymously on
                          farcaster?
                        </p>
                        <input
                          className="mx-4 w-10 h-10 rounded-xl bg-purple-600"
                          type="checkbox"
                          onChange={(e) => {
                            if (time < 30) {
                              setBottomMessage(true);
                            } else {
                              setUserWantsToCastAnon(!userWantsToCastAnon);
                            }
                          }}
                          checked={userWantsToCastAnon}
                        />
                        {time < 30 && bottomMessage && (
                          <small className="text-xs text-red-400">
                            if you had written for at least 30 seconds, you
                            could transform what you just wrote into a unique
                            anky. go can try again if you want, by tapping{" "}
                            <span
                              className="text-yellow-600 text-xl hover:text-purple-300 cursor-pointer"
                              onClick={() => {
                                setBackgroundVisible(true);
                                setModalVisible(false);
                                startNewRun();
                                setBottomMessage(false);
                              }}
                            >
                              here
                            </span>
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {authenticated && (
              <div className="bg-purple-500 text-black p-3 my-2 rounded-xl flex space-x-2 items-center justify-center">
                <div className="flex">
                  <p className="text-black text-left">
                    do you want to save your writing forever (associated with
                    your wallet address)
                  </p>
                  <input
                    className="mx-4 w-10 h-10 rounded-xl bg-purple-600"
                    type="checkbox"
                    onChange={(e) => {
                      setUserWantsToStoreWritingForever(
                        !userWantsToStoreWritingForever
                      );
                    }}
                    checked={userWantsToStoreWritingForever}
                  />
                </div>

                {userWantsToStoreWritingForever &&
                  authenticated &&
                  userAppInformation.userJournal && (
                    <div className="flex bg-purple-500 p-2 mt-2 rounded-xl">
                      <div className="bg-purple-500 text-black px-2 my-2 rounded-xl w-full flex space-x-2 items-center justify-center">
                        <p>save to journal? </p>
                        {userAppInformation.userJournals &&
                          userAppInformation.userJournals.length > 0 && (
                            <div>
                              <select
                                onChange={(e) => {
                                  setJournalIdToSave(e.target.value);
                                }}
                                className="p-2 text-black rounded-xl my-2"
                              >
                                <option value="">
                                  don&apos;t save to journal
                                </option>
                                {userAppInformation.userJournals.map((x, i) => {
                                  return (
                                    <option key={i} value={x.journalId}>
                                      {x.title}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {time > 30 && userWantsToCastAnon && (
              <div className="bg-purple-500 text-black p-3 my-2 rounded-xl flex space-x-2 items-center justify-center">
                <div className="flex flex-col">
                  <p className="text-left text-black flex">
                    do you want to create a custom anky with your writing?
                    <span
                      className="border border-black px-2 py-1 h-fit hover:bg-purple-600 cursor-pointer rounded-xl"
                      onClick={() =>
                        setDisplayAnkyExamples(!displayAnkyExamples)
                      }
                    >
                      ?
                    </span>
                  </p>
                  {userDatabaseInformation?.manaBalance && (
                    <small className="text-xs">
                      your balance is {userDatabaseInformation.manaBalance}{" "}
                      $newen
                    </small>
                  )}
                </div>

                <input
                  className="mx-4 w-10 h-10 rounded-xl bg-purple-600"
                  type="checkbox"
                  onChange={(e) => {
                    if (userWantsToCastAnon) {
                      setUserWantsToCreateImageFromWriting(
                        !userWantsToCreateImageFromWriting
                      );
                    } else {
                      alert(
                        "you need to cast anonymously for us to know where to share the image with you"
                      );
                    }
                  }}
                  checked={userWantsToCreateImageFromWriting}
                />
              </div>
            )}

            <div className="flex flex-col md:flex-row  justify-center mt-4 md:mt-0">
              {" "}
              {time > 30 ? (
                <Button
                  buttonText={
                    savingSessionState
                      ? "broadcasting..."
                      : userWantsToCastAnon
                      ? castAs == ""
                        ? "dont cast and close"
                        : `cast ${
                            userWantsToCreateImageFromWriting
                              ? `${castAs} and create custom anky`
                              : `${castAs}`
                          }`
                      : castAs == "me"
                      ? `cast as ${farcasterUser.fid}`
                      : "copy writing and end session"
                  }
                  buttonAction={handleSaveSession}
                  buttonColor="mt-2 md:mt-0 bg-green-600"
                />
              ) : (
                <div className="flex w-full justify-center">
                  <Button
                    buttonText={"try again"}
                    buttonAction={() => {
                      setSessionIsOver(false);
                      startNewRun();
                    }}
                    buttonColor="mt-2 md:mt-0 mx-2 bg-green-600"
                  />
                  <Button
                    buttonText={"copy writing and close"}
                    buttonAction={() => {
                      copyToClipboard();
                      startNewRun();
                      setDisplayWritingGameLanding(false);
                    }}
                    buttonColor="mt-2 md:mt-0 mx-2 bg-purple-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </BigOverlay>
    );
  }

  if (errorProblem)
    return (
      <div
        className={`${righteous.className} text-white relative flex flex-col items-center justify-center w-full bg-cover bg-center`}
        style={{
          boxSizing: "border-box",
          height: "calc(100vh)",
          backgroundImage: "url('/images/primordia.png')",
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

  if (thereWasAnError) {
    return (
      <div className="text-white">
        <p>
          There was an error. But you can always keep your writing if you want.
        </p>
        <p>I&apos;m sorry. I&apos;m doing my best to make this thing work.</p>
        <Button
          buttonColor="bg-green-400 mx-auto w-48 text-black"
          buttonAction={pasteText}
          buttonText={copyText}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* {showMusicModal && (
        <div
          className="bg-black border-2 border-white rounded-xl w-96 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-8"
          style={{ opacity: "0.9" }}
        >
          <p className="text-white text-lg mb-4">
            Do you want music? Play it out loud and just write.
          </p>
          <div>
            <button onClick={handlePlayMusic} className="mx-2">
              <PiPillFill size={88} color="red" />
            </button>
            <button onClick={handleSkipMusic} className="mx-2">
              <PiPillFill size={88} color="green" />
            </button>
          </div>
          <small className="text-xs text-white">
            gently reminder: you are breathing
          </small>
        </div>
      )} */}
      <audio ref={audioRef} onEnded={handleTrackEnd} preload="auto" />
      <div className="md:block text-white relative w-full h-full mx-auto">
        <div className="flex h-full flex-col">
          <div
            className={`${righteous.className} w-full grow-0 bg-black/50 py-2 justify-center items-center flex h-fit items-center px-2 flex `}
          >
            <div
              className={`text-left h-fit w-10/12 text-purple-600 md:mt-0 text-xl md:text-3xl overflow-y-scroll  drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}
            >
              {theAsyncCastToReply ? (
                <div className="flex h-32">
                  <div className="h-30 p-2">
                    <div className="h-5/6 mx-auto flex justify-center items-center rounded-full overflow-hidden aspect-square relative">
                      <Image src={theAsyncCastToReply?.author.pfp_url} fill />
                    </div>
                    <div>
                      <div className="flex space-x-4 h-full text-lg">
                        <div
                          className={`flex space-x-1 items-center  hover:text-gray-500 cursor-pointer`}
                        >
                          <FaRegCommentAlt />
                          <span>{theAsyncCastToReply?.replies.count}</span>
                        </div>
                        <div
                          className={`flex space-x-1 items-center  hover:text-green-300 cursor-pointer`}
                        >
                          <BsArrowRepeat size={19} />
                          <span>
                            {theAsyncCastToReply?.reactions.recasts.length}
                          </span>
                        </div>
                        <div
                          className={`flex space-x-1 items-center hover:text-red-500 cursor-pointer`}
                        >
                          <FaRegHeart />
                          <span>
                            {theAsyncCastToReply?.reactions.likes.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 w-full flex flex-col justify-between h-full  text-lg">
                    <div className="w-full overflow-y-scroll">
                      {theAsyncCastToReply?.text.includes("\n") ? (
                        theAsyncCastToReply?.text.split("\n").map((x, i) => (
                          <p className="" key={i}>
                            {x}
                          </p>
                        ))
                      ) : (
                        <p className="my-2">{theAsyncCastToReply?.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                userPrompt
              )}
            </div>
            <div className="w-2/12 text-4xl md:text-6xl text-yellow-600 h-full flex relative items-center justify-center ">
              {time}
              {time === 0 && (
                <span
                  onClick={() => setDisplaySettingsModal(true)}
                  className="text-sm absolute bottom-0 right-0 text-red-800 hover:text-red-400 cursor-pointer"
                >
                  <IoSettings size={17} />
                </span>
              )}
            </div>
          </div>

          <div className="w-full grow relative">
            <textarea
              ref={textareaRef}
              disabled={finished}
              style={{
                transition: "top 1s, bottom 1s, left 1s, right 1s", // smooth transition
                position: text ? "absolute" : "static", // use absolute positioning only when text is present
                top: text ? "0" : "",
                bottom: text ? "0" : "",
                left: text ? "0" : "",
                right: text ? "0" : "",
              }}
              className={`${
                text ? "w-full h-full text-left" : "mt-8 w-4/5 md:w-3/5 h-64"
              } p-2 text-white ${
                text ? "opacity-80" : "opacity-80"
              } placeholder:opacity-70 placeholder-white text-xl border placeholder:text-gray-300 border-white rounded-md bg-opacity-10 bg-black`}
              placeholder={
                theAsyncCastToReply ? "reply here..." : "write here..."
              }
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
                          if (router.pathname.includes("/u/")) {
                            return setDisplayWritingGameLanding(false);
                          }
                          if (router.pathname.includes("/i/")) {
                            return setDisplayWritingGameLanding(false);
                          }
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
                          router.push("/");
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
          {sessionIsOver && renderSessionIsOver()}
        </div>
      </div>

      <Overlay show={previewCast}>
        <div className="bg-black bg-opacity-60 flex flex-col h-full justify-around items-around w-full ">
          <div>
            <IndividualDecodedCastCard
              cast={castForPreview}
              previewCast={true}
              farcasterUser={{}}
            />
            <div className="flex mt-0 justify-between px-4 mx-auto w-96">
              <Button
                buttonText={"go back"}
                buttonAction={() => setPreviewCast(false)}
                buttonColor="bg-purple-600 w-32"
              />
            </div>
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
