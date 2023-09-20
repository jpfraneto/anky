import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { usePWA } from '../context/pwaContext';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Righteous, Dancing_Script } from 'next/font/google';
import { getAnkyverseDay, getAnkyverseQuestion } from '../lib/ankyverse';
import { createTBA, airdropAnky } from '../lib/backend';
import IndividualEulogiaDisplayPageMobile from './eulogias/IndividualEulogiaDisplayPageMobile.js';
import NewEulogiaPageMobile from './eulogias/NewEulogiaPageMobile.js';

const sections = [
  {
    question: 'why?',
    image: 'why.png',
    oneLiner:
      'because humanity is awakening and it is a hard process. like being born again but feeling that you are completely crazy.',
  },
  {
    question: 'what?',
    image: 'what.png',
    oneLiner:
      'an interface to develop open source practical tools for you to realize who you really are. please contribute here: <a className="text-yellow-600" href="https://www.github.com/ankylat" target="_blank">https://www.github.com/ankylat</a>',
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
  const { userAppInformation, setUserAppInformation, isAnkyLoading } = usePWA();
  const [userWallet, setUserWallet] = useState(null);

  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    if (wallet) {
      await wallet.switchChain(84531);
      setUserWallet(wallet);
      console.log('the chain was changed', wallet);
      setUserAppInformation(x => {
        return { ...x, wallet: wallet };
      });
    }
  };

  useEffect(() => {
    const setup = async () => {
      if (!userAppInformation?.wallet?.chainId.includes('84531'))
        await changeChain();
      // I won't call the aidrop call because it is called when the user logs in.
      console.log('in here', userAppInformation);
      if (!userAppInformation?.ankyIndex) await airdropCall();
      if (!userAppInformation?.tbaAddress) await callTba();

      setLoading(false);
    };
    setup();
  }, [wallet, userAppInformation.wallet]);

  async function airdropCall() {
    try {
      console.log(
        'sending the call to the airdrop route',
        userAppInformation.wallet.address
      );
      console.log(
        'The call is being sent to:',
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/airdrop`
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/airdrop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: userAppInformation.wallet.address,
          }),
        }
      );
      const data = await response.json();
      console.log('in here, the data is: ', data);
      setUserAppInformation(x => {
        return { ...x, tokenUri: data.tokenUri, ankyIndex: data.userAnkyIndex };
      });
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  }

  async function callTba() {
    try {
      console.log(
        'sending the call to the fetch the tba account route',
        userAppInformation.wallet.address
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/getTBA/${userAppInformation.wallet.address}`
      );
      const data = await response.json();
      console.log('the response data is: ', data);
      setUserAppInformation(x => {
        return { ...x, tbaAddress: data.ankyTba };
      });
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  }

  function getComponentForRoute(route) {
    switch (route) {
      case '/eulogias/new':
        return <NewEulogiaPageMobile userAnky={userAppInformation} />;
      case `/eulogias/${route.split('/').pop()}`:
        console.log('IN THIS ROUTE');
        return (
          <IndividualEulogiaDisplayPageMobile
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
          <div className='text-white h-screen'>
            <div className=' p-4 w-full text-2xl flex justify-center items-center bg-black'>
              <Link href='/templates'>browse templates</Link>
            </div>
            <div className=' p-4 w-full text-2xl  flex justify-center items-center bg-red-600'>
              <Link href='/eulogias'>browse eulogias</Link>
            </div>
          </div>
        );
    }
  }

  if (loading) {
    return (
      <div className='h-screen w-screen flex justify-center items-center'>
        <h2 className='text-white text-6xl'>anky</h2>
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
    <div className='h-screen w-screen'>
      <div className='h-8 w-screen'>
        <div
          className='h-full opacity-50'
          style={{
            width: `${lifeBarLength}%`,
            backgroundColor: lifeBarLength > 30 ? 'green' : 'red',
          }}
        ></div>
      </div>{' '}
      <div
        className={`text-black relative overflow-y-scroll flex flex-col items-center h-full w-full bg-cover bg-center`}
      >
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
      className='h-1/7 p-4 w-full relative bg-cover'
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
