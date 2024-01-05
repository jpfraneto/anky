import React, { useEffect, useState } from "react";
import { getOneWriting } from "../lib/irys";
import { usePrivy } from "@privy-io/react-auth";
import Button from "./Button";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import IndividualDecodedCastCard from "./farcaster/IndividualDecodedCastCard";
import Spinner from "./Spinner";
import { useUser } from "../context/UserContext";
import NormalCastCard from "./farcaster/NormalCastCard";

var options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
};

const GlobalFeed = ({ thisWallet }) => {
  const { login } = usePrivy();
  const { farcasterUser } = useUser();
  const [userWritings, setUserWritings] = useState([]);
  const [globalFeed, setGlobalFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [translatingCasts, setTranslatingCasts] = useState(false);
  useEffect(() => {
    const getGlobalFeed = async () => {
      console.log("the farcaster user is: ", farcasterUser);
      if (!farcasterUser && !farcasterUser.fid) return;
      console.log("fetching the feed for this user");
      let response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/anky-channel-feed`
      );
      let ankyChannelFeed = response.data.feed.casts;
      setTranslatingCasts(true);

      const encodedCids = ankyChannelFeed.map(
        (cast) => cast.text.split("\n")[0]
      );

      // Decode cids and fetch their content
      const fetchPromises = encodedCids.map(async (encodedCid) => {
        const decodedCid = decodeFromAnkyverseLanguage(encodedCid);
        const writing = await getOneWriting(decodedCid);
        return writing.text;
      });
      const writings = await Promise.all(fetchPromises);

      const decodedFeed = ankyChannelFeed.map((cast, index) => {
        return { ...cast, text: writings[index] };
      });
      console.log("the decoded feed is: ", decodedFeed);
      setTranslatingCasts(false);
      setGlobalFeed(decodedFeed);

      setLoadingFeed(false);
    };
    getGlobalFeed();
  }, []);

  if (loadingFeed) {
    return (
      <div className="w-full h-screen pb-16 pt-12">
        <div className="w-full flex flex-col items-center justify-around flex-wrap  mx-auto">
          <p className="text-white">loading the feed...</p>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen pb-16 overflow-y-scroll">
      <div className="w-full flex justify-around flex-wrap md:w-full  mx-auto">
        {globalFeed.map((x, i) => {
          return (
            <IndividualDecodedCastCard
              cast={x}
              key={i}
              farcasterUser={farcasterUser}
            />
          );
        })}
      </div>
    </div>
  );

  if (!clickable) {
    return (
      <div
        className={`p-2 m-2 rounded-xl border-white border-2  bg-purple-500 text-white`}
      >
        <p className="text-sm em">
          {new Date(writing.timestamp).toLocaleDateString("en-US", options)}
        </p>
        <hr className="w-9/11 mx-auto bg-black text-black my-2" />
        {writing.text && writing.text ? (
          writing.text.includes("\n") ? (
            writing.text.split("\n").map((x, i) => (
              <p className="my-2" key={i}>
                {x}
              </p>
            ))
          ) : (
            <p className="my-2">{writing.text}</p>
          )
        ) : null}
      </div>
    );
  }

  return (
    <Link href={`${getContainerLink(writing)}`} passHref>
      <div
        className={`p-2 m-2 rounded-xl border-white border-2 ${getColor(
          writing.writingContainerType
        )} text-white`}
      >
        <p className="text-sm em">
          {new Date(writing.timestamp).toLocaleDateString("en-US", options)}
        </p>
        <p>
          {writing.writingContainerType} - {writing.containerId}
        </p>
        <hr className="w-9/11 mx-auto bg-black text-black my-2" />
        {writing.text && writing.text ? (
          writing.text.includes("\n") ? (
            writing.text.split("\n").map((x, i) => (
              <p className="my-2" key={i}>
                {x}
              </p>
            ))
          ) : (
            <p className="my-2">{writing.text}</p>
          )
        ) : null}
      </div>
    </Link>
  );
};

export default GlobalFeed;
