import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import {
  fetchUserEulogias,
  fetchUserNotebooks,
  fetchUserJournals,
} from '../lib/notebooks';
import AccountSetupModal from '../components/AccountSetupModal';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { authenticated, loading } = usePrivy();
  const [userAppInformation, setUserAppInformation] = useState({});
  const [appLoading, setAppLoading] = useState(true);
  const [firstTimeUser, setFirstTimeUser] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [settingThingsUp, setSettingThingsUp] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [setupIsReady, setSetupIsReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    if (authenticated && wallet) {
      await wallet.switchChain(84531);
      console.log('THE CHAIN WAS UPDATED');
      setUserAppInformation(x => {
        console.log('saisica', wallet);
        return { ...x, wallet: wallet };
      });
    }
  };

  useEffect(() => {
    async function mainSetup() {
      try {
        if (loading) return;
        if (!authenticated) {
          setAppLoading(false);
          return setShowProgressModal();
        }
        setShowProgressModal(true);
        if (
          authenticated &&
          wallet &&
          !settingThingsUp &&
          !localStorage.getItem('firstTimeUser39')
        ) {
          console.log(
            'this is the first time that the user logs in and the progress modal will be shown now'
          );
          setSettingThingsUp(true);
          setShowProgressModal(true);
          await changeChain();
          setCurrentStep(1);
          let provider = await wallet.getEthersProvider();
          const testEthResponse = await sendTestEth(provider);
          console.log('asldal', testEthResponse);
          if (!testEthResponse.success) {
            setErrorMessage('There was an error sending you the test eth');
            throw new Error('There was an error sending the test eth.');
          }
          setCurrentStep(2);
          const airdropCallResponse = await airdropCall();
          console.log('the airdrop call response is: ', airdropCallResponse);
          if (!airdropCallResponse.success) {
            setErrorMessage('There was an error gifting you your anky.');
            throw new Error('There was an error with the airdrop call.');
            return;
          }
          setCurrentStep(3);
          await new Promise(resolve => setTimeout(resolve, 15000));

          const callTbaResponse = await callTba(wallet.address);
          console.log('the tba call response is: ', callTbaResponse);
          if (!callTbaResponse.success) {
            setErrorMessage('There was an error retrieving your tba.');
            throw new Error('There was an error with the tba call.');
            return;
          }
          setCurrentStep(4);

          const journalCallResponse = await airdropFirstJournal(wallet.address);
          if (!journalCallResponse.success) {
            setErrorMessage('There was an error retrieving your tba.');
            throw new Error('There was an error with the tba call.');
            return;
          }
          setCurrentStep(5);
          console.log('all the setup is ready');
          localStorage.setItem('firstTimeUser39', 'done');
          setShowProgressModal(false);
          return setSetupIsReady(true);
        } else {
          setShowProgressModal(false);
          setSetupIsReady(true);
        }
      } catch (error) {
        console.log('Error here', error);
      }
    }
    mainSetup();
  }, [loading, wallet]);

  useEffect(() => {
    const loadUserLibrary = async () => {
      try {
        if (
          setupIsReady &&
          authenticated &&
          wallet &&
          wallet.address &&
          wallet.address.length > 0
        ) {
          console.log('befoekfaouchsoa');
          const { tba } = await callTba(wallet.address);
          console.log('in here, the wallet is: ', wallet, tba);
          let provider = await wallet.getEthersProvider();
          const signer = await provider.getSigner();
          console.log('the signer is: ', signer);
          console.log('the user app information is: ', userAppInformation);
          let userTba = userAppInformation?.tbaAddress || tba;

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
            console.log('the user journals are213: ', userJournals);
            setUserAppInformation(x => {
              return { ...x, userJournals: userJournals };
            });
          }
          if (!userAppInformation.userNotebooks) {
            console.log('in here', userAppInformation);
            const userNotebooks = await fetchUserNotebooks(signer, userTba);
            console.log('the user notebooks are213: ', userNotebooks);

            setUserAppInformation(x => {
              return { ...x, userNotebooks: userNotebooks };
            });
          }
          if (!userAppInformation.userEulogias) {
            const userEulogias = await fetchUserEulogias(signer);
            console.log('the user eulogias are213: ', userEulogias);

            setUserAppInformation(x => {
              return { ...x, userEulogias: userEulogias };
            });
          }
          setLibraryLoading(false);
        } else {
          setAppLoading(false);
        }
      } catch (error) {
        setAppLoading(false);
        console.log('there was an error retrieving the users library.');
        console.log(error);
      }
    };
    loadUserLibrary();
  }, [loading, wallets, setupIsReady]);

  async function sendTestEth(provider) {
    console.log('SENDING THE TEST ETH, via calling the get-initial-eth route');
    const balanceWei = await provider.getBalance(wallet.address);
    const balanceEth = ethers.utils.formatEther(balanceWei);
    console.log('the wallets balance is: ', balanceEth);
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
      const data = await initialEthTransaction.json();
      return data;
    } else {
      return { success: true };
    }
  }

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
      return { success: true, ankyIndex: data.userAnkyIndex };
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  }

  async function callTba(address) {
    try {
      console.log('calling the tba', address);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/getTBA/${address}`
      );
      const data = await response.json();
      console.log('the data is: ', data);
      setUserAppInformation(x => {
        return { ...x, tbaAddress: data.ankyTba };
      });
      return { success: true, tba: data.ankyTba };
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  }

  async function airdropFirstJournal(address) {
    try {
      console.log('calling the first journal of the user', address);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/sendFirstJournal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: address,
          }),
        }
      );
      const data = await response.json();
      if (data) {
        return { success: true };
      }
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
      {showProgressModal && (
        <AccountSetupModal
          setupIsReady={setupIsReady}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          setShowProgressModal={setShowProgressModal}
        />
      )}
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
