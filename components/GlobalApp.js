import React, { useEffect, useState } from "react";
import DesktopWritingGame from "./DesktopWritingGame";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Righteous, Dancing_Script } from "next/font/google";
import { getAnkyverseDay, getAnkyverseQuestion } from "../lib/ankyverse";
import { useUser } from "../context/UserContext";
import Offcanvas from "react-bootstrap/Offcanvas";
import Image from "next/image";
import { IndividualWritingDisplayModal } from "./IndividualWritingDisplayModal";
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
import TimerSettingsModal from "./TimerSettingsModal";

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
    setUserDatabaseInformation,
    userOwnsAnky,
    setUserOwnsAnky,
    mainAppLoading,
    farcasterUser,
    setFarcasterUser,
    userDatabaseInformation,
    allUserWritings,
  } = useUser();
  const router = useRouter();
  const [lifeBarLength, setLifeBarLength] = useState(100);
  const [displayManaInfo, setDisplayManaInfo] = useState(false);
  const [gameProps, setGameProps] = useState({});
  const [displayNavbar, setDisplayNavbar] = useState(false);
  const [refreshUsersStateLoading, setRefreshUsersStateLoading] =
    useState(false);
  const [checkingIfYouOwnAnky, setCheckingIfYouOwnAnky] = useState(false);
  const [ankyButtonText, setAnkyButtonText] = useState("i already own one");
  const [writingForDisplay, setWritingForDisplay] = useState(null);
  const [disableButton, setDisableButton] = useState(false);
  const [displayInstallPWA, setDisplayInstallPWA] = useState(false);
  const [copyWalletAddressText, setCopyWalletAddressText] = useState("");
  const [displayAboutModal, setDisplayAboutModal] = useState(false);
  const [displaySettingsModal, setDisplaySettingsModal] = useState(false);
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

  useEffect(() => {
    if (user && user.wallet) {
      setCopyWalletAddressText(user.wallet.address);
    }
  }, [authenticated]);

  async function copyWalletAddress() {
    try {
      setCopyWalletAddressText("copied the wallet address");
      await navigator.clipboard.writeText(user.wallet.address);
      setTimeout(() => {
        setCopyWalletAddressText(user.wallet.address);
      }, 1111);
    } catch (error) {
      console.log("there was an error copying the wallet address");
    }
  }

  async function refreshUsersState() {
    try {
      console.log("refreshing the users state");
      if (!authenticated) return;
      setRefreshUsersStateLoading(true);
      console.log("the user is: ", user, authenticated);
      const authToken = await getAccessToken();
      console.log("the auth token is:", authToken);
      const thisUserPrivyId = user.id.replace("did:privy:", "");
      const thisFarcasterAccount = farcasterUser || null;
      if (!thisFarcasterAccount?.fid) thisFarcasterAccount.fid = null;
      console.log(
        "right before sending the post request to the database to get the users information",
        thisUserPrivyId,
        authToken
      );
      if (!authToken) return setRefreshUsersStateLoading(false);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/user/${thisUserPrivyId}`,
        { thisFarcasterAccount },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setUserDatabaseInformation({
        streak: response.data.user.streak || 0,
        manaBalance: response.data.user.manaBalance || 0,
      });
      if (response.data.farcasterAccount) {
        setFarcasterUser(response.data.farcasterAccount);
      }
      setRefreshUsersStateLoading(false);
    } catch (error) {
      console.log("there was an error refreshing the users state", error);
      setRefreshUsersStateLoading(false);
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
    <div className="fixed overflow-y-scroll text-center w-screen text-white flex flex-col h-screen">
      <div className="flex-none text-gray-400 w-full h-16  justify-between md:flex items-center flex-col">
        <div className="h-12 items-center flex-row w-full bg-black px-2  cursor-pointer justify-between flex ">
          <div
            className="active:text-yellow-600 h-full md:mt-2  hover:text-purple-600"
            onClick={handleShow}
          >
            <MdMenuOpen size={40} />
          </div>
          <Link
            href="/feed"
            onClick={() => setDisplayWritingGameLanding(false)}
            className="hover:text-purple-600 text-3xl"
          >
            anky
          </Link>
          <div
            className="active:text-purple-600 md:mb-1 mt-1 hover:text-purple-600"
            onClick={() => setDisplayWritingGameLanding(true)}
          >
            <FaPencilAlt size={30} />
          </div>
        </div>
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
      {authenticated &&
        farcasterUser.status != "approved" &&
        farcasterUser.signerStatus != "approved" && (
          <div
            onClick={() => setDisplayWritingGameLanding(false)}
            className="flex-none h-8 text-xs px-4 md:text-lg text-black bg-purple-200 text-black py-1 flex  justify-center items-center "
          >
            link farcaster account
            <Link
              href="/settings?link=farcaster"
              className="bg-purple-600 ml-4 px-2 w-fit py-0 rounded-xl border text-white border-black active:bg-yellow-500 hover:bg-purple-700"
            >
              go to settings
            </Link>
          </div>
        )}

      <div
        className={`${righteous.className} grow text-black relative  items-center justify-center`}
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/mintbg.jpg')",
          backgroundColor: "black",
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
              setDisplaySettingsModal={setDisplaySettingsModal}
              lifeBarLength={lifeBarLength}
              setDisplayNavbar={setDisplayNavbar}
              setDisableButton={setDisableButton}
              displayWritingGameLanding={displayWritingGameLanding}
              setDisplayWritingGameLanding={setDisplayWritingGameLanding}
              farcasterUser={farcasterUser}
              countdownTarget={countdownTarget}
            />
          </div>
        ) : (
          <div className="h-full pb-20 z-50">
            {getComponentForRoute(router.pathname, router)}
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
            </nav>
          </div>
        )}
      </div>

      {writingForDisplay && (
        <IndividualWritingDisplayModal
          writingForDisplay={writingForDisplay}
          setWritingForDisplay={setWritingForDisplay}
        />
      )}

      {displaySettingsModal && (
        <TimerSettingsModal
          displaySettingsModal={displaySettingsModal}
          setDisplaySettingsModal={setDisplaySettingsModal}
        />
      )}

      {displayAboutModal && (
        <AboutModal
          setDisplayAboutModal={setDisplayAboutModal}
          setDisplayWritingGameLanding={setDisplayWritingGameLanding}
        />
      )}
      {displayInstallPWA && (
        <InstallPwaModal setDisplayInstallPWA={setDisplayInstallPWA} />
      )}
      <Offcanvas
        className={`${righteous.className} bg-black text-gray-600`}
        placement="start"
        backdrop="true"
        scroll="false"
        show={show}
        onHide={handleClose}
      >
        <Offcanvas.Header>
          <div className="flex flex-col pl-3 mb-0 relative">
            <Offcanvas.Title>welcome to anky</Offcanvas.Title>
            <small className="text-purple-800">
              when you don&apos;t have time to think, your truth comes forth
            </small>
            <small
              onClick={handleClose}
              className="text-red-600 hover:text-red-400 cursor-pointer absolute right-0 top-0"
            >
              X
            </small>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="md:flex flex-col  h-full w-fit px-2 relative">
            <div className="grow w-full ">
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
                    <span className="rounded-xl hover:text-gray-600 w-fit mb-2 ml-2 bg-purple-600 border-white border  px-2 flex justify-center space-x-2">
                      <div className="flex text-white hover:text-gray-500">
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
                      </div>
                    </span>
                    <span
                      onClick={refreshUsersState}
                      className="rounded-xl text-white w-fit mb-2 ml-2 bg-green-600 border-white border hover:cursor-pointer  px-2 flex justify-center space-x-2"
                    >
                      {refreshUsersStateLoading ? "refreshing..." : "refresh"}
                    </span>
                  </div>

                  <div onClick={handleClose} className="flex flex-col">
                    {/* <Link
                      href="/settings"
                      className="hover:text-purple-600 cursor-pointer"
                    >
                      settings
                    </Link> 
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
                      className="hover:text-purple-600
                      cursor-pointer"
                      onClick={() => {
                        var name = prompt(
                          "please enter a link to the cast on any farcaster client"
                        );
                        if (name != null) {
                          const distilledCastHash = name.find("0x....");
                          router.push(`/c/${distilledCastHash}`);
                        }
                      }}
                    >
                      respond to cast
                    </span> */}
                    {/* <span onClick={() => setDisplayWritingGameLanding(false)}>
                      <Link
                        href="/library"
                        className="hover:text-purple-600 cursor-pointer"
                      >
                        library
                      </Link>
                    </span> */}
                  </div>
                  <hr className="h-2 border-white border-2 bg-red-200" />
                  <div className="h-64 mt-2 overflow-y-scroll">
                    {allUserWritings.map((writing, i) => {
                      return (
                        <p
                          onClick={() => {
                            handleClose();
                            setWritingForDisplay(writing);
                          }}
                          className="my-2 hover:cursor-pointer hover:text-purple-600"
                        >
                          {writing.text.slice(0, 30)}...
                        </p>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="w-24 h-full">
                  <Button
                    buttonAction={login}
                    buttonText="login"
                    buttonColor="bg-purple-600 text-center text-white"
                  />
                </div>
              )}
            </div>
            {authenticated && (
              <div className="flex flex-col mr-auto">
                <small
                  onClick={copyWalletAddress}
                  className="text-sm hover:text-purple-200 active:text-purple-600 cursor-pointer"
                >
                  {copyWalletAddressText}
                </small>
                {farcasterUser.username && (
                  <small className="text-sm mb-2">
                    Farcaster: @{farcasterUser.username}
                  </small>
                )}
              </div>
            )}

            {authenticated && (
              <div className="h-12 mt-2 w-full flex">
                <div className=" h-12 w-12  rounded-xl overflow-hidden relative">
                  <Image src="/images/anky.png" fill />
                </div>
                <div className="flex py-1 px-3 items-center grow justify-between">
                  <span
                    className="hover:text-purple-600 hover:cursor-pointer"
                    onClick={() => {
                      handleClose();
                      setDisplayAboutModal(!displayAboutModal);
                    }}
                  >
                    {farcasterUser.displayName}
                  </span>
                  <Link
                    href="/settings"
                    className="hover:text-purple-600 cursor-pointer"
                  >
                    <span
                      onClick={() => {
                        setDisplayWritingGameLanding(false);
                        handleClose();
                      }}
                    >
                      · · ·
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default GlobalApp;
