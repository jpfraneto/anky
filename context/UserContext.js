import React, { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Wallet, ethers } from "ethers";
import axios from "axios";
import {
  fetchUserEulogias,
  fetchUserTemplates,
  fetchUserNotebooks,
  fetchUserJournals,
  fetchUserDementors,
} from "../lib/notebooks";
import { getThisUserWritings } from "../lib/irys";
import AccountSetupModal from "../components/AccountSetupModal";
import { setUserData, getUserData } from "../lib/idbHelper";
import airdropABI from "../lib/airdropABI.json";
import {
  sendTestEth,
  airdropCall,
  callTba,
  airdropFirstJournal,
} from "../lib/helpers";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { authenticated, loading, getAccessToken, ready, user } = usePrivy();

  const [userAppInformation, setUserAppInformation] = useState({});
  const [userDatabaseInformation, setUserDatabaseInformation] = useState({});
  const [appLoading, setAppLoading] = useState(true);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [userIsReadyNow, setUserIsReadyNow] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState({});
  const [allUserWritings, setAllUserWritings] = useState([]);
  const [usersAnkyImage, setUsersAnkyImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [usersAnkyUri, setUsersAnkyUri] = useState("");
  const [userOwnsAnky, setUserOwnsAnky] = useState("");
  const [loadingUserStoredData, setLoadingUserStoredData] = useState(true);
  const [mainAppLoading, setMainAppLoading] = useState(true);
  const [finalSetup, setFinalSetup] = useState(false);
  const [settingThingsUp, setSettingThingsUp] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [usersAnky, setUsersAnky] = useState({
    ankyIndex: undefined,
    ankyUri: undefined,
  });
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
        const userJournals = await getUserData("userJournals");
        const userTemplates = await getUserData("userTemplates");
        const userNotebooks = await getUserData("userNotebooks");
        const userEulogias = await getUserData("userEulogias");
        const userDementors = await getUserData("userDementors");
        const ankyIndex = await getUserData("ankyIndex");
        const ankyTbaAddress = await getUserData("ankyTbaAddress");
        const userWalletAddress = await getUserData("userWalletAddress");

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

  function sortWritings(a, b) {
    const timestampA = a.timestamp;
    const timestampB = b.timestamp;
    return timestampB - timestampA;
  }

  useEffect(() => {
    async function getAllUserWritings() {
      if (!wallet) return;
      if (!authenticated) return;
      console.log("IN HEREEEE, THE WALLET IS.", wallet);
      const writings = await getThisUserWritings(wallet.address);
      const sortedWritings = writings.sort(sortWritings);
      console.log(
        "all the sorted writings are inside the user contextr:",
        sortedWritings
      );
      setAllUserWritings(sortedWritings);
    }

    getAllUserWritings();
  }, [wallet]);

  // Check initialization and setup status
  useEffect(() => {
    async function handleInitialization() {
      if (loading && !ready) return;
      if (ready && !wallet && !authenticated) {
        console.log("INEIS");
        setMainAppLoading(false);
        setAppLoading(false);
        return;
      }
      setTimeout(() => {
        setMainAppLoading(false);
      }, 5000);
      if (!wallet) return;
      await changeChain();
      const response = await fetchUsersAnky();
      if (!response) return setMainAppLoading(false);
      let usersAnkys = response.usersAnkys;
      let usersAnkyUri = response.usersAnkyUri;
      let usersImage = response.imageUrl;
      if (usersAnkys == 0) {
        setUserOwnsAnky(false);
        return setMainAppLoading(false);
      }
      setUsersAnkyUri(usersAnkyUri);
      setUsersAnkyImage(usersImage);
      setUserOwnsAnky(true);
      setMainAppLoading(false);
      if (loadingUserStoredData) return;

      if (wallet && !wallet.chainId.includes("8453")) await changeChain();
      setLibraryLoading(false);
      setAppLoading(false);
    }

    handleInitialization();
  }, [wallet, ready]);

  // Load the user's library when setup is ready
  useEffect(() => {
    if (userIsReadyNow) {
      loadUserLibrary();
    }
  }, [userIsReadyNow]);

  useEffect(() => {
    if (finalSetup) {
      setUserData("userJournals", userAppInformation.userJournals);
      setUserData("userTemplates", userAppInformation.userTemplates);
      setUserData("userNotebooks", userAppInformation.userNotebooks);
      setUserData("userEulogias", userAppInformation.userEulogias);
      setUserData("userDementors", userAppInformation.userDementors);
      setUserData("ankyIndex", userAppInformation.ankyIndex);
      setUserData("ankyTbaAddress", userAppInformation.tbaAddress);
      setUserData("userWalletAddress", userAppInformation.userWalletAddress);
    }
  }, [finalSetup]);

  useEffect(() => {
    const loadUserDatabaseInformation = async () => {
      try {
        if (!authenticated) return;
        const authToken = await getAccessToken();
        const thisUserPrivyId = user.id.replace("did:privy:", "");
        const thisFarcasterAccount = farcasterUser || null;
        if (!thisFarcasterAccount?.fid) thisFarcasterAccount.fid = null;

        if (!authToken) return;
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/user/${thisUserPrivyId}`,
          { thisFarcasterAccount },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        setUserDatabaseInformation({
          streak: response.data.user.streak || 0,
          manaBalance: response.data.user.manaBalance || 0,
        });
        if (response.data.farcasterAccount) {
          setFarcasterUser(response.data.farcasterAccount);
        }
      } catch (error) {
        console.log("there was an errror here0, ", error);
      }
    };
    loadUserDatabaseInformation();
  }, [user, authenticated]);

  const loadUserLibrary = async (fromOutside = false) => {
    try {
      if (
        (setupIsReady || fromOutside) &&
        authenticated &&
        wallet &&
        wallet.address &&
        wallet.address.length > 0
      ) {
        setLoadingLibrary(true);
        const { tba } = await callTba(wallet.address, setUserAppInformation);
        let provider = await wallet?.getEthersProvider();
        const signer = await provider.getSigner();
        let userTba = userAppInformation?.tbaAddress || tba;

        if (!userAppInformation || !userAppInformation.wallet)
          setUserAppInformation((x) => {
            return { ...x, wallet };
          });

        const promises = [];

        if (fromOutside || reloadData || !userAppInformation.userJournals) {
          promises.push(
            fetchUserJournals(signer, wallet).then((userJournals) => {
              setUserAppInformation((x) => {
                return { ...x, userJournals: userJournals };
              });
            })
          );
        }

        if (fromOutside || reloadData || !userAppInformation.userNotebooks) {
          promises.push(
            fetchUserNotebooks(signer, userTba, wallet).then(
              (userNotebooks) => {
                setUserAppInformation((x) => {
                  return { ...x, userNotebooks: userNotebooks };
                });
              }
            )
          );
        }

        if (fromOutside || reloadData || !userAppInformation.userEulogias) {
          promises.push(
            fetchUserEulogias(signer, wallet).then((userEulogias) => {
              setUserAppInformation((x) => {
                return { ...x, userEulogias: userEulogias };
              });
            })
          );
        }

        if (fromOutside || reloadData || !userAppInformation.userDementors) {
          promises.push(
            fetchUserDementors(signer, wallet).then((userDementors) => {
              setUserAppInformation((x) => {
                return { ...x, userDementors: userDementors };
              });
            })
          );
        }

        await Promise.all(promises);

        setLoadingLibrary(false);
        setLibraryLoading(false);
        setFinalSetup(true);
      } else {
        setAppLoading(false);
      }
    } catch (error) {
      setAppLoading(false);
      setLoadingLibrary(false);
      alert("There was an error retrieving your library :(");
      console.log("there was an error retrieving the users library.", error);
    }
  };

  async function fetchUsersAnky() {
    if (!wallet || !wallet.address) return;
    try {
      let provider = await wallet.getEthersProvider();
      let signer = await provider.getSigner();
      if (!provider) return;
      const ankyAirdropContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_AIRDROP_SMART_CONTRACT,
        airdropABI,
        signer
      );
      const usersBalance = await ankyAirdropContract.balanceOf(wallet.address);
      let usersAnkyUri = "";
      const usersAnkys = ethers.utils.formatUnits(usersBalance, 0);
      if (usersAnkys > 0) {
        const usersAnkyId = await ankyAirdropContract.tokenOfOwnerByIndex(
          wallet.address,
          0
        );
        usersAnkyUri = await ankyAirdropContract.tokenURI(usersAnkyId);
        const transformUri = (broken) => {
          return `https://ipfs.io/ipfs/${broken.split("ipfs://")[1]}`;
        };
        const fetchableUri = transformUri(usersAnkyUri);
        const metadata = await fetch(fetchableUri);
        const jsonMetadata = await metadata.json();
        let imageUrl = transformUri(jsonMetadata.image);
        setUsersAnky({
          ankyIndex: usersAnkys,
          ankyUri: usersAnkyUri,
          imageUrl: imageUrl,
        });
        return { usersAnkys, usersAnkyUri, imageUrl };
      } else {
        setUsersAnky({ ankyIndex: undefined, ankyUri: undefined });
        return { usersAnkys: 0, usersAnkyUri: "", imageUrl: "" };
      }
    } catch (error) {
      console.log("there was an error", error);
    }
  }

  async function getTestEthAndAidropAnky(wallet, provider, authToken) {
    const testEthResponse = await sendTestEth(wallet, provider, authToken);
    if (!testEthResponse.success) {
      setErrorMessage("There was an error sending you the test eth");
      throw new Error("There was an error sending the test eth.");
    }
    const airdropCallResponse = await airdropCall(
      wallet,
      setUserAppInformation,
      authToken
    );
    setUserAppInformation((x) => {
      return {
        ...x,
        tokenUri: airdropCallResponse.tokenUri,
        ankyIndex: airdropCallResponse.ankyIndex,
        userWalletAddress: wallet.address,
      };
    });
    if (!airdropCallResponse.success) {
      setErrorMessage("There was an error gifting you your anky.");
      throw new Error("There was an error with the airdrop call.");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 8000));
  }
  async function getTbaInformation(wallet, setUserAppInformation) {
    const callTbaResponse = await callTba(
      wallet.address,
      setUserAppInformation
    );
    setUserAppInformation((x) => {
      return {
        ...x,
        tbaAddress: callTbaResponse.tba,
      };
    });
    if (!callTbaResponse.success) {
      setErrorMessage("There was an error retrieving your tba.");
      throw new Error("There was an error with the tba call.");
      return;
    }
  }
  async function airdropUsersFirstJournal(address, authToken, provider) {
    const response = await airdropFirstJournal(address, authToken);

    if (response && response.success) {
      const txHash = response.txHash;
      // Assuming you have a provider instance to query the Ethereum network
      const txReceipt = await provider.getTransactionReceipt(txHash);

      const eventTopic = ethers.utils.id(
        "JournalAirdropped(tokenId, usersAnkyAddress)"
      );

      for (const log of txReceipt.logs) {
        if (log.topics[0] === eventTopic) {
          const decodedLog = journalsContract.interface.parseLog(log);
          const { tokenId } = decodedLog.args;
          const newJournalElement = {
            journalId: tokenId,
            entries: [],
            journalType: 0,
            metadataCID: "",
          };

          setUserAppInformation((x) => {
            return {
              ...x,
              userJournals: [newJournalElement],
            };
          });
          setUserData("userJournals", [newJournalElement]);
          break;
        }
      }
    } else {
      setErrorMessage("There was an error with your journal.");
    }
  }

  const initializeUser = async () => {
    try {
      if (setupIsReady) return;
      if (loading) return;
      if (!wallet && !wallet?.address) return;

      setShowProgressModal(true);
      setSettingThingsUp(true);
      const authToken = await getAccessToken();
      await changeChain();
      setCurrentStep(1);

      let provider = await wallet.getEthersProvider();
      if (checkIfUserIsTheSame || !userAppInformation.ankyIndex) {
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
          console.log("there was an error airdropping her ");
        }
      }
      setCurrentStep(5);

      localStorage.setItem("firstTimeUser189", "done");
      setUserIsReadyNow(true);
      setShowProgressModal(false);
      return setSetupIsReady(true);
    } catch (error) {
      console.log("Error initializing user", error);
    }
  };

  const changeChain = async () => {
    if (authenticated && wallet) {
      await wallet.switchChain(8453);
      setUserAppInformation((x) => {
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
        loadUserLibrary,
        userDatabaseInformation,
        setUserDatabaseInformation,
        userOwnsAnky,
        setUserOwnsAnky,
        mainAppLoading,
        setMainAppLoading,
        usersAnky,
        usersAnkyImage,
        farcasterUser,
        setFarcasterUser,
        allUserWritings,
        setAllUserWritings,
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
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
