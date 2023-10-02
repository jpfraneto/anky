import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';
import { Righteous, Dancing_Script } from 'next/font/google';
import { getAnkyverseDay, getAnkyverseQuestion } from '../lib/ankyverse';
import { createTBA, airdropAnky } from '../lib/backend';
import IndividualEulogiaDisplayPageMobile from './eulogias/IndividualEulogiaDisplayPageMobile.js';
import NewEulogiaPageMobile from './eulogias/NewEulogiaPageMobile.js';
import IndividualNotebookPageMobile from './notebook/IndividualNotebookPageMobile.js';
import MobileUserEulogiasPage from './mobile/MobileUserEulogiasPage';
import MobileUserJournalsPage from './mobile/MobileUserJournalsPage';
import MobileUserNotebooksPage from './mobile/MobileUserNotebooksPage';
import MobileUserJournalByIdPage from './mobile/MobileUserJournalByIdPage';
import MobileUserNotebookById from './mobile/MobileUserNotebookById';
import MobileUserEulogiaById from './mobile/MobileUserEulogiaById';
import MobileBuyNewJournal from './mobile/MobileBuyNewJournal';
import Spinner from './Spinner';
import MobileNewEulogia from './mobile/MobileNewEulogia';

const sections = [
  {
    question: 'why?',
    image: 'why.png',
    oneLiner:
      'because humanity is awakening and it is a hard process to go through.',
  },
  {
    question: 'what?',
    image: 'what.png',
    oneLiner:
      'an interface to develop open source practical tools for you to realize who you really are. ',
  },
  {
    question: 'when?',
    image: 'when.png',
    oneLiner: 'forever on the blockchain. here. now.',
  },
  {
    question: 'where?',
    image: 'where.png',
    oneLiner: 'through the internet.',
  },
  {
    question: 'who?',
    image: 'who.png',
    oneLiner: 'those that are serious about the quest for truth.',
  },
  {
    question: 'how?',
    image: 'how.png',
    oneLiner:
      'by inspiring you with the raw truth that each of us has to offer.',
  },
];

