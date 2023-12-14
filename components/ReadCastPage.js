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
  const { id } = router.query;
  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  const [cast, setCast] = useState();
  const [castInfo, setCastInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [displayComments, setDisplayComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [writing, setWriting] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchCastByHash(id) {
      try {
        console.log("fetching the cast");
        const response = await axios.get(
          `${apiRoute}/farcaster/api/cast/${id}`
        );
        console.log("the response is: ", response.data);
        if (response.data.cast) {
          setCast(response.data.cast);
          console.log("the cast is: ", response.data.cast);
          const lastChars = response.data.cast.text.slice(-4);
          if (true || lastChars == "anky") {
            console.log("the last chars are: ", lastChars);
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
    alert("recast!");
  }
  async function handleAddLike() {
    alert("like!");
  }
  if (loading) return <p>loading...</p>;
  if (!cast)
    return (
      <div className="text-white pt-4">
        <p>this is an invalid link</p>
        <p>but since you are here... you can always write a new piece!</p>
        <Link href="/farcaster">write</Link>
      </div>
    );

  return (
    <div className="h-full pb-8 h-full w-full">
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
      <div className="w-full h-5/6 bg-red-200 flex flex-col relative">
        <div className="w-full md:w-6/12 mx-auto standalone:pt-12 h-full flex flex-col pt-2 flex-grow bg-purple-500 text-black px-2 ">
          <p className="text-xs italic flex-none h-4 flex items-center">
            {new Date(cast.timestamp).toLocaleDateString("en-US", options)} - @
            {cast.author.username}
          </p>
          <div className="border-black flex-grow border-2 rounded px-2 py-1 overflow-y-scroll  bg-purple-300 my-2">
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
            <div className="border-black grow h-2/5 border-2 rounded px-2 py-1 overflow-y-scroll  bg-purple-300 my-2">
              {comments && <div>comments</div>}
            </div>
          )}

          {/* {cast.embeds &&
            cast.embeds.length > 0 &&
            cast.embeds.map((x, i) => {
              return (
                <div key={i}>
                  <OgDisplay url={x.url} />
                </div>
              );
            })} */}

          <div className="ml-2 flex h-22 space-x-4 relative">
            <div
              onClick={handleDisplayComments}
              className="flex space-x-1 items-center hover:text-gray-500 cursor-pointer"
            >
              <FaRegCommentAlt />
              <span>{cast.replies.count}</span>
            </div>
            <div
              onClick={handleRecast}
              className="flex space-x-1 items-center hover:text-green-700 cursor-pointer"
            >
              <BsArrowRepeat size={19} />
              <span>{cast.reactions.recasts.length}</span>
            </div>
            <div
              onClick={handleAddLike}
              className="flex space-x-1 items-center hover:text-red-600 cursor-pointer"
            >
              <FaRegHeart />
              <span>{cast.reactions.likes.length}</span>
            </div>
            <a
              target="_blank"
              href="https://warpcast.com/jpfraneto/0x14619bb5"
              className="absolute right-2 bottom-1 hover:text-red-200"
            >
              open in warpcast
            </a>
          </div>
        </div>
      </div>
      <div className="w-full my-4 h-5/6 bg-red-200 flex flex-col relative">
        <div className="w-full md:w-6/12 mx-auto standalone:pt-12 h-full flex flex-col pt-2 flex-grow bg-purple-500 text-black px-2 ">
          <p className="text-xs italic flex-none h-4 flex items-center">
            {new Date(cast.timestamp).toLocaleDateString("en-US", options)} - @
            {cast.author.username}
          </p>
          <div className="border-black flex-grow border-2 rounded px-2 py-1 overflow-y-scroll  bg-purple-300 my-2">
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
            <div className="border-black grow h-full border-2 rounded px-2 py-1 overflow-y-scroll  bg-purple-300 my-2">
              {comments && <div>comments</div>}
            </div>
          )}

          {/* {cast.embeds &&
            cast.embeds.length > 0 &&
            cast.embeds.map((x, i) => {
              return (
                <div key={i}>
                  <OgDisplay url={x.url} />
                </div>
              );
            })} */}

          <div className="ml-2 flex h-22 space-x-4">
            <div
              onClick={handleDisplayComments}
              className="flex space-x-1 items-center hover:text-gray-500 cursor-pointer"
            >
              <FaRegCommentAlt />
              <span>{cast.replies.count}</span>
            </div>
            <div
              onClick={handleRecast}
              className="flex space-x-1 items-center hover:text-green-700 cursor-pointer"
            >
              <BsArrowRepeat size={19} />
              <span>{cast.reactions.recasts.length}</span>
            </div>
            <div
              onClick={handleAddLike}
              className="flex space-x-1 items-center hover:text-red-600 cursor-pointer"
            >
              <FaRegHeart />
              <span>{cast.reactions.likes.length}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full my-4 h-5/6 bg-red-200 flex flex-col relative">
        <div className="w-full md:w-6/12 mx-auto standalone:pt-12 h-full flex flex-col pt-2 flex-grow bg-purple-500 text-black px-2 ">
          <p className="text-xs italic flex-none h-4 flex items-center">
            {new Date(cast.timestamp).toLocaleDateString("en-US", options)} - @
            {cast.author.username}
          </p>
          <div className="border-black flex-grow border-2 rounded px-2 py-1 overflow-y-scroll  bg-purple-300 my-2">
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
            <div className="border-black grow h-full border-2 rounded px-2 py-1 overflow-y-scroll  bg-purple-300 my-2">
              {comments && <div>comments</div>}
            </div>
          )}

          {/* {cast.embeds &&
            cast.embeds.length > 0 &&
            cast.embeds.map((x, i) => {
              return (
                <div key={i}>
                  <OgDisplay url={x.url} />
                </div>
              );
            })} */}

          <div className="ml-2 flex h-22 space-x-4">
            <div
              onClick={handleDisplayComments}
              className="flex space-x-1 items-center hover:text-gray-500 cursor-pointer"
            >
              <FaRegCommentAlt />
              <span>{cast.replies.count}</span>
            </div>
            <div
              onClick={handleRecast}
              className="flex space-x-1 items-center hover:text-green-700 cursor-pointer"
            >
              <BsArrowRepeat size={19} />
              <span>{cast.reactions.recasts.length}</span>
            </div>
            <div
              onClick={handleAddLike}
              className="flex space-x-1 items-center hover:text-red-600 cursor-pointer"
            >
              <FaRegHeart />
              <span>{cast.reactions.likes.length}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full my-4 h-5/6 bg-red-200 flex flex-col relative">
        <div className="w-full md:w-6/12 mx-auto standalone:pt-12 h-full flex flex-col pt-2 flex-grow bg-purple-500 text-black px-2 ">
          <p className="text-xs italic flex-none h-4 flex items-center">
            {new Date(cast.timestamp).toLocaleDateString("en-US", options)} - @
            {cast.author.username}
          </p>
          <div className="border-black flex-grow border-2 rounded px-2 py-1 overflow-y-scroll  bg-purple-300 my-2">
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
            <div className="border-black grow h-full border-2 rounded px-2 py-1 overflow-y-scroll  bg-purple-300 my-2">
              {comments && <div>comments</div>}
            </div>
          )}

          {/* {cast.embeds &&
            cast.embeds.length > 0 &&
            cast.embeds.map((x, i) => {
              return (
                <div key={i}>
                  <OgDisplay url={x.url} />
                </div>
              );
            })} */}

          <div className="ml-2 flex h-22 space-x-4">
            <div
              onClick={handleDisplayComments}
              className="flex space-x-1 items-center hover:text-gray-500 cursor-pointer"
            >
              <FaRegCommentAlt />
              <span>{cast.replies.count}</span>
            </div>
            <div
              onClick={handleRecast}
              className="flex space-x-1 items-center hover:text-green-700 cursor-pointer"
            >
              <BsArrowRepeat size={19} />
              <span>{cast.reactions.recasts.length}</span>
            </div>
            <div
              onClick={handleAddLike}
              className="flex space-x-1 items-center hover:text-red-600 cursor-pointer"
            >
              <FaRegHeart />
              <span>{cast.reactions.likes.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadCastPage;
