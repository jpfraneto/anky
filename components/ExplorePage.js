import { usePrivy, useWallets } from '@privy-io/react-auth';
import React, { useState, useEffect } from 'react';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import contractABI from '../lib/contractABI.json';
import { usePWA } from '../context/pwaContext';
import Link from 'next/link';

const ExplorePage = () => {
  const { login, ready, authenticated } = usePrivy();
  const { userAnky, setUserAnky } = usePWA();
  const { data, isError, isLoading } = useContractRead({
    address: '0x326Be3A3f25fE59a1bDC853aD595AB0EA29FA318',
    abi: contractABI,
    functionName: 'tokenOfOwnerByIndex',
    args: ['0xe4028BAe76CB622AD26e415819EB2940E969F9eD', '0'],
  });
  console.log('the datra is: ', data);
  const [userWallet, setUserWallet] = useState(null);
  const [baseActive, setBaseActive] = useState(false);
  const [ankyTBA, setAnkyTBA] = useState(null);
  const [userAnkyData, setUserAnkyData] = useState(null);
  const wallets = useWallets();
  const { wallet: activeWallet, setActiveWallet } = usePrivyWagmi();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    console.log('in here');
    if (wallet) {
      await wallet.switchChain(84531);
      setBaseActive(true);
      setUserWallet(wallet);
      console.log('the chain was changed', wallet);
      setUserAnky(x => {
        return { ...x, wallet };
      });
    }
  };
  useEffect(() => {
    changeChain();
  }, [wallet]);

  const createAccountCall = async () => {
    try {
      console.log(
        'sending the call to the create tba account route',
        userWallet.address
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/createTBA`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: userWallet.address,
          }),
        }
      );
      const data = await response.json();
      console.log('the response data is: ', data);
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  };

  const airdropCall = async () => {
    try {
      console.log('sending the call to the airdrop route', userWallet.address);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/airdrop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: userWallet.address,
          }),
        }
      );
      const data = await response.json();
      console.log('in here, the data is: ', data);
      setUserAnky(x => {
        return { ...x, tokenUri: data.tokenUri, ankyIndex: data.userAnkyIndex };
      });
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  };

  const callTba = async () => {
    try {
      console.log(
        'sending the call to the fetch the tba account route',
        userWallet.address
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/getTBA/${userWallet.address}`
      );
      const data = await response.json();
      console.log('the response data is: ', data);
      setUserAnky(x => {
        return { ...x, tbaAddress: data.ankyTba };
      });
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  };

  if (!ready) return null;

  if (!authenticated) {
    // Use Privy login instead of wagmi's connect
    return <button onClick={() => login()}>login</button>;
  }

  if (!userWallet) return <p>loading...</p>;

  return (
    <div className='h-full overflow-y-scroll w-full'>
      <div className='h-7/12 w-fit p-2 bg-red-300'>
        <p>you are logged in with this address</p>
        <p>{userWallet.address}</p>
        <p>on {userWallet.chainId}</p>
        <button onClick={() => console.log(userAnky)}>console</button>
      </div>
      <div className='h-7/12 w-fit p-2 bg-blue-300'>
        <button onClick={airdropCall}>airdrop</button>
        {userAnky.ankyIndex && (
          <div>
            <p>your anky is the number </p>
            <p>{userAnky.ankyIndex}</p>
          </div>
        )}
      </div>
      <div className='h-7/12 w-fit p-2 bg-purple-300'>
        <button onClick={callTba}>get tba</button>

        {userAnky.tbaAddress ? (
          <div>
            <p>its associated account is</p>
            <p>{userAnky.tbaAddress}</p>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      {userAnky.tbaAddress && (
        <div className='h-7/12 w-fit p-2 bg-green-300'>
          <p>you have your account set up</p>
          <Link href='/notebooks'>explore notebooks</Link>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
