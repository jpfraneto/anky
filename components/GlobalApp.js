import React, { useEffect, useState } from 'react';
import DesktopWritingGame from './DesktopWritingGame';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Righteous, Dancing_Script } from 'next/font/google';
import { getAnkyverseDay, getAnkyverseQuestion } from '../lib/ankyverse';
import { useUser } from '../context/UserContext';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { fetchUserDementors } from '../lib/notebooks';
import { Transition } from 'react-transition-group';
import airdropABI from '../lib/airdropABI.json';
import NewNotebookPage from './NewNotebookPage';
import LandingPage from './LandingPage';
import DementorPage from './DementorById';
import ProfilePage from './ProfilePage';
import BuildersPage from './BuildersPage';
import NotebookPage from './NotebookById';
import AnkyDementorPage from './AnkyDementorPage';
import UserPage from './UserPage';
import JournalPage from './journals/JournalPage';
import LibraryPage from './library/LibraryPage';
import EulogiasListPage from './eulogias/EulogiasListPage';
import NewEulogiaPage from './eulogias/NewEulogiaPage';
import IndividualEulogiaDisplayPage from './eulogias/IndividualEulogiaDisplayPage';
import IndividualNotebookPage from './notebook/IndividualNotebookPage';
import JournalById from './journals/JournalById';
import BuyNewJournal from './journals/BuyNewJournal';
import LitProtocol from './LitProtocol';
import { CrossmintPayButton } from '@crossmint/client-sdk-react-ui';
import Mint from './MintingComponentBtn';
import Irys from './Irys';
import Button from './Button';
import Spinner from './Spinner';
import WelcomePage from './WelcomePage';

const righteous = Righteous({ weight: '400', subsets: ['latin'] });
const ankyverseToday = getAnkyverseDay(new Date());
const ankyverseQuestion = getAnkyverseQuestion(ankyverseToday.wink);

