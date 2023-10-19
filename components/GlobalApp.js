import React, { useEffect, useState } from 'react';
import DesktopWritingGame from './DesktopWritingGame';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Righteous, Dancing_Script } from 'next/font/google';
import { getAnkyverseDay, getAnkyverseQuestion } from '../lib/ankyverse';
import { useUser } from '../context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getUserData } from '../lib/idbHelper';
import { fetchUserDementors } from '../lib/notebooks';
import { Transition } from 'react-transition-group';
import NotebooksPage from './NotebooksPage';
import NewTemplatePage from './NewTemplatePage';
import TemplatesPage from './TemplatesPage';
import LandingPage from './LandingPage';
import DementorPage from './DementorById';
import ProfilePage from './ProfilePage';
import BuildersPage from './BuildersPage';
import TemplatePage from './TemplateById';
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

const righteous = Righteous({ weight: '400', subsets: ['latin'] });
const ankyverseToday = getAnkyverseDay(new Date());
const ankyverseQuestion = getAnkyverseQuestion(ankyverseToday.wink);

const GlobalApp = ({ alchemy }) => {
  const { login, ready, authenticated, logout } = usePrivy();
  const { userAppInformation, setUserAppInformation, appLoading } = useUser();
  const router = useRouter();
  const [lifeBarLength, setLifeBarLength] = useState(0);
  const [userWallet, setUserWallet] = useState(null);
  const wallets = useWallets();
  const wallet = wallets.wallets[0];

  function getComponentForRoute(route) {
    switch (route) {
      case '/':
        return <LandingPage />;
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
      case '/notebooks':
        return <TemplatesPage />;
      case '/templates':
        return <TemplatesPage />;
      case '/profile':
        return <ProfilePage />;
      case '/templates/new':
        return <NewTemplatePage userAnky={userAppInformation} />;
      case `/template/${route.split('/').pop()}`: // Extracts the template id from the route
        return (
          <TemplatePage
            wallet={wallet}
            userAnky={userAppInformation}
            alchemy={alchemy}
            router={router}
          />
        );

      case '/100builders':
        return <BuildersPage />;
      case '/user':
        return <UserPage />;
      case '/eulogias':
        return <EulogiasListPage />;
      case '/library':
        return <LibraryPage />;
      case '/journal':
        return <JournalPage userAppInformation={userAppInformation} />;
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
      case `/journal/new`:
        return <BuyNewJournal />;
      case `/journal/${route.split('/').pop()}`:
        return (
          <JournalById
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

  async function getDementors() {
    if (!wallet && !wallet?.provider) return;
    const provider = await wallet.getEthersProvider();
    const signer = await provider.getSigner();
    fetchUserDementors(signer);
  }

  return (
    <div className='text-center w-screen text-white'>
      <div className='text-white w-full h-8 flex justify-between items-center px-2'>
        <div
          className='hover:text-red-300 hover:cursor-pointer px-2 active:text-red-400'
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

        <button onClick={getDementors}>dementors</button>
        {/* <button onClick={() => console.log(userAppInformation)}>print</button> */}
        <div className='px-2 w-36 flex justify-center space-x-2'>
          {authenticated ? (
            <button className='hover:text-purple-600' onClick={logout}>
              logout
            </button>
          ) : (
            <button className='hover:text-purple-600' onClick={login}>
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
        {getComponentForRoute(router.pathname)}
      </div>
    </div>
  );
};

export default GlobalApp;
