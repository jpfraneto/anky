import React, { useEffect, useState } from "react";
import DesktopWritingGame from "./DesktopWritingGame";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Righteous, Dancing_Script } from "next/font/google";
import { getAnkyverseDay, getAnkyverseQuestion } from "../lib/ankyverse";
import { useUser } from "../context/UserContext";
import Offcanvas from "react-bootstrap/Offcanvas";
import Image from "next/image";
import Button from "./Button";
import { FaPencilAlt, FaUserAstronaut } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { MdMenuOpen } from "react-icons/md";
import UserDisplayPage from "./UserDisplayPage";
import { IoIosHome, IoMdSettings } from "react-icons/io";
import { DEFAULT_CAST, LOCAL_STORAGE_KEYS } from "../lib/constants";
import { GiRollingEnergy } from "react-icons/gi";
import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchUserDementors } from "../lib/notebooks";
import { Transition } from "react-transition-group";
import airdropABI from "../lib/airdropABI.json";
import InstallPwaModal from "./InstallPwaModal";
import { BsInfoLg } from "react-icons/bs";
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
import AboutModal from "./AboutModal";

const righteous = Righteous({ weight: "400", subsets: ["latin"] });
const ankyverseToday = getAnkyverseDay(new Date());
const ankyverseQuestion = getAnkyverseQuestion(ankyverseToday.wink);

