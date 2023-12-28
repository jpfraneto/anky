import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
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

const NormalCastCard = ({ cast }) => {
  const [castReplies, setCastReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [hasUserRecasted, setHasUserRecasted] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [displayComments, setDisplayComments] = useState(false);
  const [writing, setWriting] = useState(cast.text);

  async function handleDisplayComments() {
    setDisplayComments((x) => !x);
  }

  async function handleRecast(e) {
    e.currentTarget.blur();
    const prev = hasUserRecasted;
    setHasUserRecasted(!prev);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/reaction`,
      {
        reactionType: "recast",
        hash: cast.hash,
        signer_uuid: farcasterUser.signer_uuid,
      }
    );
    if (response.status !== 200) {
      alert("there was an error recasting");
      setHasUserRecasted(!prev);
    }
  }

  async function handleLike(e) {
    console.log("THE EEEEE IS: ", e);
    e.currentTarget.blur();
    const prev = hasUserLiked;
    setHasUserLiked(!prev);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/reaction`,
      {
        reactionType: "like",
        hash: cast.hash,
        signer_uuid: farcasterUser.signer_uuid,
      }
    );
    if (response.status !== 200) {
      alert("there was an error recasting");
      setHasUserLiked(!prev);
    }
  }

  return (
    <div className="active:none w-full my-2 h-full md:max-w-2xl md:mx-auto flex flex-col relative">
      <div className="w-full md:w-6/12 mx-auto  h-full flex flex-col pt-2 flex-grow bg-purple-500 text-black px-2 ">
        <p className="text-xs italic flex-none h-4 flex items-center">
          {new Date(cast.timestamp).toLocaleDateString("en-US", options)} - @
          {cast.author.username}
        </p>
        <div className="border-black h-96 grow border-2 rounded px-2 py-1 overflow-y-scroll bg-purple-300 my-2">
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
              onClick={handleDisplayComments}
              className={`flex space-x-1 items-center ${
                hasUserCommented && "text-gray-500"
              } hover:text-gray-500 cursor-pointer`}
            >
              <FaRegCommentAlt />
              <span>{cast.replies.count}</span>
            </div>
            <div
              onClick={handleRecast}
              className={`flex space-x-1 items-center ${
                hasUserRecasted && "text-green-300"
              } hover:text-green-300 cursor-pointer`}
            >
              <BsArrowRepeat size={19} />
              <span>{cast.reactions.recasts.length}</span>
            </div>
            <div
              onClick={handleLike}
              className={`flex space-x-1 items-center ${
                hasUserLiked && "text-red-300"
              } hover:text-red-500 cursor-pointer`}
            >
              <FaRegHeart />
              <span>{cast.reactions.likes.length}</span>
            </div>
          </div>

          <a
            target="_blank"
            href={`https://warpcast.com/${
              cast.author.username
            }/${cast.hash.substring(0, 10)}`}
            className="ml-auto hover:text-red-200"
          >
            open in warpcast
          </a>
        </div>
      </div>
    </div>
  );
};

export default NormalCastCard;

const ReplyComponent = ({ cast }) => {
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
