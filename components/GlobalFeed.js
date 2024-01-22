import React, { useEffect, useState } from "react";
import { getOneWriting } from "../lib/irys";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import Button from "./Button";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import IndividualDecodedCastCard from "./farcaster/IndividualDecodedCastCard";
import Spinner from "./Spinner";
import { useUser } from "../context/UserContext";
import { useFarcaster } from "../context/FarcasterContext";

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
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [translatingCasts, setTranslatingCasts] = useState(false);
  const { globalFeed, refreshFeed } = useFarcaster();

  if (globalFeed.length == 0)
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

  return (
    <div className="w-full grow ">
      <div className="w-full  flex justify-around flex-wrap md:w-96  mx-auto">
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
};

export default GlobalFeed;
