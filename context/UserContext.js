import React, { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Wallet, ethers } from "ethers";
import axios from "axios";
import ankyOneABI from "../lib/ankyOne.json";
import degenBaseMainnetAbi from "../lib/degenBaseMainnetAbi.json";
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
      const writings = await getThisUserWritings(wallet.address);
      const sortedWritings = writings.sort(sortWritings);

      setAllUserWritings(sortedWritings);
    }

    getAllUserWritings();
  }, [wallet]);

  async function getUsersEthBalance(provider, address) {
    try {
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      console.log(`User's ETH Balance: ${balanceInEth}`);
      return balanceInEth; // Returns the balance in Ether (ETH)
    } catch (error) {
      console.log(
        "there was an error fetching the user's base ETH balance",
        error
      );
      return null;
    }
  }

  async function getUsersDegenBalance(provider, address) {
    try {
      const signer = await provider.getSigner();
      const degenTokenContractAddress =
        "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed"; // Example address, replace with actual $DEGEN contract address
      const degenTokenContract = new ethers.Contract(
        degenTokenContractAddress,
        degenBaseMainnetAbi,
        signer
      );

      const balance = await degenTokenContract.balanceOf(address);
      const balanceInDegen = ethers.utils.formatUnits(balance, 18); // Assuming the $DEGEN token has 18 decimals
      console.log(`User's $DEGEN Balance: ${balanceInDegen}`);
      return balanceInDegen; // Returns the balance in $DEGEN
    } catch (error) {
      console.log(
        "there was an error fetching the user's DEGEN balance",
        error
      );
      return null;
    }
  }

  async function getUsersAnkyLibrary(address) {
    try {
    } catch (error) {
      console.log("there was an error fetching the users ankys");
      return [];
    }
  }

  // Check initialization and setup status
  useEffect(() => {
    async function handleInitialization() {
      console.log(
        "this function -handle initialization- is being called",
        wallet,
        ready,
        authenticated
      );

      if (loading && !ready) return;
      if (ready && !wallet && !authenticated) {
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
      console.log("the users wallet is: ", wallet);
      setUsersAnkyUri(usersAnkyUri);
      setUsersAnkyImage(usersImage);
      setUserOwnsAnky(true);
      setMainAppLoading(false);
      if (loadingUserStoredData) return;

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
        const provider = await wallet.getEthersProvider();
        // get the users ether and degen balance
        const baseEthBalance = await getUsersEthBalance(
          provider,
          wallet.address
        );
        const degenBalance = await getUsersDegenBalance(
          provider,
          wallet.address
        );

        setUserDatabaseInformation({
          streak: response.data.user.streak || 0,
          manaBalance: response.data.user.manaBalance || 0,
          baseEthBalance: baseEthBalance,
          degenBalance: degenBalance,
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
