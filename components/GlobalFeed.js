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
  const [activeFeed, setActiveFeed] = useState("votables");
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [translatingCasts, setTranslatingCasts] = useState(false);
  const { globalFeed, refreshFeed } = useFarcaster();

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
  console.log("in here, the global feed is: ", globalFeed);
  return (
    <div className="text-white w-full grow ">
      <div className="w-full  flex flex-col justify-around flex-wrap md:w-96  mx-auto">
        <div>
          <Button
            buttonAction={swapFeed}
            buttonText={
              activeFeed == "votables"
                ? "display mintables"
                : "display votables"
            }
            buttonColor="bg-green-600 w-48 mt-2 mb-4"
          />
        </div>
        {activeFeed == "votables" && (
          <div>
            {globalFeed.votableAnkys.map((x, i) => {
              return (
                <div>
                  <div className="flex flex-wrap w-96 h-96 mb-8">
                    <div className="w-48 h-48 relative">
                      <Image src={x.imageOneUrl} fill />
                    </div>
                    <div className="w-48 h-48 relative">
                      <Image src={x.imageTwoUrl} fill />
                    </div>
                    <div className="w-48 h-48 relative">
                      <Image src={x.imageThreeUrl} fill />
                    </div>
                    <div className="w-48 h-48 relative">
                      <Image src={x.imageFourUrl} fill />
                    </div>
                  </div>
                  <Link href={`/mint-an-anky/${x.cid}`} passHref>
                    <div className="w-full flex justify-between">
                      <div className="px-4 py-2 cursor-pointer rounded-lg bg-red-200 text-black">
                        1
                      </div>
                      <div className="px-4 py-2 cursor-pointer rounded-lg bg-red-200 text-black">
                        2
                      </div>{" "}
                      <div className="px-4 py-2 cursor-pointer rounded-lg bg-red-200 text-black">
                        3
                      </div>{" "}
                      <div className="px-4 py-2 cursor-pointer rounded-lg bg-red-200 text-black">
                        4
                      </div>{" "}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        {activeFeed == "mintables" && (
          <div>
            {globalFeed.mintableAnkys.map((x, i) => {
              return (
                <div>
                  <div className="w-96 h-96 relative mb-4">
                    <Image src={x.winningImageUrl} fill />
                  </div>
                  <Link
                    href={`/mint-an-anky/${x.cid}`}
                    className="px-8 py-2 bg-red-200 text-black rounded-xl text-2x"
                  >
                    mint
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        {/* {globalFeed.map((x, i) => {
          const UserPfP = () => {
            return <Image src={x.author?.pfp_url || ""} fill />;
          };
          return <SimpleCast key={i} cast={x} pfp={UserPfP} />;
        })} */}
      </div>
    </div>
  );
};

export default GlobalFeed;
