import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import {
  fetchUserEulogias,
  fetchUserNotebooks,
  fetchUserJournals,
} from '../lib/notebooks';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { authenticated, loading } = usePrivy();
  const [userAppInformation, setUserAppInformation] = useState({});
  const [appLoading, setAppLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(true);

  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    if (authenticated && wallet) {
      await wallet.switchChain(84531);
      setUserAppInformation(x => {
        return { ...x, wallet: wallet };
      });
    }
  };

  useEffect(() => {
    const setup = async () => {
      if (
        authenticated &&
        wallet &&
        wallet.address &&
        wallet.address.length > 0
      ) {
        let provider = await wallet.getEthersProvider();
        const signer = await provider.getSigner();
        let userTba = userAppInformation?.tbaAddress || '';
        if (!wallet?.chainId.includes('84531')) await changeChain();
        console.log('THIS IS HAPPENING');
        const balanceWei = await provider.getBalance(wallet.address);
        const balanceEth = ethers.utils.formatEther(balanceWei);
        if (Number(balanceEth) === 0) {
          const fetchOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wallet: wallet.address,
            }),
          };
          const initialEthTransaction = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/get-initial-eth`,
            fetchOptions
          );
          console.log('the initial eth transaction is:', initialEthTransaction);
        }

        if ((wallet && wallet.address) || !userAppInformation?.tbaAddress) {
          userTba = await callTba(wallet.address);
        }
        if (wallet && !userAppInformation.userAnkyIndex) await airdropCall();
        if (!userAppInformation || !userAppInformation.wallet)
          setUserAppInformation(x => {
            return { ...x, wallet };
          });
        console.log(
          'inside the user provider, right before the loading is set to false'
        );
        setAppLoading(false);
        if (!userAppInformation.userJournals) {
          const userJournals = await fetchUserJournals(signer);
          setUserAppInformation(x => {
            return { ...x, userJournals: userJournals };
          });
        }
        if (!userAppInformation.userNotebooks) {
          const userNotebooks = await fetchUserNotebooks(signer, userTba);

          setUserAppInformation(x => {
            return { ...x, userNotebooks: userNotebooks };
          });
        }
        if (!userAppInformation.userEulogias) {
          const userEulogias = await fetchUserEulogias(signer);

          setUserAppInformation(x => {
            return { ...x, userEulogias: userEulogias };
          });
        }
        setLibraryLoading(false);
      } else {
        setAppLoading(false);
      }
    };
    setup();
  }, [loading, wallets]);

  async function airdropCall() {
    try {
      console.log('sending the call to the airdrop route', wallet.address);
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
            wallet: wallet.address,
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

  async function callTba(address) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/getTBA/${address}`
      );
      const data = await response.json();
      setUserAppInformation(x => {
        return { ...x, tbaAddress: data.ankyTba };
      });
      return data.ankyTba;
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  }

  return (
    <UserContext.Provider
      value={{
        userAppInformation,
        setUserAppInformation,
        appLoading,
        libraryLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
