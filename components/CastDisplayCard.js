import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import { getOneWriting } from "../lib/irys";
import Link from "next/link";
import { FaRegCommentAlt, FaRegHeart, FaPencilAlt } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import Image from "next/image";
import Head from "next/head";
import OgDisplay from "./OgDisplay";
import { useUser } from "../context/UserContext";

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

const CastDisplayCard = ({ thisCast }) => {
  const router = useRouter();
  const { farcasterUser } = useUser();
  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  const [cast, setCast] = useState(thisCast);
  const [castInfo, setCastInfo] = useState({});
  const [castReplies, setCastReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [hasUserRecasted, setHasUserRecasted] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [displayComments, setDisplayComments] = useState(false);
  const [writing, setWriting] = useState("");

  useEffect(() => {
    async function formatThisCast() {
      try {
        const hasUserLikedBool = cast.reactions.likes.filter(
          (x) => x.fid == farcasterUser.fid
        );
        const hasUserRecastedBool = cast.reactions.recasts.filter(
          (x) => x.fid == farcasterUser.fid
        );
        setHasUserLiked(hasUserLikedBool);
        setHasUserRecasted(hasUserRecastedBool);
        const encodedCid = cast.text.split("\n")[0];
        const decodedCid = decodeFromAnkyverseLanguage(encodedCid);
        const writingText = await getOneWriting(decodedCid);
        setWriting(writingText.text);

        if (cast.replies.count > 0) {
          console.log("calling for the felies");
          const repliesResponse = await axios.post(
            `${apiRoute}/farcaster/api/cast/replies/${cast.hash}`,
            {
              viewerFid: farcasterUser.fid,
              threadHash: cast.hash,
            }
          );
          setCastReplies(repliesResponse.data.casts);
        }

        setLoading(false);
      } catch (error) {
        console.log("there was an error retrieving the cast", error);
      }
    }
    formatThisCast(cast);
  }, [cast]);
  async function handleDisplayComments() {
    setDisplayComments((x) => !x);
  }
  async function handleRecast(e) {
    try {
      e.currentTarget.blur();
      const prev = hasUserRecasted;
      setHasUserRecasted(!prev);
      const response = await axios.post(`${apiRoute}/farcaster/api/reaction`, {
        reactionType: "recast",
        hash: cast.hash,
        signer_uuid: farcasterUser.signer_uuid,
      });
      if (response.status !== 200) {
        alert("there was an error recasting");
        setHasUserRecasted(!prev);
      }
    } catch (error) {
      console.log("there was an error recasting");
    }
  }
  async function handleLike(e) {
    try {
      console.log("THE EEEEE IS: ", e);
      e.currentTarget.blur();
      const prev = hasUserLiked;
      setHasUserLiked(!prev);
      const response = await axios.post(`${apiRoute}/farcaster/api/reaction`, {
        reactionType: "like",
        hash: cast.hash,
        signer_uuid: farcasterUser.signer_uuid,
      });
      if (response.status !== 200) {
        alert("there was an error recasting");
        setHasUserLiked(!prev);
      }
    } catch (error) {
      console.log("there was an error liking the cast");
    }
  }
  if (loading)
    return (
      <div className="text-white">
        <p>the cast is being translated...</p>
      </div>
    );
  if (!cast)
    return (
      <div className="text-white pt-4">
        <p>this is an invalid link</p>
        <p>but since you are here... you can always write a new piece!</p>
        <Link href="/farcaster">write</Link>
      </div>
    );
  console.log("the cast replioes are :", castReplies);

  return (
    <div className="h-3/5 w-full my-4">
      <div className="active:none w-full h-full md:max-w-2xl md:mx-auto flex flex-col relative">
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
    </div>
  );
};

export default CastDisplayCard;

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
