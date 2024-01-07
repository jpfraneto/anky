import React, { useEffect, useState } from "react";
import { getOneWriting } from "../lib/irys";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
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
  const { globalFeed } = useFarcaster();

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
};

export default GlobalFeed;
