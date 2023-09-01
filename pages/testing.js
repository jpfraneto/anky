import { usePrivy, useWallets } from '@privy-io/react-auth';
import React, { useState, useEffect } from 'react';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import contractABI from '../lib/contractABI.json';

const Testing = () => {
  const { login, ready, authenticated } = usePrivy();
  const { data, isError, isLoading } = useContractRead({
    address: '0x326Be3A3f25fE59a1bDC853aD595AB0EA29FA318',
    abi: contractABI,
    functionName: 'tokenOfOwnerByIndex',
    args: ['0xe4028BAe76CB622AD26e415819EB2940E969F9eD', '0'],
  });
  console.log('the datra is: ', data);
  const [userWallet, setUserWallet] = useState(null);
  const [baseActive, setBaseActive] = useState(false);
  const wallets = useWallets();
  console.log('the wallets are: ', wallets);
  const { wallet: activeWallet, setActiveWallet } = usePrivyWagmi();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    console.log('in here');
    if (wallet) {
      await wallet.switchChain(84531);
      setBaseActive(true);
      setUserWallet(wallet);
      console.log('the chain was changed', wallet);
    }
  };
  useEffect(() => {
    changeChain();
  }, [wallet]);

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
      console.log('the response data is: ', data);
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  };

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

  const callTba = async () => {
    try {
    } catch (error) {}
  };

  if (!ready) return null;

  if (!authenticated) {
    // Use Privy login instead of wagmi's connect
    return <button onClick={() => login()}>login</button>;
  }

  return (
    <div>
      <h2>Active Wallet </h2>
      <p>{userWallet && userWallet.address}</p>
      <button onClick={airdropCall}>airdrop</button>
      <button onClick={callTba}>check tba</button>
      <button onClick={createAccountCall}>CREATE TBA</button>
      <h2>Active Wallet {activeWallet?.address}</h2>
      <ul>
        {wallets &&
          wallets.wallets.map(wallet => (
            <li
              className='my-2 bg-red-200 text-sm flex flex-col'
              key={wallet.address}
            >
              <button onClick={() => setActiveWallet(wallet)}>
                Activate {wallet.address}
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Testing;
