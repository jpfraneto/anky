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
      console.log("HERE THE ANKY CHANNEL FEED IS: ,", ankyChannelFeed);

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

  // useEffect(() => {
  //   const fetchUserWritings = async () => {
  //     if (!thisWallet) return;
  //     const allUserWritings = await getAllUsersWritings(thisWallet.address);
  //     setUserWritings(allUserWritings);
  //     setLoadingFeed(false);
  //   };
  //   fetchUserWritings();
  // }, [thisWallet]);
  // if (!thisWallet)
  // return (
  //   <div>
  //     <p className="text-white mt-2">
  //       please{" "}
  //       <span className="hover:text-yellow-300 cursor-pointer" onClick={login}>
  //         login
  //       </span>{" "}
  //       first
  //     </p>
  //   </div>
  // );

  if (loadingFeed) {
    return (
      <div className="mt-12">
        <p className="text-white">loading...</p>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full px-4 flex justify-around flex-wrap md:w-2/3 mx-auto">
        {globalFeed.map((x, i) => {
          return (
            <IndividualDecodedCastCard
              cast={x}
              key={i}
              farcasterUser={farcasterUser}
            />
          );
          //   <div
          //     onClick={() => {
          //       window.scroll({
          //         top: 0,
          //         left: 0,
          //         behavior: "smooth",
          //       });
          //     }}
          //     className="flex m-1 relative w-16 h-16 "
          //   >
          //     <div className="border border-white w-16 h-16 rounded-full overflow-hidden relative hover:border hover:border-white cursor-pointer">
          //       <Image fill src={x.author.pfp_url || ""} />
          //     </div>
          //     <div className="absolute bg-red-600 hover:bg-red-400 px-3 border border-white rounded-full w-1 flex items-center justify-center text-white font-2xl -top-2 -right-0">
          //       2
          //     </div>
          //   </div>
          // );
        })}
      </div>
    </div>
  );
};

const UserWriting = ({ writing, clickable = true }) => {
  function getColor(containerType) {
    switch (containerType) {
      case "journal":
        return `bg-green-400 ${clickable && "hover:bg-green-500"}`;
      case "dementor":
        return `bg-red-400 ${clickable && "hover:bg-red-500"} `;
      case "eulogia":
        return `bg-orange-400 ${clickable && "hover:bg-orange-500"}`;
      case "notebook":
        return `bg-blue-400 ${clickable && "hover:bg-blue-500"} `;
      default:
        return "bg-black";
    }
  }

  function getContainerLink(writing) {
    switch (writing.writingContainerType) {
      case "journal":
        return `/journal/${writing.containerId}`;
      case "dementor":
        return `/dementor/${writing.containerId}`;
      case "eulogia":
        return `/eulogia/${writing.containerId}`;
      case "notebook":
        return `/notebook/${writing.containerId}`;
      default:
        return "/community-notebook";
    }
  }
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