const GlobalApp = ({ alchemy }) => {
  const { login, authenticated, ready, loading, logout } = usePrivy();
  const { userAppInformation, userOwnsAnky, setUserOwnsAnky, mainAppLoading } =
    useUser();
  const router = useRouter();
  const [lifeBarLength, setLifeBarLength] = useState(0);
  const [displayWritingGameLanding, setDisplayWritingGameLanding] =
    useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [userIsMintingAnky, setUserIsMintingAnky] = useState(false);
  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  useEffect(() => {
    console.log('out hereeee');
    if (ready) {
      console.log('IN EHEEEREREE');
    }
  }, [ready]);

  async function mintUsersAnky() {
    if (!wallet) return alert('you dont have a wallet connected');
    try {
      setUserIsMintingAnky(true);
      let provider = await wallet.getEthersProvider();
      let signer = await provider.getSigner();
      const ankyAirdropContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_AIRDROP_SMART_CONTRACT,
        airdropABI,
        signer
      );
      const usersFirstAnkyTxn = await ankyAirdropContract.mintTo(
        wallet.address
      );
      console.log('users first anky txn', usersFirstAnkyTxn);
      setUserIsMintingAnky(false);
      setUserOwnsAnky(true);
      router.push('/welcome');
    } catch (error) {
      console.log('there was an error', error);
      alert('there was an error, please try again.');
      setUserIsMintingAnky(false);
    }
  }

  function getComponentForRoute(route, router) {
    if (!ready) return;
    console.log(`________________${userOwnsAnky}____________________*****`);
    if (authenticated && wallet && wallet.address && !userOwnsAnky) {
      console.log('in heeere');
      return (
        <div
          className={`${righteous.className}  py-24 text-white relative overflow-y-scroll flex flex-col items-center  w-full bg-cover bg-center`}
          style={{
            boxSizing: 'border-box',
            height: 'calc(100vh)',
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/backgroundankys.png')",
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <p>you don&apos;t own an anky.</p>
          <p>it is the starting point of this journey.</p>
          <p>to get one, you just have to buy it by clicking on this link.</p>
          <p>it is only 2 usd.</p>
          <p>and it will guide you into the future.</p>
          <p>through the present.</p>

          <div className='w-96 my-2'>
            {userIsMintingAnky ? (
              <Spinner />
            ) : (
              <div className='flex space-x-2 justify-center w-full'>
                <Button
                  buttonAction={mintUsersAnky}
                  buttonText='pay with eth'
                  buttonColor='bg-purple-600'
                />
                <Mint usersWalletAddress={wallet.address} />
              </div>
            )}
          </div>
        </div>
      );
    }
    switch (route) {
      case '/':
        return (
          <LandingPage
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
          />
        );
      case '/write':
        if (!router.isReady) return null;
        if (router.query.p == undefined || !router.query.p.length > 0)
          return (
            <DesktopWritingGame
              ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
                ankyverseToday.wink
              } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
              userPrompt='just write what comes'
              userAppInformation={userAppInformation}
              setLifeBarLength={setLifeBarLength}
            />
          );
        let formattedPrompt = router.query.p.replaceAll('-', ' ');
        if (!formattedPrompt) formattedPrompt = 'tell us who you are';
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
      case '/welcome':
        return <WelcomePage />;
      case '/dementor':
        return (
          <AnkyDementorPage
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case `/dementor/${route.split('/').pop()}`: // Extracts the dementor id from the route
        return (
          <DementorPage
            userAnky={userAppInformation}
            alchemy={alchemy}
            router={router}
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case '/irys':
        return <Irys />;
      case '/profile':
        return <ProfilePage />;
      case '/lit':
        return <LitProtocol />;
      case '/notebooks/new':
        return <NewNotebookPage userAnky={userAppInformation} />;
      case `/notebook/${route.split('/').pop()}`: // Extracts the template id from the route
        return (
          <NotebookPage wallet={wallet} alchemy={alchemy} router={router} />
        );

      case '/community-notebook':
        return <BuildersPage />;
      case '/user':
        return <UserPage />;
      case '/eulogias':
        return <EulogiasListPage />;
      case '/library':
        return <LibraryPage />;
      case '/write?':
        return <LibraryPage />;

      case '/journal':
        return <JournalPage userAppInformation={userAppInformation} />;
      case `/journal/new`:
        return <BuyNewJournal />;
      case `/journal/${route.split('/').pop()}`:
        return (
          <JournalById
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case '/eulogias/new':
        return <NewEulogiaPage wallet={wallet} />;
      case `/eulogias/${route.split('/').pop()}`:
        return (
          <IndividualEulogiaDisplayPage
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case `/notebook/${route.split('/').pop()}`:
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
          />
        );
    }
  }

  if (mainAppLoading)
    return (
      <Transition in={mainAppLoading} timeout={500} mountOnEnter unmountOnExit>
        {state => (
          <div
            className={`flex-col text-white h-screen w-screen bg-black flex justify-center items-center fade-${state}`}
          >
            <h1 className='text-5xl text-center '>anky</h1>
            <p className='text-sm mb-3'>(don&apos;t try to understand)</p>
            <div className='lds-ripple'>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </Transition>
    );

  if (displayWritingGameLanding) {
    return (
      <div className='text-center w-screen text-white'>
        <div className='text-gray-400 w-full h-8 flex justify-between items-center'>
          <div
            className='hover:text-red-300 hover:cursor-pointer px-4 active:text-red-400'
            onClick={() => router.push('/')}
          >
            anky
          </div>
          <div className='h-full w-full'>
            <div
              className='h-full opacity-50'
              style={{
                width: `${lifeBarLength}%`,
                backgroundColor: lifeBarLength > 30 ? 'green' : 'red',
              }}
            ></div>
          </div>

          {/* <button onClick={() => console.log(userAppInformation)}>print</button> */}
          <div className='px-4 w-fit flex justify-center '>
            {authenticated ? (
              <button
                className='hover:text-purple-600 cursor-pointer'
                onClick={logout}
              >
                logout
              </button>
            ) : (
              <button
                className='hover:text-purple-600 cursor-pointer'
                onClick={login}
              >
                login
              </button>
            )}
          </div>
        </div>
        <div
          className={`${righteous.className} text-black relative overflow-y-scroll flex flex-col items-center  w-full bg-cover bg-center`}
          style={{
            boxSizing: 'border-box',
            height: 'calc(100vh - 33px)',
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/mintbg.jpg')",
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <DesktopWritingGame
            ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
              ankyverseToday.wink
            } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
            userPrompt={ankyverseQuestion}
            userAppInformation={userAppInformation}
            setLifeBarLength={setLifeBarLength}
            displayWritingGameLanding={displayWritingGameLanding}
            setDisplayWritingGameLanding={setDisplayWritingGameLanding}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='text-center w-screen text-white'>
      <div className='text-gray-400 w-full h-8 flex justify-between items-center'>
        <div
          className='hover:text-red-300 hover:cursor-pointer px-4 active:text-red-400'
          onClick={() => router.push('/')}
        >
          anky
        </div>
        <div className='h-full w-full'>
          <div
            className='h-full opacity-50'
            style={{
              width: `${lifeBarLength}%`,
              backgroundColor: lifeBarLength > 30 ? 'green' : 'red',
            }}
          ></div>
        </div>

        {/* <button onClick={() => console.log(userAppInformation)}>print</button> */}
        <div className='px-4 w-fit flex justify-center '>
          {authenticated ? (
            <button
              className='hover:text-purple-600 cursor-pointer'
              onClick={logout}
            >
              logout
            </button>
          ) : (
            <button
              className='hover:text-purple-600 cursor-pointer'
              onClick={login}
            >
              login
            </button>
          )}
        </div>
      </div>
      <div
        className={`${righteous.className} text-black relative overflow-y-scroll flex flex-col items-center  w-full bg-cover bg-center`}
        style={{
          boxSizing: 'border-box',
          height: 'calc(100vh - 33px)',
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/mintbg.jpg')",
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {getComponentForRoute(router.pathname, router)}
      </div>
    </div>
  );
};

export default GlobalApp;
