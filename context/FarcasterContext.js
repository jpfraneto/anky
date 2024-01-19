import React, { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useUser } from "./UserContext";
import { setUserData, getUserData } from "../lib/idbHelper";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import { getOneWriting } from "../lib/irys";
import axios from "axios";

const FarcasterContext = createContext();

export const FarcasterProvider = ({ children }) => {
  const { authenticated, loading, getAccessToken, ready, user } = usePrivy();
  const { farcasterUser } = useUser();
  const [globalFeed, setGlobalFeed] = useState([]);
  const [translatingCasts, setTranslatingCasts] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);

  useEffect(() => {
    async function loadTheUpdatedGlobalFeed() {
      try {
        console.log("the farcaster user is: ", farcasterUser);
        console.log("fetching the feed for this user");
        let response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/feed`
        );
        setGlobalFeed(response.data.feed);
        // let response = await axios.get(
        //   `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/anky-channel-feed`
        // );

        // let ankyChannelFeed = response.data.feed.casts;
        // setTranslatingCasts(true);

        // const encodedCids = ankyChannelFeed.map(
        //   (cast) => cast.text.split("\n")[0]
        // );

        // // Decode cids and fetch their content
        // const fetchPromises = encodedCids.map(async (encodedCid) => {
        //   const decodedCid = decodeFromAnkyverseLanguage(encodedCid);
        //   const writing = await getOneWriting(decodedCid);
        //   return writing.text;
        // });
        // const writings = await Promise.all(fetchPromises);

        // const decodedFeed = ankyChannelFeed.map((cast, index) => {
        //   return { ...cast, text: writings[index] };
        // });
        // console.log(
        //   "the decoded fHEEEERE IN THE FARCASTER CONTEXT eed is: ",
        //   decodedFeed
        // );
        // setTranslatingCasts(false);
        // setGlobalFeed(decodedFeed);

        setLoadingFeed(false);
      } catch (error) {
        console.log(
          "there was an error loading the global feed on the farcaster user context"
        );
      }
    }
    loadTheUpdatedGlobalFeed();
  }, []);

  useEffect(() => {
    if (globalFeed) {
      setUserData("globalFeed", globalFeed);
    }
  }, [globalFeed]);

  return (
    <FarcasterContext.Provider
      value={{
        globalFeed,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
};

export const useFarcaster = () => {
  const context = useContext(FarcasterContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a FarcasterContextc");
  }
  return context;
};
