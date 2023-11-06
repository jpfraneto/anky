import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import {
  fetchUserEulogias,
  fetchUserTemplates,
  fetchUserNotebooks,
  fetchUserJournals,
  fetchUserDementors,
} from '../lib/notebooks';
import AccountSetupModal from '../components/AccountSetupModal';
import { setUserData, getUserData } from '../lib/idbHelper';
import airdropABI from '../lib/airdropABI.json';
import {
  sendTestEth,
  airdropCall,
  callTba,
  airdropFirstJournal,
} from '../lib/helpers';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { authenticated, loading, getAccessToken, ready } = usePrivy();

  const [userAppInformation, setUserAppInformation] = useState({});
  const [appLoading, setAppLoading] = useState(true);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [userIsReadyNow, setUserIsReadyNow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userOwnsAnky, setUserOwnsAnky] = useState('');
  const [loadingUserStoredData, setLoadingUserStoredData] = useState(true);
  const [mainAppLoading, setMainAppLoading] = useState(true);
  const [finalSetup, setFinalSetup] = useState(false);
  const [settingThingsUp, setSettingThingsUp] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [setupIsReady, setSetupIsReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkIfUserIsTheSame, setCheckIfUserIsTheSame] = useState(false);
  const [reloadData, setReloadData] = useState(false);

  const wallets = useWallets();
  const wallet = wallets.wallets[0];

  function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  // Load stored user data from IndexedDB and set it to state
  useEffect(() => {
    async function loadStoredUserData() {
      if (ready && isEmpty(userAppInformation)) {
        const userJournals = await getUserData('userJournals');
        const userTemplates = await getUserData('userTemplates');
        const userNotebooks = await getUserData('userNotebooks');
        const userEulogias = await getUserData('userEulogias');
        const userDementors = await getUserData('userDementors');
        const ankyIndex = await getUserData('ankyIndex');
        const ankyTbaAddress = await getUserData('ankyTbaAddress');
        const userWalletAddress = await getUserData('userWalletAddress');

        console.log(
          '------------ BEFORE THE SET USER APP INFORMATION --------------------',
          userJournals,
          userTemplates,
          userNotebooks,
          userEulogias,
          ankyIndex,
          ankyTbaAddress,
          userWalletAddress,
          userDementors
        );
        setUserAppInformation({
          userJournals,
          userTemplates,
          userNotebooks,
          userEulogias,
          userDementors,
          ankyIndex,
          ankyTbaAddress,
          userWalletAddress,
        });
        setLoadingUserStoredData(false);
      }
    }
    loadStoredUserData();
  }, [ready]);

  // Check initialization and setup status
  useEffect(() => {
    async function handleInitialization() {
      if (loading && !ready) return;
      if (!authenticated && ready) {
        console.log('running the hereee');
        setMainAppLoading(false);
        setAppLoading(false);
        return;
      }
      const usersAnkyBalance = await fetchUsersAnky();
      console.log('after fetching the user anky,', usersAnkyBalance);
      if (usersAnkyBalance == 0) {
        setUserOwnsAnky(false);
        return setMainAppLoading(false);
      }
      console.log('after hereee');
      setUserOwnsAnky(true);
      setMainAppLoading(false);
      if (loadingUserStoredData) return;
      console.log('inside hereaasc213');

      if (wallet && !wallet.chainId.includes('84531')) await changeChain();
      console.log('the wallet is: ', wallet);
      console.log('the wallets are: ', wallets, userAppInformation?.wallet);
      const isUserTheSame =
        wallet?.address == userAppInformation?.wallet?.address;
      console.log('user is the same', isUserTheSame);
      setCheckIfUserIsTheSame(isUserTheSame);

      if ((shouldInitializeUser() && wallet) || isUserTheSame) {
        if (wallets.length > 1)
          return alert('Please disconnect one of your wallets to proceed');
        // await initializeUser();
      } else {
        setLibraryLoading(false);
        setAppLoading(false);
      }
    }
    handleInitialization();
  }, [loadingUserStoredData, wallet]);

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
      setUserData('userTemplates', userAppInformation.userTemplates);
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
      localStorage.getItem('firstTimeUser189'),
      authenticated,
      wallet,
      userAppInformation
    );
    return (
      !localStorage.getItem('firstTimeUser189') ||
      (authenticated &&
        wallet &&
        !userAppInformation?.ankyIndex &&
        !userAppInformation?.ankyTbaAddress &&
        !userAppInformation?.ankyTbaAddress?.length > 0)
    );
  };

  // const loadUserLibrary = async (fromOutside = false) => {
  //   console.log(
  //     'inside the load user library function',
  //     setupIsReady,
  //     fromOutside,
  //     authenticated,
  //     wallet
  //   );
  //   try {
  //     if (
  //       (setupIsReady || fromOutside) &&
  //       authenticated &&
  //       wallet &&
  //       wallet.address &&
  //       wallet.address.length > 0
  //     ) {
  //       setLoadingLibrary(true);
  //       console.log('loading the users library');
  //       const { tba } = await callTba(wallet.address, setUserAppInformation);
  //       let provider = await wallet?.getEthersProvider();
  //       const signer = await provider.getSigner();
  //       let userTba = userAppInformation?.tbaAddress || tba;

  //       if (!userAppInformation || !userAppInformation.wallet)
  //         setUserAppInformation(x => {
  //           return { ...x, wallet };
  //         });

  //       if (fromOutside || reloadData || !userAppInformation.userJournals) {
  //         console.log('before fetching the journals');
  //         const userJournals = await fetchUserJournals(signer);
  //         console.log('the user journals are: ', userJournals);
  //         setUserAppInformation(x => {
  //           return { ...x, userJournals: userJournals };
  //         });
  //       }

  //       if (fromOutside || reloadData || !userAppInformation.userNotebooks) {
  //         console.log('before fetching the notebooks');

  //         const userNotebooks = await fetchUserNotebooks(signer, userTba);
  //         console.log('the user notebooks are: ', userNotebooks);

  //         setUserAppInformation(x => {
  //           return { ...x, userNotebooks: userNotebooks };
  //         });
  //       }

  //       if (fromOutside || reloadData || !userAppInformation.userTemplates) {
  //         console.log('before fetching the templates');

  //         const userTemplates = await fetchUserTemplates(
  //           signer,
  //           wallet.address
  //         );
  //         console.log('the user templates are: ', userTemplates);

  //         setUserAppInformation(x => {
  //           return { ...x, userTemplates: userTemplates };
  //         });
  //       }

  //       if (fromOutside || reloadData || !userAppInformation.userEulogias) {
  //         console.log('before fetching the eulogias');

  //         const userEulogias = await fetchUserEulogias(signer);
  //         console.log('the user eulogias are: ', userEulogias);

  //         setUserAppInformation(x => {
  //           return { ...x, userEulogias: userEulogias };
  //         });
  //       }

  //       if (fromOutside || reloadData || !userAppInformation.userDementors) {
  //         console.log('before fetching the dementors');

  //         const userDementors = await fetchUserDementors(signer);
  //         console.log('the user dementors are: ', userDementors);

  //         setUserAppInformation(x => {
  //           return { ...x, userDementors: userDementors };
  //         });
  //       }
  //       setLoadingLibrary(false);
  //       setLibraryLoading(false);
  //       setFinalSetup(true);
  //     } else {
  //       setAppLoading(false);
  //     }
  //   } catch (error) {
  //     setAppLoading(false);
  //     setLoadingLibrary(false);
  //     alert('There was an error retrieving your library :(');
  //     console.log('there was an error retrieving the users library.', error);
  //   }
  // };
  async function getTestEthAndAidropAnky(wallet, provider, authToken) {
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
  async function getTbaInformation(wallet, setUserAppInformation) {
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
  async function airdropUsersFirstJournal(address, authToken, provider) {
    const response = await airdropFirstJournal(address, authToken);
    console.log('the response is: ', response);

    if (response && response.success) {
      const txHash = response.txHash;
      // Assuming you have a provider instance to query the Ethereum network
      const txReceipt = await provider.getTransactionReceipt(txHash);
      console.log('the tx receipt is: ', txReceipt);

      const eventTopic = ethers.utils.id(
        'JournalAirdropped(tokenId, usersAnkyAddress)'
      );

      for (const log of txReceipt.logs) {
        if (log.topics[0] === eventTopic) {
          const decodedLog = journalsContract.interface.parseLog(log);
          const { tokenId } = decodedLog.args;
          const newJournalElement = {
            journalId: tokenId,
            entries: [],
            journalType: 0,
            metadataCID: '',
          };

          setUserAppInformation(x => {
            return {
              ...x,
              userJournals: [newJournalElement],
            };
          });
          setUserData('userJournals', [newJournalElement]);
          break;
        }
      }
    } else {
      setErrorMessage('There was an error with your journal.');
    }
  }

  async function fetchUsersAnky() {
    if (!wallet && !wallet?.address) return;
    let provider = await wallet.getEthersProvider();
    let signer = await provider.getSigner();
    const ankyAirdropContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_ANKY_AIRDROP_SMART_CONTRACT,
      airdropABI,
      signer
    );
    console.log('IN HEEERE', wallet.address);
    const userAddress = wallet.address;
    console.log(
      'the anky airdrop contract is: ',
      userAddress,
      ankyAirdropContract
    );
    const usersAnkyBalance = await ankyAirdropContract.balanceOf(userAddress);
    return ethers.utils.formatUnits(usersAnkyBalance, 0);
  }

  const initializeUser = async () => {
    console.log('inside the initialize user function');
    try {
      if (setupIsReady) return;
      if (loading) return;
      if (!wallet && !wallet?.address) return;
      console.log('in hereAKHCKSA', userAppInformation);
      console.log('THE WALLET IS: ', wallet);
      setShowProgressModal(true);
      setSettingThingsUp(true);
      const authToken = await getAccessToken();
      await changeChain();
      setCurrentStep(1);

      let provider = await wallet.getEthersProvider();
      if (checkIfUserIsTheSame || !userAppInformation.ankyIndex) {
        console.log('in here, the provider is: ', provider);
        await getTestEthAndAidropAnky(wallet, provider, authToken);
      }
      setCurrentStep(2);
      setCurrentStep(3);

      if (checkIfUserIsTheSame || (!userAppInformation.tbaAddress && wallet)) {
        await getTbaInformation(wallet, setUserAppInformation);
      }
      setCurrentStep(4);

      if (
        checkIfUserIsTheSame ||
        !userAppInformation.userJournals ||
        (userAppInformation.userJournals.length === 0 && wallet)
      ) {
        try {
          const airdropJournalResponse = await airdropUsersFirstJournal(
            wallet.address,
            authToken,
            provider
          );
        } catch (error) {
          console.log('there was an error airdropping her ');
        }
      }
      setCurrentStep(5);

      console.log('all the initial setup is ready');
      localStorage.setItem('firstTimeUser189', 'done');
      setUserIsReadyNow(true);
      setShowProgressModal(false);
      return setSetupIsReady(true);
    } catch (error) {
      console.log('Error initializing user', error);
    }
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
        loadingLibrary,
        libraryLoading,
        // loadUserLibrary,
        userOwnsAnky,
        setUserOwnsAnky,
        mainAppLoading,
        setMainAppLoading,
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