const GlobalApp = ({ alchemy, loginResponse }) => {
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
  const [displayInstallPWA, setDisplayInstallPWA] = useState(false);
  const [displayAboutModal, setDisplayAboutModal] = useState(false);
  const [thisIsTheFlag, setThisIsTheFlag] = useState(false);
  const [displayRightNavbar, setDisplayRightNavbar] = useState(false);
  const [thisIsThePrompt, setThisIsThePrompt] = useState("");
  const [countdownTarget, setCountdownTarget] = useState(0);
  const [show, setShow] = useState(false);
  const [displayWritingGameLanding, setDisplayWritingGameLanding] =
    useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [userIsMintingAnky, setUserIsMintingAnky] = useState(false);
  const wallets = useWallets();
  const wallet = wallets.wallets[0];

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData) {
      const user = JSON.parse(storedData);
      if (!farcasterUser.fid) setFarcasterUser(user);
      if (user.fid && !farcasterUser.pfp) {
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
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </Transition>
    );
  return (
    <div className="fixed overflow-y-scroll text-center w-screen text-white h-screen flex flex-col">
      <div className="flex-none text-gray-400 w-full h-10 md:h-8 justify-between md:flex md:px-2 items-center">
        <div className="h-6 w-full bg-black px-2  cursor-pointer justify-between flex md:hidden">
          <div
            className="active:text-yellow-600 hover:text-purple-600"
            onClick={handleShow}
          >
            <MdMenuOpen size={22} />
          </div>
          <Link href="/feed" className="hover:text-purple-600">
            anky
          </Link>
          <div
            className="active:text-purple-600 mt-1 hover:text-purple-600"
            onClick={() => setDisplayWritingGameLanding(true)}
          >
            <FaPencilAlt size={14} />
          </div>
        </div>
        <Link
          href={authenticated ? `/u/${user.id.replace("did:privy:", "")}` : "/"}
        >
          <span
            onClick={() => setDisplayWritingGameLanding(false)}
            className="hidden md:flex hover:text-purple-600 pr-2"
          >
            anky
          </span>
        </Link>
        <div className="h-4 w-full">
          <div
            className="h-full opacity-80"
            style={{
              width: `${lifeBarLength}%`,
              backgroundColor: lifeBarLength > 30 ? "green" : "red",
            }}
          ></div>
        </div>
      </div>
      {authenticated && farcasterUser.status != "approved" && (
        <div
          onClick={() => setDisplayWritingGameLanding(false)}
          className="flex-none h-8 text-xs px-4 md:text-lg text-black bg-purple-200 text-black py-1 flex  justify-center items-center "
        >
          friendly recommendation #1: link farcaster account{" "}
          <Link
            href="/settings?link=farcaster"
            className="bg-purple-600 ml-4 px-2 w-fit py-0 rounded-xl border text-white border-black active:bg-yellow-500 hover:bg-purple-700"
          >
            go to settings
          </Link>
        </div>
      )}
      {/* <div
        onClick={() => setDisplayWritingGameLanding(false)}
        className="standalone:hidden md:hidden flex-none h-8 text-xs px-4 md:text-xl text-black bg-red-200 text-black py-1 flex justify-center items-center "
      >
        friendly recommendation #2: install the PWA{" "}
        <span
          className="bg-purple-600 ml-4 px-2 py-1 rounded-xl border border-black active:bg-yellow-500 text-white hover:bg-purple-700"
          onClick={() => setDisplayInstallPWA(true)}
        >
          tutorial
        </span>
      </div> */}

      <div
        className={`${righteous.className} grow text-black relative  items-center justify-center`}
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
          <div className="h-full pb-20 z-50">
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
              className="standalone:hidden fixed hover:bg-purple-700 hover:cursor-pointer h-16 w-16 bottom-6 right-3 border-black border-2 active:bg-purple-500 rounded-full text-green-400 bg-purple-600 z-10 flex items-center justify-center"
            >
              <FaPencilAlt size={28} color="black" />
            </div>
            <nav className="hidden border-t-2 border-black standalone:flex w-full h-20  fixed bottom-0 pt-1 pb-1 bg-purple-200 space-x-4 justify-between items-center pb-4 px-12 z-50">
              <Link href="/feed" passHref>
                <span>
                  <IoIosHome size={40} />
                </span>
              </Link>

              {authenticated ? (
                <Link
                  className="active:text-yellow-500"
                  href="/settings"
                  passHref
                >
                  <span>
                    <IoMdSettings size={40} />
                  </span>
                </Link>
              ) : (
                <span onClick={login}>
                  <IoMdSettings size={40} />
                </span>
              )}
              {authenticated ? (
                <Link
                  href={`/u/${user?.id.replace("did:privy:", "")}`}
                  passHref
                >
                  <span>
                    <FaUserAstronaut size={40} />
                  </span>
                </Link>
              ) : (
                <span onClick={login}>
                  <FaUserAstronaut size={40} />
                </span>
              )}

              <span onClick={() => setDisplayAboutModal(!displayAboutModal)}>
                <BsInfoLg size={40} />
              </span>

              <span
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
              >
                <FaPencilAlt size={28} color="black" />
              </span>
            </nav>
          </div>
        )}
      </div>

      {displayAboutModal && (
        <AboutModal setDisplayAboutModal={setDisplayAboutModal} />
      )}
      {displayInstallPWA && (
        <InstallPwaModal setDisplayInstallPWA={setDisplayInstallPWA} />
      )}
      <Offcanvas
        className={`${righteous.className} bg-black text-gray-600`}
        placement="start"
        backdrop="static"
        scroll="true"
        show={show}
        onHide={handleClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="pl-3">welcome to anky</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="md:flex flex-col  h-full   w-fit px-2 relative">
            <div className="h-5/6 w-full ">
              {authenticated ? (
                <div className="flex flex-col h-full space-x-2 top-0 w-full items-start">
                  {displayManaInfo && (
                    <span className="absolute p-2 top-10 z-50 rounded-xl border-white text-white border-2 bg-purple-400">
                      <p className="text-left flex space-x-2 bg-purple-600 p-2 rounded-xl">
                        <GiRollingEnergy
                          size={48}
                          color={`${displayManaInfo ? "white" : "#9CA38F"}`}
                          className="mx-2 translate-y-1"
                        />
                        $NEWEN: Every second that you spend writing here, you
                        will earn these.
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
                  <div className="flex space-x-2">
                    <span
                      // onMouseEnter={() => setDisplayManaInfo(true)}
                      // onMouseLeave={() => setDisplayManaInfo(false)}
                      className="rounded-xl hover:text-gray-600 w-fit mb-2 ml-2 bg-purple-600 border-white border hover:cursor-pointer  px-2 flex justify-center space-x-2"
                    >
                      <Link
                        href="/mana"
                        passHref
                        className="flex text-white hover:text-gray-500"
                      >
                        {userDatabaseInformation.manaBalance || 0}
                        <GiRollingEnergy
                          size={16}
                          color="white"
                          className="ml-2 translate-y-1"
                        />
                        <span className="mx-2">|</span>{" "}
                        {userDatabaseInformation.streak || 0}
                        <FaChartLine
                          size={16}
                          color="white"
                          className="ml-2 translate-y-1"
                        />
                      </Link>
                    </span>
                    <span
                      onClick={() => alert("refresh the users state")}
                      className="rounded-xl text-white hover:text-black w-fit mb-2 ml-2 bg-green-600 border-white border hover:cursor-pointer  px-2 flex justify-center space-x-2"
                    >
                      refresh
                    </span>
                  </div>

                  <div onClick={handleClose} className="flex flex-col">
                    {" "}
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
                    <span onClick={() => setDisplayWritingGameLanding(false)}>
                      <Link
                        href="/library"
                        className="hover:text-purple-600 cursor-pointer"
                      >
                        library
                      </Link>
                    </span>
                    <div className="absolute bottom-4 flex flex-col mr-auto">
                      <small className="text-sm"> {user.wallet.address}</small>
                      <small className="text-sm mb-2">
                        Farcaster: @{farcasterUser.username}
                      </small>
                      <Button
                        buttonAction={logout}
                        buttonColor="bg-red-600 text-white mr-auto"
                        buttonText="log out"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-full">
                  <Button
                    buttonAction={login}
                    buttonText="login"
                    buttonColor="bg-purple-600 text-white"
                  />
                </div>
              )}
            </div>

            <div className="h-1/6 ">
              <hr className="text-gray-600" />
              <div className="flex flex-col ml-3">
                <span
                  onClick={() => {
                    handleClose();
                    setDisplayAboutModal(!displayAboutModal);
                  }}
                >
                  about
                </span>
                <span>Hecho en Chile - 2024 - Anky Eres Tu SpA</span>
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default GlobalApp;
