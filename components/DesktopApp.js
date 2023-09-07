import React, { useState } from 'react';
import DesktopWritingGame from './DesktopWritingGame';
import ExplorePage from './ExplorePage';
import { usePrivy } from '@privy-io/react-auth';
import { Righteous, Dancing_Script } from 'next/font/google';
import { getAnkyverseDay, getAnkyverseQuestion } from '../lib/ankyverse';
import { createTBA, airdropAnky } from '../lib/backend';
import { usePWA } from '../context/pwaContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import NotebooksPage from './NotebooksPage';

const righteous = Righteous({ weight: '400', subsets: ['latin'] });
const ankyverseToday = getAnkyverseDay(new Date());
const ankyverseQuestion = getAnkyverseQuestion(ankyverseToday.wink);

const DesktopApp = () => {
  const router = useRouter();
  const { logout, login, user, authenticated } = usePrivy();
  const { musicPlaying, setMusicPlaying } = usePWA();
  const [lifeBarLength, setLifeBarLength] = useState(0);

  function getComponentForRoute(route) {
    switch (route) {
      case '/notebooks':
        return <NotebooksPage />;
      case '/explore':
        return <ExplorePage />;

      default:
        return (
          <DesktopWritingGame
            ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
              ankyverseToday.wink
            } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
            userPrompt={ankyverseQuestion}
            setLifeBarLength={setLifeBarLength}
          />
        );
    }
  }

  return (
    <div className='text-center text-white'>
      <div className='text-white w-full h-8 flex justify-between items-center px-2'>
        <div className='h-full w-full'>
          <div
            className='h-full opacity-50'
            style={{
              width: `${lifeBarLength}%`,
              backgroundColor: lifeBarLength > 30 ? 'green' : 'red',
            }}
          ></div>
        </div>
        <div className='flex space-x-2'>
          <button
            className='hover:text-purple-600'
            onClick={() => setMusicPlaying(x => !x)}
          >
            {musicPlaying ? 'stop' : 'music'}
          </button>
          <Link className='hover:text-purple-600' href='/'>
            landing
          </Link>
          <Link className='hover:text-purple-600' href='/explore'>
            explore
          </Link>
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
        className={`${righteous.className} text-black relative  flex flex-col items-center  w-full bg-cover bg-center`}
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

export default DesktopApp;
