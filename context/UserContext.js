import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import {
  fetchUserEulogias,
  fetchUserNotebooks,
  fetchUserJournals,
} from '../lib/notebooks';
import AccountSetupModal from '../components/AccountSetupModal';
import { setUserData, getUserData } from '../lib/idbHelper';
import {
  sendTestEth,
  airdropCall,
  callTba,
  airdropFirstJournal,
} from '../lib/helpers';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userAppInformation, setUserAppInformation] = useState({});
  const [appLoading, setAppLoading] = useState(true);
  const [userIsReadyNow, setUserIsReadyNow] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [settingThingsUp, setSettingThingsUp] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [setupIsReady, setSetupIsReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { authenticated, loading } = usePrivy();
  const wallets = useWallets();
  const wallet = wallets.wallets[0];

  // Load stored user data from IndexedDB and set it to state
  useEffect(() => {
    async function loadStoredUserData() {
      console.log('1');
      const storedData = await getUserData('userAppInformation');
      console.log('2', storedData);
      if (storedData) setUserAppInformation(storedData);
    }
    loadStoredUserData();
  }, []);

  // Check initialization and setup status
  useEffect(() => {
    async function handleInitialization() {
      if (loading) return;
      if (!authenticated) {
        setAppLoading(false);
        return;
      }

      if (shouldInitializeUser() && wallet) {
        console.log('iN HERESADJLHSA');
        await initializeUser();
      } else {
        setAppLoading(false);
      }
    }
    handleInitialization();
  }, [loading, authenticated, wallet]);

  // Load the user's library when setup is ready
  useEffect(() => {
    if (userIsReadyNow) {
      console.log('THE USER IS READY, time to load her library');
      loadUserLibrary();
    }
  }, [userIsReadyNow]);

  const shouldInitializeUser = () => {
    return authenticated && wallet && true;
    return authenticated && wallet && !localStorage.getItem('firstTimeUser100');
  };

  const userIsReady = () => {
    return userAppInformation && userIsReadyNow;
  };

  const loadUserLibrary = async () => {
    try {
      if (
        setupIsReady &&
        authenticated &&
        wallet &&
        wallet.address &&
        wallet.address.length > 0
      ) {
        console.log('loading the users library');
        const { tba } = await callTba(wallet.address, setUserAppInformation);
        let provider = await wallet.getEthersProvider();
        const signer = await provider.getSigner();
        let userTba = userAppInformation?.tbaAddress || tba;

        if (!userAppInformation || !userAppInformation.wallet)
          setUserAppInformation(x => {
            return { ...x, wallet };
          });

        if (!userAppInformation.userJournals) {
          console.log('before fetching the journals');
          const userJournals = await fetchUserJournals(signer);
          setUserAppInformation(x => {
            return { ...x, userJournals: userJournals };
          });
        }

        if (!userAppInformation.userNotebooks) {
          console.log('before fetching the notebooks');

          const userNotebooks = await fetchUserNotebooks(signer, userTba);
          setUserAppInformation(x => {
            return { ...x, userNotebooks: userNotebooks };
          });
        }

        if (!userAppInformation.userEulogias) {
          console.log('before fetching the eulogias');

          const userEulogias = await fetchUserEulogias(signer);
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
      console.log('there was an error retrieving the users library.', error);
    }
  };

  const initializeUser = async () => {
    try {
      if (loading) return;
      if (!authenticated) {
        setAppLoading(false);
        return setShowProgressModal(false);
      }
      console.log('in her');
      setShowProgressModal(true);

      setSettingThingsUp(true);
      await changeChain();
      setCurrentStep(1);

      let provider = await wallet.getEthersProvider();
      const testEthResponse = await sendTestEth(wallet, provider);
      if (!testEthResponse.success) {
        setErrorMessage('There was an error sending you the test eth');
        throw new Error('There was an error sending the test eth.');
      }
      setCurrentStep(2);
      const airdropCallResponse = await airdropCall(
        wallet,
        setUserAppInformation
      );
      console.log('the airdrop call response is: ', airdropCallResponse);
      if (!airdropCallResponse.success) {
        setErrorMessage('There was an error gifting you your anky.');
        throw new Error('There was an error with the airdrop call.');
        return;
      }
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 15000));

      const callTbaResponse = await callTba(
        wallet.address,
        setUserAppInformation
      );
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
      localStorage.setItem('firstTimeUser100', 'done');
      setShowProgressModal(false);
      setUserIsReadyNow(true);
      return setSetupIsReady(true);
    } catch (error) {
      console.log('Error initializing user', error);
    }
  };

  const postAPI = async (endpoint, body) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return data;
  };

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

  async function mainSetup() {
    try {
      if (loading) return;
      if (!authenticated) {
        setAppLoading(false);
        return setShowProgressModal(false);
      }
      setShowProgressModal(true);
      if (
        authenticated &&
        wallet &&
        !settingThingsUp &&
        !localStorage.getItem('firstTimeUser100')
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
        localStorage.setItem('firstTimeUser100', 'done');
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

  // Check if the user has already gone through the setup process
  // useEffect(() => {
  //   async function checkUserSetup() {
  //     const storedUserAppInformation = await getUserData('userAppInformation');
  //     console.log('in here, the useraaljksc', storedUserAppInformation);
  //     if (storedUserAppInformation) {
  //       setUserAppInformation(storedUserAppInformation);
  //       setAppLoading(false);
  //       return;
  //     }
  //     // If not in IndexedDB, proceed with your current setup logic
  //     console.log('in here, time to go to the main setup');
  //     mainSetup();
  //   }
  //   checkUserSetup();
  // }, [loading, wallet, authenticated]);

  // useEffect(() => {
  //   if (userAppInformation && Object.keys(userAppInformation).length) {
  //     setUserData('userAppInformation', userAppInformation);
  //   }
  // }, [userAppInformation]);

  // useEffect(() => {
  //   const loadUserLibrary = async () => {
  //     try {
  //       if (
  //         setupIsReady &&
  //         authenticated &&
  //         wallet &&
  //         wallet.address &&
  //         wallet.address.length > 0
  //       ) {
  //         console.log('befoekfaouchsoa');
  //         const { tba } = await callTba(wallet.address);
  //         console.log('in here, the wallet is: ', wallet, tba);
  //         let provider = await wallet.getEthersProvider();
  //         const signer = await provider.getSigner();
  //         console.log('the signer is: ', signer);
  //         console.log('the user app information is: ', userAppInformation);
  //         let userTba = userAppInformation?.tbaAddress || tba;

  //         if (!userAppInformation || !userAppInformation.wallet)
  //           setUserAppInformation(x => {
  //             return { ...x, wallet };
  //           });
  //         console.log(
  //           'inside the user provider, right before the loading is set to false'
  //         );
  //         setAppLoading(false);
  //         if (!userAppInformation.userJournals) {
  //           const userJournals = await fetchUserJournals(signer);
  //           console.log('the user journals are213: ', userJournals);
  //           setUserAppInformation(x => {
  //             return { ...x, userJournals: userJournals };
  //           });
  //         }
  //         if (!userAppInformation.userNotebooks) {
  //           console.log('in here', userAppInformation);
  //           const userNotebooks = await fetchUserNotebooks(signer, userTba);
  //           console.log('the user notebooks are213: ', userNotebooks);

  //           setUserAppInformation(x => {
  //             return { ...x, userNotebooks: userNotebooks };
  //           });
  //         }
  //         if (!userAppInformation.userEulogias) {
  //           const userEulogias = await fetchUserEulogias(signer);
  //           console.log('the user eulogias are213: ', userEulogias);

  //           setUserAppInformation(x => {
  //             return { ...x, userEulogias: userEulogias };
  //           });
  //         }
  //         setLibraryLoading(false);
  //       } else {
  //         setAppLoading(false);
  //       }
  //     } catch (error) {
  //       setAppLoading(false);
  //       console.log('there was an error retrieving the users library.');
  //       console.log(error);
  //     }
  //   };
  //   loadUserLibrary();
  // }, [loading, wallets, setupIsReady]);

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
