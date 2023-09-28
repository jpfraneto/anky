import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import {
  fetchUserEulogias,
  fetchUserNotebooks,
  fetchUserJournals,
} from '../lib/notebooks';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userAppInformation, setUserAppInformation] = useState({});
  const [loading, setLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(true);

  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    if (wallet) {
      await wallet.switchChain(84531);
      setUserWallet(wallet);
      setUserAppInformation(x => {
        return { ...x, wallet: wallet };
      });
    }
  };

  useEffect(() => {
    const setup = async () => {
      if (wallet && wallet.address && wallet.address.length > 0) {
        let provider = await wallet.getEthersProvider();
        const signer = await provider.getSigner();
        let userTba = userAppInformation?.tbaAddress || '';
        if (!wallet?.chainId.includes('84531')) await changeChain();
        if ((wallet && wallet.address) || !userAppInformation?.tbaAddress) {
          userTba = await callTba(wallet.address);
        }
        if (wallet && !userAppInformation.userAnkyIndex) await airdropCall();
        if (!userAppInformation || !userAppInformation.wallet)
          setUserAppInformation(x => {
            return { ...x, wallet };
          });
        setLoading(false);
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
      }
    };
    setup();
  }, [wallets]);

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
        loading,
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
