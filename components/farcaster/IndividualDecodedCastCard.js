import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { decodeFromAnkyverseLanguage } from "../../lib/ankyverse";
import { getOneWriting } from "../../lib/irys";
import Link from "next/link";
import { FaRegCommentAlt, FaRegHeart, FaPencilAlt } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import Image from "next/image";
import Head from "next/head";
import OgDisplay from "../OgDisplay";
import { useUser } from "../../context/UserContext";

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

const IndividualDecodedCastCard = ({ cast, farcasterUser }) => {
  const [castReplies, setCastReplies] = useState([]);
  const [thisCast, setThisCast] = useState(cast);
  const [loading, setLoading] = useState(true);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const hasUserRecastedThis = cast.reactions.recasts.some(
    (recast) => recast.fid === farcasterUser.fid
  );
  const [hasUserRecasted, setHasUserRecasted] = useState(hasUserRecastedThis);
  const hasUserLikedThis = cast.reactions.likes.some(
    (like) => like.fid === farcasterUser.fid
  );

  const filterUniqueReactions = (reactions) => {
    const uniqueFids = new Set();
    return reactions.filter((reaction) => {
      const isDuplicate = uniqueFids.has(reaction.fid);
      uniqueFids.add(reaction.fid);
      return !isDuplicate;
    });
  };

  const [uniqueLikes, setUniqueLikes] = useState(
    filterUniqueReactions(cast.reactions.likes)
  );
  const [uniqueRecasts, setUniqueRecasts] = useState(
    filterUniqueReactions(cast.reactions.recasts)
  );

  const [hasUserLiked, setHasUserLiked] = useState(hasUserLikedThis);
  const [displayComments, setDisplayComments] = useState(false);
  const [writing, setWriting] = useState(cast.text);

  async function handleDisplayComments() {
    setDisplayComments((x) => !x);
  }

  // Function to handle recast toggle
  const handleRecast = async (e) => {
    e.preventDefault();
    if (farcasterUser.status === "approved") {
      const isRecasted = hasUserRecasted; // store the initial state
      const newRecast = {
        fid: farcasterUser.fid,
        fname: farcasterUser.username,
      }; // Replace "YourUsername" with the actual username

      // Optimistically update UI
      setHasUserRecasted(!isRecasted);
      setUniqueRecasts(
        isRecasted
          ? uniqueRecasts.filter((recast) => recast.fid !== farcasterUser.fid)
          : [...uniqueRecasts, newRecast]
      );

      // Make API call
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/reaction`,
          {
            reactionType: "recast", // This should match your API's expected parameters
            hash: thisCast.hash,
            signer_uuid: farcasterUser.signer_uuid, // Replace with actual identifier if needed
          }
        );

        if (response.status !== 200) {
          throw new Error("API call failed");
        }
        // Handle successful response if necessary
      } catch (error) {
        // Revert optimistic updates if the API call fails
        setHasUserRecasted(isRecasted);
        setUniqueRecasts(
          isRecasted
            ? [...uniqueRecasts, newRecast]
            : uniqueRecasts.filter((recast) => recast.fid !== farcasterUser.fid)
        );
        alert("There was an error processing your recast.");
      }
    }
  };

  async function handleLike(e) {
    try {
      if (farcasterUser.status === "approved") {
        const isLiked = hasUserLiked;
        const newLike = {
          fid: farcasterUser.fid,
          fname: farcasterUser.username,
        }; // Replace "YourUsername" with the actual username
        setHasUserLiked(!isLiked);
        setUniqueLikes(
          isLiked
            ? uniqueLikes.filter((like) => like.fid !== farcasterUser.fid)
            : [...uniqueLikes, newLike]
        );

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/reaction`,
            {
              reactionType: "like", // This should match your API's expected parameters
              hash: thisCast.hash,
              signer_uuid: farcasterUser.signer_uuid, // Replace with actual identifier if needed
            }
          );

          if (response.status !== 200) {
            throw new Error("API call failed");
          }
          // Handle successful response if necessary
        } catch (error) {
          // Revert optimistic updates if the API call fails
          setHasUserLiked(isLiked);
          setUniqueLikes(
            isLiked
              ? [...uniqueLikes, newLike]
              : uniqueLikes.filter((like) => like.fid !== farcasterUser.fid)
          );
          alert("There was an error processing your like.");
        }
      }
    } catch (error) {
      console.log("the error is: ", error);
      console.log("there was an error handling the like");
    }
  }

  if (cast.text == "Not Found") return;

  return (
    <div className="active:none w-full my-2 h-full md:mx-auto flex flex-col relative">
      <div className="w-full md:w-96 mx-auto  h-full flex flex-col pt-2 flex-grow bg-purple-500 text-black px-2 ">
        <Link
          passHref
          href={`/u/${thisCast.author.fid}`}
          className="text-xs italic flex-none h-4 flex items-center"
        >
          {new Date(thisCast.timestamp).toLocaleDateString("en-US", options)}
          <span className="ml-auto hover:text-green-200">
            @{thisCast.author.username}
          </span>
        </Link>
        <div
          onClick={() => console.log(thisCast)}
          className="border-black h-96 grow border-2 rounded px-2 py-1 overflow-y-scroll bg-purple-300 my-2"
        >
          {writing ? (
            writing.includes("\n") ? (
              writing.split("\n").map((x, i) => (
                <p className="mb-4" key={i}>
                  {x}
                </p>
              ))
            ) : (
              <p className="my-2">{writing}</p>
            )
          ) : null}
        </div>
        <div
          className={`${
            displayComments &&
            "border-black border-2 bg-purple-300 rounded px-2 py-1 my-2"
          } overflow-hidden ${displayComments ? "animate-growHeight" : ""}`}
        >
          {displayComments &&
            castReplies &&
            castReplies.length > 0 &&
            castReplies.map((reply, i) => (
              <>
                <ReplyComponent key={i} cast={reply} />
              </>
            ))}
        </div>

        <div className="ml-2 flex h-6 pb-2 space-x-4 relative justify-between items-center">
          <div className="flex space-x-4 h-full">
            <div
              // onClick={handleDisplayComments}
              onClick={() => alert("enable the comments feature")}
              className={`flex space-x-1 items-center ${
                hasUserCommented && "text-gray-500"
              } hover:text-gray-500 cursor-pointer`}
            >
              <FaRegCommentAlt />
              <span>{thisCast.replies.count}</span>
            </div>
            <div
              onClick={handleRecast}
              className={`flex space-x-1 items-center ${
                hasUserRecasted && "text-green-300"
              } hover:text-green-300 cursor-pointer`}
            >
              <BsArrowRepeat size={19} />
              <span>{uniqueRecasts.length}</span>
            </div>
            <div
              onClick={handleLike}
              className={`flex space-x-1 items-center ${
                hasUserLiked && "text-red-300"
              } hover:text-red-500 cursor-pointer`}
            >
              <FaRegHeart />
              <span>{uniqueLikes.length}</span>
            </div>
          </div>

          <a
            target="_blank"
            href={`https://warpcast.com/${
              thisCast.author.username
            }/${thisCast.hash.substring(0, 10)}`}
            className="ml-auto hover:text-red-200"
          >
            open in warpcast
          </a>
        </div>
      </div>
    </div>
  );
};

export default IndividualDecodedCastCard;

const ReplyComponent = ({ cast }) => {
  console.log("the cast is: ", cast);
  return (
    <div className="px-2 relative w-full text-center w-fit justify-center items-center flex flex-col rounded-xl bg-purple-400 my-4">
      <div className="w-fit h-fit rounded-full border-white overflow-hidden border-2 absolute w-12 h-12 -top-4 -left-4">
        <Image src={cast.author.pfp.url} fill />
      </div>
      <div className="pl-8">{cast.text}</div>
      <p className="text-xs italic flex-none h-4 flex items-center">
        {new Date(cast.timestamp).toLocaleDateString("en-US", options)} - @
        {cast.author.username}
      </p>
    </div>
  );
};