const MobileApp = () => {
  const { login, authenticated, user, logout } = usePrivy();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [lifeBarLength, setLifeBarLength] = useState(0);
  const { userAppInformation, appLoading, libraryLoading } = useUser();

  function getComponentForRoute(route) {
    switch (route) {
      case '/m/user/journals':
        return <MobileUserJournalsPage userAnky={userAppInformation} />;
      case '/m/journals/new':
        return <MobileBuyNewJournal userAnky={userAppInformation} />;
      case '/m/eulogias/new':
        return <MobileNewEulogia userAnky={userAppInformation} />;
      case `/m/user/journals/${route.split('/').pop()}`:
        return <MobileUserJournalByIdPage userAnky={userAppInformation} />;
      case '/m/user/eulogias':
        return <MobileUserEulogiasPage userAnky={userAppInformation} />;
      case `/m/user/eulogias/${route.split('/').pop()}`:
        return <MobileUserEulogiaById userAnky={userAppInformation} />;
      case '/m/user/notebooks':
        return <MobileUserNotebooksPage userAnky={userAppInformation} />;
      case `/m/user/notebooks/${route.split('/').pop()}`:
        return <MobileUserNotebookById userAnky={userAppInformation} />;
      case '/eulogias/new':
        return <NewEulogiaPageMobile userAnky={userAppInformation} />;
      case `/eulogias/${route.split('/').pop()}`:
        return (
          <IndividualEulogiaDisplayPageMobile
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );
      case `/notebook/${route.split('/').pop()}`:
        return (
          <IndividualNotebookPageMobile
            setLifeBarLength={setLifeBarLength}
            lifeBarLength={lifeBarLength}
          />
        );

      default:
        return (
          <div className='p-4 w-full text-black h-screen'>
            {libraryLoading ? (
              <div className='flex flex-col items-center'>
                <p>your library is loading</p>
                <Spinner />
              </div>
            ) : (
              <>
                {' '}
                <Link passHref href={`/m/user/journals`}>
                  <div className='bg-lime-400 w-5/6 mx-auto h-16 rounded-2xl mt-4 flex items-center active:bg-lime-500'>
                    <p className='text-black text-xl text-center w-9/12 mx-auto'>
                      journals ({userAppInformation?.userJournals?.length || 0})
                    </p>
                  </div>
                </Link>
                <Link passHref href={`/m/user/eulogias`}>
                  <div className='bg-amber-400 w-5/6 mx-auto h-16 rounded-2xl mt-4 flex items-center active:bg-amber-500'>
                    <p className='text-black text-xl text-center w-9/12 mx-auto'>
                      eulogias ({userAppInformation?.userEulogias?.length || 0})
                    </p>
                  </div>
                </Link>
                <Link passHref href={`/m/user/notebooks`}>
                  <div className='bg-blue-400 w-5/6 mx-auto h-16 rounded-2xl mt-4 flex items-center'>
                    <p className='text-black text-xl text-center w-9/12 mx-auto'>
                      notebooks (
                      {userAppInformation?.userNotebooks?.length || 0})
                    </p>
                  </div>
                </Link>
              </>
            )}

            <div className='w-5/6 mx-auto mt-2'>
              <p className='mt-2'>
                all what you see here is evolving in real time.
              </p>
              <p className='mt-2'>
                every day a new piece of the story is wrote.
              </p>
              <p className='mt-2'>its a mess, i know. but every day cleaner.</p>
              <p className='mt-2'>
                the desktop app is cool. explore it. write on it.
              </p>
              <p className='mt-2'>i&apos;m doing my best.</p>
            </div>
            <div
              onClick={logout}
              className='bg-red-400 w-4/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'
            >
              <p className='text-white text-3xl text-center w-9/12 mx-auto'>
                logout
              </p>
            </div>
          </div>
        );
    }
  }

  if (appLoading) {
    return (
      <div className='h-screen bg-black w-screen flex justify-center items-center'>
        <h2 className='text-white text-6xl'>anky</h2>
        <p className='text-sm mb-3'>(don&apos;t try to understand)</p>
        <div class='lds-ripple'>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className='h-screen'>
        {sections.map((x, i) => (
          <Element section={x} key={i} />
        ))}
        <div className='h-1/7 p-4 w-full flex justify-center items-center bg-black'>
          <p onClick={login} className='text-white text-2xl'>
            login
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed h-screen w-screen'>
      <div
        className={`bg-white relative overflow-y-scroll flex flex-col items-center h-full w-full bg-cover bg-center`}
      >
        <div
          onClick={() => alert('go to the users page')}
          className='flex mt-6 mb-0 rounded-full bg-purple-300 w-3/5 mx-auto h-18 border border-black'
        >
          <div className='w-2/5 flex justify-center items-center'>
            <div className='w-12 h-12 aspect-square rounded-full pl-10 relative overflow-hidden'>
              <Image src='/ankys/2.png' fill alt='anky' />
            </div>
          </div>

          <div className='w-3/5 py-4 pr-4 flex justify-center items-center '>
            <p className='text-2xl'>lunamaria</p>
          </div>
        </div>
        {getComponentForRoute(router.pathname)}
      </div>
    </div>
  );
};

export default MobileApp;

const Element = ({ section }) => {
  const [opened, setOpened] = useState(false);
  console.log('the section is: ', section);
  return (
    <div
      onClick={() => setOpened(x => !x)}
      className='h-24 p-4 w-full relative bg-cover'
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/ankys/${section.image}')`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <p className='text-white text-2xl'>{section.question}</p>
      {opened && (
        <p
          className='text-white text-sm'
          dangerouslySetInnerHTML={{ __html: section.oneLiner }}
        ></p>
      )}
    </div>
  );
};
