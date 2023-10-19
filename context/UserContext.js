import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import {
  fetchUserEulogias,
  fetchUserNotebooks,
  fetchUserJournals,
  fetchUserDementors,
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
  const { authenticated, loading, getAccessToken } = usePrivy();

  const [userAppInformation, setUserAppInformation] = useState({});
  const [appLoading, setAppLoading] = useState(true);
  const [userIsReadyNow, setUserIsReadyNow] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingUserStoredData, setLoadingUserStoredData] = useState(true);
  const [finalSetup, setFinalSetup] = useState(false);
  const [settingThingsUp, setSettingThingsUp] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [setupIsReady, setSetupIsReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkIfUserIsTheSame, setCheckIfUserIsTheSame] = useState(false);
  const [reloadData, setReloadData] = useState(true);

  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  console.log('the wallets are: ', wallets);

  function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  // Load stored user data from IndexedDB and set it to state
  useEffect(() => {
    let aloja;
    async function loadStoredUserData() {
      if (isEmpty(userAppInformation)) {
        const userJournals = await getUserData('userJournals');
        const userNotebooks = await getUserData('userNotebooks');
        const userEulogias = await getUserData('userEulogias');
        const userDementors = await getUserData('userDementors');
        const ankyIndex = await getUserData('ankyIndex');
        const ankyTbaAddress = await getUserData('ankyTbaAddress');
        const userWalletAddress = await getUserData('userWalletAddress');

        console.log(
          '------------ BEFORE THE SET USER APP INFORMATION --------------------',
          userJournals,
          userNotebooks,
          userEulogias,
          ankyIndex,
          ankyTbaAddress,
          userWalletAddress,
          userDementors
        );
        setUserAppInformation({
          userJournals,
          userNotebooks,
          userEulogias,
          userDementors,
          ankyIndex,
          ankyTbaAddress,
          userWalletAddress,
        });
      }
      setLoadingUserStoredData(false);
    }
    loadStoredUserData();
  }, []);

  // Check initialization and setup status
  useEffect(() => {
    async function handleInitialization() {
      if (loading) return;
      if (loadingUserStoredData) return;
      console.log('inside hereaasc213');
      if (wallet && !wallet.chainId.includes('84531')) await changeChain();

      if (!authenticated) {
        setAppLoading(false);
        return;
      }
      console.log('the wallet is: ', wallet);
      console.log('the wallets are: ', wallets);
      const isUserTheSame =
        wallet?.address == userAppInformation?.wallet?.address;
      console.log('user is the same', isUserTheSame);
      setCheckIfUserIsTheSame(isUserTheSame);

      if ((shouldInitializeUser() && wallet) || isUserTheSame) {
        if (wallets.length > 1)
          return alert('Please disconnect one of your wallets to proceed');
        await initializeUser();
      } else {
        setLibraryLoading(false);
        setAppLoading(false);
      }
    }
    handleInitialization();
  }, [loading, loadingUserStoredData, authenticated, wallet, userIsReadyNow]);

  // Load the user's library when setup is ready
  useEffect(() => {
    if (userIsReadyNow) {
      loadUserLibrary();
    }
  }, [userIsReadyNow]);

  useEffect(() => {
    if (finalSetup) {
      console.log(
        '************right before here*************',
        userAppInformation
      );
      setUserData('userJournals', userAppInformation.userJournals);
      setUserData('userNotebooks', userAppInformation.userNotebooks);
      setUserData('userEulogias', userAppInformation.userEulogias);
      setUserData('userDementors', userAppInformation.userDementors);
      setUserData('ankyIndex', userAppInformation.ankyIndex);
      setUserData('ankyTbaAddress', userAppInformation.tbaAddress);
      setUserData('userWalletAddress', userAppInformation.userWalletAddress);
    }
  }, [finalSetup]);

  const shouldInitializeUser = () => {
    // return authenticated && wallet && true;
    console.log(
      'inside the should initialize user',
      localStorage.getItem('firstTimeUser134'),
      authenticated,
      wallet,
      userAppInformation
    );
    return (
      localStorage.getItem('firstTimeUser134') ||
      (authenticated &&
        wallet &&
        !userAppInformation.ankyIndex &&
        !userAppInformation.ankyTbaAddress)
    );
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
        let provider = await wallet?.getEthersProvider();
        const signer = await provider.getSigner();
        let userTba = userAppInformation?.tbaAddress || tba;

        if (!userAppInformation || !userAppInformation.wallet)
          setUserAppInformation(x => {
            return { ...x, wallet };
          });

        if (reloadData || !userAppInformation.userJournals) {
          console.log('before fetching the journals');
          const userJournals = await fetchUserJournals(signer);
          console.log('the user journals are: ', userJournals);
          setUserAppInformation(x => {
            return { ...x, userJournals: userJournals };
          });
        }

        if (reloadData || !userAppInformation.userNotebooks) {
          console.log('before fetching the notebooks');

          const userNotebooks = await fetchUserNotebooks(signer, userTba);
          console.log('the user notebooks are: ', userNotebooks);

          setUserAppInformation(x => {
            return { ...x, userNotebooks: userNotebooks };
          });
        }

        if (reloadData || !userAppInformation.userEulogias) {
          console.log('before fetching the eulogias');

          const userEulogias = await fetchUserEulogias(signer);
          console.log('the user eulogias are: ', userEulogias);

          setUserAppInformation(x => {
            return { ...x, userEulogias: userEulogias };
          });
        }

        if (reloadData || !userAppInformation.userDementors) {
          console.log('before fetching the dementors');

          const userDementors = await fetchUserDementors(signer);
          console.log('the user dementors are: ', userDementors);

          setUserAppInformation(x => {
            return { ...x, userDementors: userDementors };
          });
        }
        setLibraryLoading(false);
        setFinalSetup(true);
      } else {
        setAppLoading(false);
      }
    } catch (error) {
      setAppLoading(false);
      console.log('there was an error retrieving the users library.', error);
    }
  };

  const initializeUser = async () => {
    console.log('inside the initialize user function');
    try {
      if (setupIsReady) return;
      if (loading) return;
      if (!authenticated) {
        setAppLoading(false);
        return setShowProgressModal(false);
      }
      if (!wallet?.address) return;
      console.log('in hereAKHCKSA', userAppInformation);
      setShowProgressModal(true);

      setSettingThingsUp(true);
      const authToken = await getAccessToken();
      await changeChain();
      setCurrentStep(1);

      let provider = await wallet?.getEthersProvider();
      if (checkIfUserIsTheSame || !userAppInformation.ankyIndex) {
        const testEthResponse = await sendTestEth(wallet, provider, authToken);
        if (!testEthResponse.success) {
          setErrorMessage('There was an error sending you the test eth');
          throw new Error('There was an error sending the test eth.');
        }
        const airdropCallResponse = await airdropCall(
          wallet,
          setUserAppInformation,
          authToken
        );
        console.log('the airdrop call response is: ', airdropCallResponse);
        setUserAppInformation(x => {
          return {
            ...x,
            tokenUri: airdropCallResponse.tokenUri,
            ankyIndex: airdropCallResponse.ankyIndex,
            userWalletAddress: wallet.address,
          };
        });
        if (!airdropCallResponse.success) {
          setErrorMessage('There was an error gifting you your anky.');
          throw new Error('There was an error with the airdrop call.');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 8000));
      }
      setCurrentStep(2);
      setCurrentStep(3);

      if (checkIfUserIsTheSame || (!userAppInformation.tbaAddress && wallet)) {
        const callTbaResponse = await callTba(
          wallet.address,
          setUserAppInformation
        );
        console.log('the tba call response is: ', callTbaResponse);
        setUserAppInformation(x => {
          return {
            ...x,
            tbaAddress: callTbaResponse.tba,
          };
        });
        if (!callTbaResponse.success) {
          setErrorMessage('There was an error retrieving your tba.');
          throw new Error('There was an error with the tba call.');
          return;
        }
      }
      setCurrentStep(4);

      if (
        checkIfUserIsTheSame ||
        !userAppInformation.userJournals ||
        (userAppInformation.userJournals.length !== 0 && wallet)
      ) {
        const tx = await airdropFirstJournal(wallet.address, authToken);
        // console.log('the tx is: ', tx);
        // const receipt = await tx.wait();
        // console.log('the receipt is: ', receipt);
        // const eventTopic = ethers.utils.id(
        //   'JournalAirdropped(tokenId, usersAnkyAddress)'
        // );

        // for (const log of receipt.logs) {
        //   if (log.topics[0] === eventTopic) {
        //     const decodedLog = journalsContract.interface.parseLog(log);
        //     const { tokenId } = decodedLog.args;
        //     const newJournalElement = {
        //       journalId: tokenId.toString(),
        //       entries: [],
        //       journalType: 0,
        //       metadataCID: '',
        //     };

        //     setUserAppInformation(x => {
        //       setUserData('userJournals', [newJournalElement]);
        //       return {
        //         ...x,
        //         userJournals: [newJournalElement],
        //       };
        //     });
        //     break; // Exit loop once you find the first event that matches
        //   }
        // }

        // if (!journaltx.success) {
        //   setErrorMessage('There was an en error with your journal.');
        // }
      }
      setCurrentStep(5);

      console.log('all the setup is ready');
      localStorage.setItem('firstTimeUser134', 'done');
      setUserIsReadyNow(true);
      return setSetupIsReady(true);
    } catch (error) {
      console.log('Error initializing user', error);
    }
  };

  const postAPI = async (endpoint, body) => {
    const authToken = await getAccessToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
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
