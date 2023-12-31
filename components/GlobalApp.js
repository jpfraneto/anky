import React, { useEffect, useState } from "react";
import DesktopWritingGame from "./DesktopWritingGame";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Righteous, Dancing_Script } from "next/font/google";
import { getAnkyverseDay, getAnkyverseQuestion } from "../lib/ankyverse";
import { useUser } from "../context/UserContext";
import { FaPencilAlt } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { MdMenuOpen } from "react-icons/md";
import UserDisplayPage from "./UserDisplayPage";
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
import DashboardPage from "./DashboardPage";
import ReadCastPage from "./ReadCastPage";
import ProfilePage from "./ProfilePage";
import NotebookPage from "./NotebookById";
import AnkyDementorPage from "./AnkyDementorPage";
import JournalPage from "./journals/JournalPage";
import LibraryPage from "./library/LibraryPage";
import EulogiasListPage from "./eulogias/EulogiasListPage";
import NewEulogiaPage from "./eulogias/NewEulogiaPage";
import IndividualEulogiaDisplayPage from "./eulogias/IndividualEulogiaDisplayPage";
import IndividualNotebookPage from "./notebook/IndividualNotebookPage";
import IndividualWritingDisplayPage from "./IndividualWritingDisplayPage";
import JournalById from "./journals/JournalById";
import BuyNewJournal from "./journals/BuyNewJournal";
import { FaChartLine } from "react-icons/fa";
import LitProtocol from "./LitProtocol";
import Irys from "./Irys";
import WelcomePage from "./WelcomePage";
import UserFeed from "./UserFeed";
import GlobalFeed from "./GlobalFeed";
import SettingsPage from "./SettingsPage";
import FarcasterPage from "./FarcasterPage";
import ManaPage from "./mana/ManaPage";
import FarcasterFeedPage from "./FarcasterFeedPage";
import UserByFidComponent from "./farcaster/UserByFidComponent";
import axios from "axios";
import Leaderboard from "./Leaderboard";

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
    user,
    getAccessToken,
    exportWallet,
  } = usePrivy();
  const {
    setUserAppInformation,
    userAppInformation,
    userOwnsAnky,
    setUserOwnsAnky,
    mainAppLoading,
    farcasterUser,
    setFarcasterUser,
    userDatabaseInformation,
  } = useUser();
  const router = useRouter();
  const [lifeBarLength, setLifeBarLength] = useState(100);
  const [displayManaInfo, setDisplayManaInfo] = useState(false);
  const [gameProps, setGameProps] = useState({});
  const [displayNavbar, setDisplayNavbar] = useState(false);
  const [checkingIfYouOwnAnky, setCheckingIfYouOwnAnky] = useState(false);
  const [ankyButtonText, setAnkyButtonText] = useState("i already own one");
  const [disableButton, setDisableButton] = useState(false);
  const [thisIsTheFlag, setThisIsTheFlag] = useState(false);
  const [displayRightNavbar, setDisplayRightNavbar] = useState(false);
  const [thisIsThePrompt, setThisIsThePrompt] = useState("");
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
      if (!farcasterUser.fid) setFarcasterUser(user);
      if (user.fid && !farcasterUser.pfp) {
        console.log("gonna call the get this user information function now");
        getThisUserInformation(user.fid);
      }
    }
    async function getThisUserInformation(fid) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/u/${fid}`
        );
        setFarcasterUser((prev) => {
          return {
            ...prev,
            displayName: response.data.user.displayName,
            followerCount: response.data.user.followerCount,
            followingCount: response.data.user.followingCount,
            pfp: response.data.user.pfp.url,
            bio: response.data.user.profile.bio,
            username: response.data.user.username,
          };
        });
      } catch (error) {
        console.log("there was an error getting the user informaton");
      }
    }
  }, []);

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
              userPrompt={thisIsThePrompt || ankyverseQuestion}
              setUserAppInformation={setUserAppInformation}
              userAppInformation={userAppInformation}
              setLifeBarLength={setLifeBarLength}
              setThisIsTheFlag={setThisIsTheFlag}
              lifeBarLength={lifeBarLength}
              setDisableButton={setDisableButton}
              setDisplayNavbar={setDisplayNavbar}
              displayWritingGameLanding={displayWritingGameLanding}
              setDisplayWritingGameLanding={setDisplayWritingGameLanding}
              farcasterUser={farcasterUser}
              countdownTarget={countdownTarget}
            />
          );
        let formattedPrompt = router.query.p.replaceAll("-", " ");
        if (!formattedPrompt) formattedPrompt = "tell us who you are";
        return (
          <DesktopWritingGame
            ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
              ankyverseToday.wink
            } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
            userPrompt={thisIsThePrompt || ankyverseQuestion}
            setUserAppInformation={setUserAppInformation}
            userAppInformation={userAppInformation}
            setLifeBarLength={setLifeBarLength}
            setDisplayNavbar={setDisplayNavbar}
            setThisIsTheFlag={setThisIsTheFlag}
            lifeBarLength={lifeBarLength}
            setDisableButton={setDisableButton}
            displayWritingGameLanding={displayWritingGameLanding}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
            farcasterUser={farcasterUser}
            countdownTarget={countdownTarget}
          />
        );
      case "/welcome":
        return <WelcomePage />;
      case "/leaderboard":
        return <Leaderboard />;
      case "/farcaster":
        return (
          <FarcasterPage
            setCountdownTarget={setCountdownTarget}
            countdownTarget={countdownTarget}
            setGameProps={setGameProps}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
          />
        );
      case `/u/${route.split("/").pop()}`:
        return <UserDisplayPage thisUserInfo={router.query.fid} />;

      case "/farcaster/feed":
        return <FarcasterFeedPage router={router} />;
      case "/dashboard":
        return <DashboardPage router={router} />;
      case `/w/${route.split("/").pop()}`:
        if (thisIsTheFlag || !router.isReady) return null;
        if (
          router.query.prompt == undefined ||
          !router.query?.prompt?.length > 0
        )
          return (
            <DesktopWritingGame
              ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
                ankyverseToday.wink
              } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
              userPrompt={thisIsThePrompt || ankyverseQuestion}
              setUserAppInformation={setUserAppInformation}
              userAppInformation={userAppInformation}
              setLifeBarLength={setLifeBarLength}
              setThisIsTheFlag={setThisIsTheFlag}
              lifeBarLength={lifeBarLength}
              setDisableButton={setDisableButton}
              setDisplayNavbar={setDisplayNavbar}
              displayWritingGameLanding={displayWritingGameLanding}
              setDisplayWritingGameLanding={setDisplayWritingGameLanding}
              farcasterUser={farcasterUser}
              countdownTarget={countdownTarget}
            />
          );
        let formattedPrompt2 = router.query.prompt.replaceAll("-", " ");
        if (!formattedPrompt2) formattedPrompt = "";
        setThisIsThePrompt(formattedPrompt2);
        setDisplayWritingGameLanding(true);

      case "/what-is-this":
        return <WhatIsThisPage />;
      case "/mana":
        return <ManaPage />;
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
            userPrompt={thisIsThePrompt || ankyverseQuestion}
            setUserAppInformation={setUserAppInformation}
            userAppInformation={userAppInformation}
            setLifeBarLength={setLifeBarLength}
            setThisIsTheFlag={setThisIsTheFlag}
            lifeBarLength={lifeBarLength}
            setDisableButton={setDisableButton}
            setDisplayNavbar={setDisplayNavbar}
            displayWritingGameLanding={displayWritingGameLanding}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
            farcasterUser={farcasterUser}
            countdownTarget={countdownTarget}
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
    <div className="relative text-center w-screen text-white h-screen flex flex-col">
      <div className="text-gray-400 w-full h-8 justify-between md:flex md:px-2 items-center">
        <Link href="/">
          <span
            onClick={() => setDisplayWritingGameLanding(false)}
            className="hover:text-purple-600 pr-2"
          >
            anky
          </span>
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
        {displayNavbar && (
          <div className="h-8 w-fit px-2 flex justify-center items-center relative">
            {authenticated ? (
              <div className="flex h-full space-x-2 top-0 w-full items-center">
                {displayManaInfo && (
                  <span className="absolute p-2 top-10 z-50 rounded-xl border-white text-white border-2 bg-purple-400">
                    <p className="text-left flex space-x-2 bg-purple-600 p-2 rounded-xl">
                      <GiRollingEnergy
                        size={48}
                        color={`${displayManaInfo ? "white" : "#9CA38F"}`}
                        className="mx-2 translate-y-1"
                      />
                      $NEWEN: Every second that you spend writing here, you will
                      earn these.
                    </p>
                    <p className="text-left mt-2 flex space-x-2 bg-purple-600 p-2 rounded-xl">
                      <FaChartLine
                        size={32}
                        color={`${displayManaInfo ? "white" : "#9CA38F"}`}
                        className="mx-2 translate-y-1"
                      />
                      Streaks: How many days in a row have you written?
                    </p>
                  </span>
                )}
                <span
                  onMouseEnter={() => setDisplayManaInfo(true)}
                  onMouseLeave={() => setDisplayManaInfo(false)}
                  className="rounded-xl w-fit  bg-purple-600 border-white border hover:cursor-pointer hover:text-white px-2 flex justify-center space-x-2"
                >
                  <Link href="/mana" passHref className="flex ">
                    {userDatabaseInformation.manaBalance || 0}
                    <GiRollingEnergy
                      size={16}
                      color={`${displayManaInfo ? "white" : "#9CA38F"}`}
                      className="ml-2 translate-y-1"
                    />
                    <span className="mx-2">|</span>{" "}
                    {userDatabaseInformation.streak || 0}
                    <FaChartLine
                      size={16}
                      color={`${displayManaInfo ? "white" : "#9CA38F"}`}
                      className="ml-2 translate-y-1"
                    />
                  </Link>
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
                  className="w-fit"
                  onClick={() => setDisplayWritingGameLanding(false)}
                >
                  <Link
                    href="/leaderboard"
                    className="hover:text-purple-600 cursor-pointer"
                  >
                    leaderboard
                  </Link>
                </span>
                <span
                  className="w-fit"
                  onClick={() => setDisplayWritingGameLanding(false)}
                >
                  <Link
                    href={`/u/${user.id.replace("did:privy:", "")}`}
                    className="hover:text-purple-600 cursor-pointer"
                  >
                    profile
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
        )}
        <div className="hidden md:flex h-8 w-fit px-2 justify-center items-center relative">
          <button
            onClick={() => setDisplayNavbar(!displayNavbar)}
            className="hover:text-purple-600 cursor-pointer "
          >
            <MdMenuOpen size={22} />
          </button>
        </div>
      </div>

      <div
        className={`${righteous.className} flex-grow text-black relative  items-center justify-center`}
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/mintbg.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {displayWritingGameLanding ? (
          <div className="h-full">
            <DesktopWritingGame
              ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
                ankyverseToday.wink
              } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
              userPrompt={thisIsThePrompt || ankyverseQuestion}
              setUserAppInformation={setUserAppInformation}
              userAppInformation={userAppInformation}
              setLifeBarLength={setLifeBarLength}
              setThisIsTheFlag={setThisIsTheFlag}
              lifeBarLength={lifeBarLength}
              setDisplayNavbar={setDisplayNavbar}
              setDisableButton={setDisableButton}
              displayWritingGameLanding={displayWritingGameLanding}
              setDisplayWritingGameLanding={setDisplayWritingGameLanding}
              farcasterUser={farcasterUser}
              countdownTarget={countdownTarget}
            />
            {!disableButton && (
              <div
                onClick={() => {
                  if (
                    router.pathname.includes("write") ||
                    router.pathname.includes("w")
                  ) {
                    router.push("/");
                  }
                  setDisplayWritingGameLanding(false);
                }}
                className="fixed hover:bg-red-700 hover:cursor-pointer h-16 w-16 bottom-6 right-3 border-black border-2 active:bg-red-500 rounded-full text-green-400 bg-red-600 z-10 flex items-center justify-center"
              >
                <IoArrowBack size={28} color="black" />
              </div>
            )}
          </div>
        ) : (
          <div className="h-full">
            {getComponentForRoute(router.pathname, router)}
            <div
              onClick={() => {
                console.log("in here");
                if (
                  router.pathname.includes("write") ||
                  router.pathname.includes("w")
                ) {
                  router.push("/");
                }
                setDisplayWritingGameLanding(true);
              }}
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
