import React, { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Wallet, ethers } from "ethers";
import axios from "axios";
import ankyMentorsABI from "../lib/ankyMentorsABI.json";
import degenBaseMainnetAbi from "../lib/degenBaseMainnetAbi.json";
import { getThisUserWritings } from "../lib/irys";
import AccountSetupModal from "../components/AccountSetupModal";
import { setUserData, getUserData } from "../lib/idbHelper";
import { callTba } from "../lib/helpers";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { authenticated, loading, getAccessToken, ready, user } = usePrivy();

  const [userAppInformation, setUserAppInformation] = useState({});
  const [userDatabaseInformation, setUserDatabaseInformation] = useState({});
  const [appLoading, setAppLoading] = useState(true);
  const [userIsReadyNow, setUserIsReadyNow] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState({});
  const [allUserWritings, setAllUserWritings] = useState([]);
  const [usersAnkyImage, setUsersAnkyImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userOwnsAnky, setUserOwnsAnky] = useState(false);
  const [loadingUserStoredData, setLoadingUserStoredData] = useState(true);
  const [mainAppLoading, setMainAppLoading] = useState(true);
  const [finalSetup, setFinalSetup] = useState(false);
  const [settingThingsUp, setSettingThingsUp] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [usersAnky, setUsersAnky] = useState({
    ankyIndex: undefined,
    ankyUri: undefined,
  });
  const [usersAnkyMentors, setUsersAnkyMentors] = useState([]);
  const [chosenUserAnkyMentor, setChosenUserAnkyMentor] = useState({
    ankyUri: "",
    image: "",
    metadata: {},
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
      console.log("load the user darta");
      if (ready && isEmpty(userAppInformation)) {
        const ankyIndex = await getUserData("ankyIndex");
        const userWalletAddress = await getUserData("userWalletAddress");

        setUserAppInformation({
          ankyIndex,
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

  // Check initialization and setup status
  useEffect(() => {
    console.log("on this useEffect");
    async function handleInitialization() {
      console.log("IN HERE");
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
      setUsersAnkyUri(usersAnkyUri);
      setUsersAnkyImage(usersImage);
      setUserOwnsAnky(true);
      setMainAppLoading(false);
      if (loadingUserStoredData) return;

      setAppLoading(false);
    }

    handleInitialization();
  }, [wallet, authenticated, ready]);

  // Load the user's library when setup is ready
  useEffect(() => {
    if (userIsReadyNow) {
    }
  }, [userIsReadyNow]);

  useEffect(() => {
    if (finalSetup) {
      setUserData("ankyIndex", userAppInformation.ankyIndex);
      setUserData("userWalletAddress", userAppInformation.userWalletAddress);
    }
  }, [finalSetup]);

  useEffect(() => {
    const loadUserDatabaseInformation = async () => {
      try {
        console.log("inside the load user database information function");
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

  async function fetchUsersAnky() {
    if (!wallet || !wallet.address) return;
    try {
      let provider = await wallet.getEthersProvider();
      let signer = await provider.getSigner();
      if (!provider) return;
      const ankyMentorsContract = new ethers.Contract(
        "0x6d622549842bc73a8f2be146a27f026b646bf6a1",
        ankyMentorsABI,
        signer
      );
      const usersBalance = await ankyMentorsContract.balanceOf(wallet.address);
      console.log("the users balance of ankys is: ", usersBalance);
      const usersAnkys = ethers.utils.formatUnits(usersBalance, 0);
      console.log("the users ankys", usersAnkys);

      if (usersAnkys > 0) {
        setUserOwnsAnky(true);
        // for (let i = 0; i < usersAnkys; i++) {
        //   const usersAnkyId = await ankyMentorsContract.tokenOfOwnerByIndex(
        //     wallet.address,
        //     0
        //   );
        //   const highlightUri =
        //     "https://highlight-creator-assets.highlight.xyz/main/base-dir/278b5bb6-5920-40cf-ab4b-f733184a871c/onChainDir/";

        //   const fetchableUri = transformUri(usersAnkyUri);
        //   const metadata = await fetch(fetchableUri);
        //   const jsonMetadata = await metadata.json();
        //   let imageUrl = transformUri(jsonMetadata.image);
        //   setUsersAnky({
        //     ankyIndex: usersAnkys,
        //     ankyUri: usersAnkyUri,
        //     imageUrl: imageUrl,
        //   });
        // }

        // return { usersAnkys, usersAnkyUri, imageUrl };
      } else {
        // setUsersAnky({ ankyIndex: undefined, ankyUri: undefined });
        // return { usersAnkys: 0, usersAnkyUri: "", imageUrl: "" };
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
