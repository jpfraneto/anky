import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import { getOneWriting } from "../lib/irys";
import Link from "next/link";
import { FaRegCommentAlt, FaRegHeart, FaPencilAlt } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
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
  const [loading, setLoading] = useState(true);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [hasUserRecasted, setHasUserRecasted] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [displayComments, setDisplayComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [writing, setWriting] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchCastByHash(id) {
      try {
        const response = await axios.get(
          `${apiRoute}/farcaster/api/cast/${id}`
        );
        if (response.data.cast) {
          setCast(response.data.cast);
          const lastChars = response.data.cast.text.slice(-4);
          if (true || lastChars == "anky") {
            const encodedCid = response.data.cast.text.split("\n")[0];
            const decodedCid = decodeFromAnkyverseLanguage(encodedCid);
            const writingText = await getOneWriting(decodedCid);
            setWriting(writingText.text);
          } else {
            setWriting(response.data.cast.text);
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
  async function handleRecast() {
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
  async function handleLike() {
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
          {displayComments && (
            <div
              className={`border-black border-2 rounded px-2 py-1 overflow-y-scroll h-2/5 bg-purple-300 my-2`}
            >
              {comments && (
                <div>
                  display the comments in a cool and smooth way (they are the
                  same comments that you will see on farcaster)
                </div>
              )}
            </div>
          )}

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

export default ReadCastPage;
