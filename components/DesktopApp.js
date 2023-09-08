import React, { useEffect, useState } from 'react';
import DesktopWritingGame from './DesktopWritingGame';
import ExplorePage from './ExplorePage';
import { usePrivy, useWallets } from '@privy-io/react-auth';
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
  const { login, ready, authenticated, logout } = usePrivy();
  const { userAppInformation, setUserAppInformation } = usePWA();
  const router = useRouter();
  const [lifeBarLength, setLifeBarLength] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userWallet, setUserWallet] = useState(null);

  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    if (wallet) {
      await wallet.switchChain(84531);
      setUserWallet(wallet);
      console.log('the chain was changed', wallet);
      let provider = await wallet?.getEthersProvider();
      let signer = await provider.getSigner();
      console.log('the signer is: ', signer);
      setUserAppInformation(x => {
        return { ...x, wallet, signer };
      });
    }
  };

  useEffect(() => {
    const setup = async () => {
      if (!userAppInformation?.wallet?.chainId.includes('84531'))
        await changeChain();
      // I won't call the aidrop call because it is called when the user logs in.
      if (!userAppInformation?.ankyIndex) await airdropCall();
      if (!userAppInformation?.tbaAddress) await callTba();

      setLoading(false);
    };
    setup();
  }, [wallet, userAppInformation.wallet]);

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

  async function airdropCall() {
    try {
      console.log(
        'sending the call to the airdrop route',
        userAppInformation.wallet.address
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

  if (loading) return <p>Loading</p>;

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
          <button onClick={() => console.log(userAppInformation)}>
            console
          </button>
          <Link className='hover:text-purple-600' href='/'>
            landing
          </Link>
          <Link className='hover:text-purple-600' href='/notebooks'>
            notebooks
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
