import { usePrivy } from "@privy-io/react-auth";
import React, { useEffect } from "react";

const ankyContractAddresses = [
  {
    name: "Anky Genesis",
    chain: "mainnet",
    abi: "",
    address: "0x5806485215C8542C448EcF707aB6321b948cAb90",
  },
  {
    name: "Anky Airdrop",
    chain: "base",
    abi: "ankyAirdropAbi",
    address: "0x8458100dA465fC3fEC17EF903839a80C87E328f3",
  },
  {
    name: "Anky On A Frame",
    chain: "base",
    abi: "ankyOnAFrameABI",
    address: "0x5Fd77ab7Fd080E3E6CcBC8fE7D33D8AbD2FE65a5",
  },
  {
    name: "Anky One",
    chain: "base",
    abi: "ankyOneABI",
    address: "0x87586325d3Fb4bd4F2dc712728Da84277051C641",
  },
];

const MyGalleryPage = () => {
  const { user, authenticated } = usePrivy();
  const userAddress = user.wallet.address;
  useEffect(() => {
    async function fetchUserAnkys() {
      try {
        if (!authenticated) return;
        // here there needs to be a function that fetches all of the user ankys for each one of these smart contracts.
      } catch (error) {
        console.log("there was an error fetching the users ankys");
      }
    }
    fetchUserAnkys();
  }, []);
  return (
    <div className="text-white">
      {ankyContractAddresses.map((collection, index) => {
        return (
          <div>
            <h1>{collection.name}</h1>
            {/* here we need to render the nfts that the user owns of that specific collection */}
          </div>
        );
      })}
    </div>
  );
};

export default MyGalleryPage;
