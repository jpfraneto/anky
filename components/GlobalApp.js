import React, { useEffect, useState } from "react";
import DesktopWritingGame from "./DesktopWritingGame";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Righteous, Dancing_Script } from "next/font/google";
import { getAnkyverseDay, getAnkyverseQuestion } from "../lib/ankyverse";
import { useUser } from "../context/UserContext";
import { FaPencilAlt } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { DEFAULT_CAST, LOCAL_STORAGE_KEYS } from "../lib/constants";
import { GiRollingEnergy } from "react-icons/gi";
import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchUserDementors } from "../lib/notebooks";
import { Transition } from "react-transition-group";
import airdropABI from "../lib/airdropABI.json";
import NewNotebookPage from "./NewNotebookPage";
import WhatIsThisPage from "./WhatIsThisPage";
import LandingPage from "./LandingPage";
import DementorPage from "./DementorById";
import ReadCastPage from "./ReadCastPage";
import ProfilePage from "./ProfilePage";
import NotebookPage from "./NotebookById";
import AnkyDementorPage from "./AnkyDementorPage";
import UserPage from "./UserPage";
import JournalPage from "./journals/JournalPage";
import LibraryPage from "./library/LibraryPage";
import EulogiasListPage from "./eulogias/EulogiasListPage";
import NewEulogiaPage from "./eulogias/NewEulogiaPage";
import IndividualEulogiaDisplayPage from "./eulogias/IndividualEulogiaDisplayPage";
import IndividualNotebookPage from "./notebook/IndividualNotebookPage";
import IndividualWritingDisplayPage from "./IndividualWritingDisplayPage";
import JournalById from "./journals/JournalById";
import BuyNewJournal from "./journals/BuyNewJournal";
import LitProtocol from "./LitProtocol";
import Mint from "./MintingComponentBtn";
import Irys from "./Irys";
import Button from "./Button";
import Spinner from "./Spinner";
import WelcomePage from "./WelcomePage";
import UserFeed from "./UserFeed";
import GlobalFeed from "./GlobalFeed";
import SettingsPage from "./SettingsPage";
import FarcasterPage from "./FarcasterPage";

const righteous = Righteous({ weight: "400", subsets: ["latin"] });
const ankyverseToday = getAnkyverseDay(new Date());
const ankyverseQuestion = getAnkyverseQuestion(ankyverseToday.wink);

