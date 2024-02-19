import React, { useEffect, useState } from "react";
import { getOneWriting } from "../lib/irys";
import Image from "next/image";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import Button from "./Button";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import IndividualDecodedCastCard from "./farcaster/IndividualDecodedCastCard";
import Spinner from "./Spinner";
import { useUser } from "../context/UserContext";
import { useFarcaster } from "../context/FarcasterContext";
import SimpleCast from "./SimpleCast";
import AnkyOnTheFeed from "./AnkyOnTheFeed";

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
  const { authenticated, login } = usePrivy();
  const { farcasterUser } = useUser();
  const [userWritings, setUserWritings] = useState([]);
  const [activeFeed, setActiveFeed] = useState("mintables");
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [translatingCasts, setTranslatingCasts] = useState(false);
  const { globalFeed, refreshFeed } = useFarcaster();
  console.log("the global feed is: ", globalFeed);

  if (!globalFeed)
    return (
      <div className="mt-4">
        <p>there was an error retrieving the feed</p>
        <div className="mx-auto w-32">
          <Button
            buttonAction={refreshFeed}
            buttonText="refresh feed"
            buttonColor="bg-green-600"
          />
        </div>
      </div>
    );
  const swapFeed = () => {
    if (activeFeed == "mintables") setActiveFeed("votables");
    if (activeFeed == "votables") setActiveFeed("mintables");
  };
  return (
    <div className="text-white w-full grow mb-16">
      <div className="w-full flex flex-col justify-around flex-wrap md:w-96 mt-3 mx-auto">
        <div>
          <Button
            buttonAction={swapFeed}
            buttonText={
              activeFeed == "votables"
                ? "display mintables"
                : "display votables"
            }
            buttonColor="bg-green-600 w-48"
          />
        </div>
        {activeFeed == "votables" && (
          <div>
            {globalFeed &&
              globalFeed.votableAnkys?.map((x, i) => {
                return (
                  <AnkyOnTheFeed
                    key={i}
                    anky={x}
                    votable={true}
                    mintable={false}
                  />
                );
              })}
          </div>
        )}
        {activeFeed == "mintables" && (
          <div>
            {globalFeed &&
              globalFeed.mintableAnkys?.map((x, i) => {
                return (
                  <AnkyOnTheFeed
                    key={i}
                    anky={x}
                    votable={false}
                    mintable={true}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalFeed;
