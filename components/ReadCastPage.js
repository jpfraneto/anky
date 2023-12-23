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

const ReadCastPage = () => {
  const router = useRouter();
  const { farcasterUser } = useUser();
  const { id } = router.query;
  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  const [cast, setCast] = useState();
  const [castInfo, setCastInfo] = useState({});
  const [castReplies, setCastReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [hasUserRecasted, setHasUserRecasted] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [displayComments, setDisplayComments] = useState(false);
  const [writing, setWriting] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchCastByHash(id) {
      try {
        const response = await axios.get(
          `${apiRoute}/farcaster/api/cast/${id}`
        );
        console.log("the respooonse is: ", response);
        if (response.status == 200 && response.data.cast) {
          console.log("IN HERE", response.data);
          let thisCast = response.data.cast;

          setCast(thisCast);
          console.log("the cast is:", thisCast);
          const hasUserLikedBool = thisCast.reactions.likes.filter(
            (x) => x.fid == farcasterUser.fid
          );
          const hasUserRecastedBool = thisCast.reactions.recasts.filter(
            (x) => x.fid == farcasterUser.fid
          );
          setHasUserLiked(hasUserLikedBool);
          setHasUserRecasted(hasUserRecastedBool);
          const lastChars = thisCast.text.slice(-4);
          if (true || lastChars == "anky") {
            const encodedCid = thisCast.text.split("\n")[0];
            const decodedCid = decodeFromAnkyverseLanguage(encodedCid);
            const writingText = await getOneWriting(decodedCid);
            setWriting(writingText.text);
          } else {
            setWriting(thisCast.text);
          }

          if (response.status == 200 && thisCast.replies.count > 0) {
            console.log("calling for the felies");
            const repliesResponse = await axios.post(
              `${apiRoute}/farcaster/api/cast/replies/${id}`,
              {
                viewerFid: farcasterUser.fid,
                threadHash: thisCast.hash,
              }
            );
            setCastReplies(repliesResponse.data.casts);
          }

          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log("there was an error retrieving the cast", error);
      }
    }
    fetchCastByHash(id);
  }, [id]);
  async function handleDisplayComments() {
    setDisplayComments((x) => !x);
  }
  async function handleRecast(e) {
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
  }
  async function handleLike(e) {
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
  }
  console.log("the cast is: ", cast);
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
    <div className="h-full h-full w-full ">
      <Head>
        <title>Ankycaster</title>
        <meta property="og:title" content="Tell us who you are" />
        <meta
          property="og:description"
          content="Read and explore what is in here"
        />
        <meta property="og:image" content="" />
        <meta property="og:url" content={`https://www.anky.lat/r/${id}`} />
        <meta property="og:type" content="website" />
      </Head>
      <div className="active:none w-full h-full md:max-w-2xl md:mx-auto flex flex-col relative">
        <div className="w-full md:w-6/12 mx-auto  h-full flex flex-col pt-2 flex-grow bg-purple-500 text-black px-2 ">
          <div className="text-xs italic py-8 flex-none h-fit flex items-center shadow-[0_35px_10px_10px_rgba(0,0,0,0.3)] justify-center my-2">
            <Link href={`/u/${cast.author.fid}`} passHref>
              <div className="w-48 h-48 active:translate-x-2 rounded-full overflow-hidden relative shadow-2xl">
                <Image src={cast.author.pfp_url} fill />
              </div>
            </Link>
          </div>
          <div className="h-96 grow rounded px-2 py-4 text-2xl text-left pl-8 overflow-y-scroll my-2">
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
          {displayComments && (
            <div
              className={`${
                displayComments &&
                "border-black border-2 absolute top-0 left-0 w-full bg-purple-300 rounded px-2 py-1 my-2"
              } overflow-hidden`}
            >
              {castReplies &&
                castReplies.length > 0 &&
                castReplies.map((reply, i) => (
                  <>
                    <ReplyComponent key={i} cast={reply} />
                  </>
                ))}
            </div>
          )}

          <div className="flex h-6 py-4 bg-black text-white w-screen left-0  px-2 -translate-x-2 relative justify-between items-center">
            <div className="pl-4 flex space-x-4 h-full">
              <div
                onClick={handleDisplayComments}
                className={`flex space-x-1 items-center ${
                  hasUserCommented && "text-gray-500"
                } hover:text-gray-500 cursor-pointer`}
              >
                <FaRegCommentAlt size={14} />
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

const ReplyComponent = ({ cast }) => {
  console.log("the cast is: ", cast);
  return (
    <div className="px-2 relative w-full text-center w-full justify-center items-center flex flex-col rounded-xl my-4">
      <div className=" rounded-full border-white overflow-hidden border-2 relative w-36 h-36">
        <Image src={cast.author.pfp.url} fill />
      </div>
      <div className="pl-8">{cast.text}</div>
      <p className="text-xs italic flex-none flex items-center">
        {new Date(cast.timestamp).toLocaleDateString("en-US", options)} - @
        {cast.author.username}
      </p>
    </div>
  );
};

export default ReadCastPage;