const GlobalApp = ({ alchemy }) => {
  const {
    login,
    authenticated,
    ready,
    loading,
    logout,
    getAccessToken,
    exportWallet,
  } = usePrivy();
  const {
    userAppInformation,
    userOwnsAnky,
    setUserOwnsAnky,
    mainAppLoading,
    farcasterUser,
    setFarcasterUser,
  } = useUser();
  const router = useRouter();
  const [lifeBarLength, setLifeBarLength] = useState(100);
  const [displayManaInfo, setDisplayManaInfo] = useState(false);
  const [gameProps, setGameProps] = useState({});
  const [checkingIfYouOwnAnky, setCheckingIfYouOwnAnky] = useState(false);
  const [ankyButtonText, setAnkyButtonText] = useState("i already own one");
  const [disableButton, setDisableButton] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState(0);
  const [displayWritingGameLanding, setDisplayWritingGameLanding] =
    useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [userIsMintingAnky, setUserIsMintingAnky] = useState(false);
  const wallets = useWallets();
  const wallet = wallets.wallets[0];

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    console.log("inside here, ", storedData);
    if (storedData) {
      const user = JSON.parse(storedData);
      setFarcasterUser(user);
    }
  }, []);

  async function getMyAnky() {
    if (!wallet) return alert("you are not logged in");
    try {
      setAnkyButtonText("loading...");
      setUserIsMintingAnky(true);
      let provider = await wallet.getEthersProvider();
      let signer = await provider.getSigner();
      const authToken = await getAccessToken();

      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/airdrop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ userWallet: wallet.address }),
          credentials: "include",
        }
      );
      const data = await serverResponse.json();

      return;
      router.push("/welcome");
      setUserIsMintingAnky(false);
      setUserOwnsAnky(true);
    } catch (error) {
      console.log("there was an error", error);
      setAnkyButtonText("there was an error");
      setUserIsMintingAnky(false);
    }
  }

  function handleOpenWritingModal() {
    alert("open writing modal!");
  }

  async function checkIfUserOwnsAnky() {
    setAnkyButtonText("looking for your anky...");
    if (!wallet) return alert("you are not logged in");
    try {
      console.log("the wallet is: ", wallet);
      let provider = await wallet.getEthersProvider();
      console.log("the provider is: ", provider);
      let signer = await provider.getSigner();
      const ankyAirdropContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_AIRDROP_SMART_CONTRACT,
        airdropABI,
        signer
      );

      console.log("the anky airdrp contract is: ", ankyAirdropContract);
      setUserOwnsAnky(true);
      const usersBalance = await ankyAirdropContract.balanceOf(wallet.address);
      const usersAnkys = ethers.utils.formatUnits(usersBalance, 0);
      if (usersAnkys > 0) {
        setUserOwnsAnky(true);
      } else {
        setAnkyButtonText("you dont own an anky airdrop");
      }
    } catch (error) {
      console.log("askdkuahs");
      console.log("there was an error", error);
      setUserIsMintingAnky(false);
      setAnkyButtonText("you dont own an anky airdrop");
    }
  }

  function getComponentForRoute(route, router) {
    if (!ready || loading) return;

    switch (route) {
      case "/":
        return (
          <LandingPage
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
          />
        );
      case "/write":
        if (!router.isReady) return null;
        if (router.query.p == undefined || !router.query.p.length > 0)
          return (
            <DesktopWritingGame
              ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
                ankyverseToday.wink
              } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
              userPrompt="just write what comes"
              userAppInformation={userAppInformation}
              setLifeBarLength={setLifeBarLength}
            />
          );
        let formattedPrompt = router.query.p.replaceAll("-", " ");
        if (!formattedPrompt) formattedPrompt = "tell us who you are";
        return (
          <DesktopWritingGame
            ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
              ankyverseToday.wink
            } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
            userPrompt={formattedPrompt}
            userAppInformation={userAppInformation}
            setLifeBarLength={setLifeBarLength}
          />
        );
      case "/welcome":
        return <WelcomePage />;
      case "/farcaster":
        return (
          <FarcasterPage
            setCountdownTarget={setCountdownTarget}
            countdownTarget={countdownTarget}
            setGameProps={setGameProps}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
          />
        );
      case "/what-is-this":
        return <WhatIsThisPage />;
      case `/r/${route.split("/").pop()}`:
        return <ReadCastPage />;
      case "/dementor":
        return (
          <AnkyDementorPage
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case `/dementor/${route.split("/").pop()}`: // Extracts the dementor id from the route
        return (
          <DementorPage
            userAnky={userAppInformation}
            alchemy={alchemy}
            router={router}
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case "/irys":
        return <Irys />;
      case "/profile":
        return <ProfilePage />;
      case "/lit":
        return <LitProtocol />;
      case "/notebooks/new":
        return <NewNotebookPage userAnky={userAppInformation} />;
      case `/notebook/${route.split("/").pop()}`: // Extracts the template id from the route
        return (
          <NotebookPage
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
            wallet={wallet}
            router={router}
          />
        );

      case "/community-notebook":
        return <GlobalFeed thisWallet={wallet} />;
      case "/feed":
        return <GlobalFeed thisWallet={wallet} />;
      case "/me":
        return <UserFeed exportWallet={exportWallet} thisWallet={wallet} />;
      case "/eulogias":
        return <EulogiasListPage />;
      case "/library":
        return <LibraryPage />;
      case "/write?":
        return <LibraryPage />;
      case `/writing/${route.split("/").pop()}`:
        return <IndividualWritingDisplayPage />;
      case "/settings":
        return <SettingsPage />;
      case "/journal":
        return <JournalPage userAppInformation={userAppInformation} />;
      case `/journal/new`:
        return <BuyNewJournal />;
      case `/journal/${route.split("/").pop()}`:
        return (
          <JournalById
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case "/eulogias/new":
        return <NewEulogiaPage wallet={wallet} />;
      case `/eulogias/${route.split("/").pop()}`:
        return (
          <IndividualEulogiaDisplayPage
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case `/notebook/${route.split("/").pop()}`:
        return (
          <IndividualNotebookPage
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );

      default:
        return (
          <DesktopWritingGame
            ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
              ankyverseToday.wink
            } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
            userPrompt={ankyverseQuestion}
            userAppInformation={userAppInformation}
            setLifeBarLength={setLifeBarLength}
            farcasterUser={farcasterUser}
          />
        );
    }
  }

  if (mainAppLoading)
    return (
      <Transition in={mainAppLoading} timeout={500} mountOnEnter unmountOnExit>
        {(state) => (
          <div
            className={`flex-col text-white h-screen w-screen bg-black flex justify-center items-center fade-${state}`}
          >
            <h1 className="text-5xl text-center ">anky</h1>
            <p className="text-sm mb-3">(don&apos;t try to understand)</p>
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </Transition>
    );

  return (
    <div className="text-center w-screen text-white h-screen flex flex-col">
      <div className="hidden text-gray-400 w-full h-8 justify-between md:flex px-2 items-center">
        <Link href="/">
          <span className="hover:text-purple-600 pr-2">anky</span>
        </Link>
        <div className="h-full w-full">
          <div
            className="h-full opacity-50"
            style={{
              width: `${lifeBarLength}%`,
              backgroundColor: lifeBarLength > 30 ? "green" : "red",
            }}
          ></div>
        </div>
        <div className="h-8 w-fit px-2 flex justify-center items-center relative">
          {authenticated ? (
            <div className="flex h-full space-x-2 top-0 w-full items-center">
              {displayManaInfo && (
                <span className="absolute p-1 top-8 z-50 rounded-xl border-white text-white border-2 bg-purple-400">
                  <p className="text-left">
                    Mana: The intention is that every second that you spend
                    writing here, you will earn these.
                  </p>
                </span>
              )}
              <span
                onMouseEnter={() => setDisplayManaInfo(true)}
                onMouseLeave={() => setDisplayManaInfo(false)}
                className="rounded-xl bg-purple-600 border-white border hover:cursor-pointer hover:text-white px-2 flex space-x-2"
              >
                220
                <GiRollingEnergy
                  size={16}
                  color={`${displayManaInfo ? "white" : "#9CA38F"}`}
                  className="ml-2 translate-y-1"
                />
              </span>
              <span
                className="w-fit"
                onClick={() => setDisplayWritingGameLanding(false)}
              >
                <Link
                  href="/settings"
                  className="hover:text-purple-600 cursor-pointer"
                >
                  settings
                </Link>
              </span>
              <span
                className="hover:text-purple-600 cursor-pointer w-fit"
                onClick={() => setDisplayWritingGameLanding(true)}
              >
                write
              </span>
              <span onClick={() => setDisplayWritingGameLanding(false)}>
                <Link
                  href="/library"
                  className="hover:text-purple-600 cursor-pointer"
                >
                  library
                </Link>
              </span>
              <span
                className="hover:text-purple-600 cursor-pointer"
                onClick={logout}
              >
                logout
              </span>
            </div>
          ) : (
            <button
              className="hover:text-purple-600 cursor-pointer"
              onClick={login}
            >
              login
            </button>
          )}
        </div>
      </div>

      <div
        className={`${righteous.className} h-full standalone:h-screen-[33px] text-black relative standalone:pt-12  items-center justify-center`}
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/mintbg.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {displayWritingGameLanding ? (
          <>
            <DesktopWritingGame
              ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
                ankyverseToday.wink
              } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
              userPrompt={ankyverseQuestion}
              userAppInformation={userAppInformation}
              setLifeBarLength={setLifeBarLength}
              lifeBarLength={lifeBarLength}
              setDisableButton={setDisableButton}
              displayWritingGameLanding={displayWritingGameLanding}
              setDisplayWritingGameLanding={setDisplayWritingGameLanding}
              farcasterUser={farcasterUser}
              countdownTarget={countdownTarget}
            />
            {!disableButton && (
              <div
                onClick={() => setDisplayWritingGameLanding((x) => !x)}
                className="fixed hover:bg-red-700 hover:cursor-pointer h-16 w-16 bottom-3 right-3 border-black border-2 active:bg-red-500 rounded-full text-green-400 bg-red-500 z-10 flex items-center justify-center"
              >
                <IoArrowBack size={28} color="black" />
              </div>
            )}
          </>
        ) : (
          <div className="h-full">
            {getComponentForRoute(router.pathname, router)}
            <div
              onClick={() => setDisplayWritingGameLanding((x) => !x)}
              className="fixed hover:bg-purple-700 hover:cursor-pointer h-16 w-16 bottom-6 right-3 border-black border-2 active:bg-purple-500 rounded-full text-green-400 bg-purple-600 z-10 flex items-center justify-center"
            >
              <FaPencilAlt size={28} color="black" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalApp;
