import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import { getOneWriting } from "../lib/irys";
import { GiRollingEnergy } from "react-icons/gi";
import Link from "next/link";
import { FaRegCommentAlt, FaRegHeart, FaPencilAlt } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import Image from "next/image";
import Head from "next/head";
import OgDisplay from "./OgDisplay";
import { useUser } from "../context/UserContext";
import { usePrivy } from "@privy-io/react-auth";

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
  const { farcasterUser, userDatabaseInformation } = useUser();
  const { id } = router.query;
  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  const [cast, setCast] = useState();
  const { authenticated } = usePrivy();
  const [castInfo, setCastInfo] = useState({});
  const [castReplies, setCastReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [manaForCongratulation, setManaForCongratulation] = useState(100);
  const [totalNewenEarned, setTotalNewenEarned] = useState(200);
  const [hasUserRecasted, setHasUserRecasted] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [displaySendNewen, setDisplaySendNewen] = useState(false);
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
  async function sendManaToCastCreator() {
    try {
      if (manaForCongratulation > userDatabaseInformation.manaBalance)
        return alert("You dont have enough $NEWEN balance for that.");
      alert(`this will send ${manaForCongratulation} to the user`);
      console.log("the total", totalNewenEarned, manaForCongratulation);
      setTotalNewenEarned(totalNewenEarned + manaForCongratulation);
      setDisplaySendNewen(false);
    } catch (error) {
      console.log("there was an error sending the mana to the user", error);
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
      <div className="active:none w-full h-screen md:max-w-2xl md:mx-auto flex flex-col relative">
        <div className="w-full md:w-6/12 mx-auto h-full flex flex-col overflow-y-scroll  flex-grow bg-gray-300 text-gray-700 ">
          <div className="text-xs italic py-3 flex-none h-fit flex  items-center  justify-center ">
            <Link href={`/u/${cast.author.fid}`} passHref>
              <div className="w-48 h-48 active:translate-x-2 rounded-full overflow-hidden relative shadow-2xl">
                <Image src={cast.author.pfp_url} fill />
              </div>
            </Link>
          </div>
          <div className="flex h-6 py-4 bg-black text-white w-full left-0 px-2  relative justify-between items-center">
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
              <div
                onClick={() => setDisplaySendNewen(!displaySendNewen)}
                className={`flex space-x-1 items-center ${
                  hasUserLiked && "text-purple-300"
                } hover:text-purple-500 cursor-pointer`}
              >
                <GiRollingEnergy />
                <span>{totalNewenEarned}</span>
              </div>
            </div>

            <a
              target="_blank"
              href={`https://warpcast.com/${
                cast.author.username
              }/${cast.hash.substring(0, 10)}`}
              className="ml-auto hover:text-red-200 text-white"
            >
              Warpcast
            </a>
          </div>
          {displaySendNewen && (
            <div className="flex h-fit py-1 bg-gray-800 text-white w-full left-0 px-4  relative justify-between items-center">
              <p>$NEWEN{!authenticated && "*"}</p>
              <input
                className="rounded-xl mx-1 w-1/3 text-black  px-4"
                type="number"
                disabled={!authenticated}
                min={0}
                onChange={(e) => setManaForCongratulation(e.target.value)}
                max={userDatabaseInformation.manaBalance}
                value={manaForCongratulation}
              />
              <button
                onClick={sendManaToCastCreator}
                className="bg-black border border-white px-2 py-1 rounded-xl hover:text-green-500 active:text-yellow-500"
              >
                send to user
              </button>
            </div>
          )}

          {!authenticated && (
            <small className="text-red-800">
              *login to send $NEWEN to the creator of this cast
            </small>
          )}

          <div className="h-96 grow rounded px-2 py-2 text-2xl text-left pl-8  ">
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
