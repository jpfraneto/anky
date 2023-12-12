import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import { getOneWriting } from "../lib/irys";
import Link from "next/link";
import { FaRegCommentAlt, FaRegHeart } from "react-icons/fa";
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
  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    if (!id) return;
    async function fetchCastByHash(id) {
      try {
        const response = await axios.get(
          `${apiRoute}/farcaster/api/cast/${id}`
        );
        setCast(response.data.cast);
        console.log("the cast is: ", response.data.cast);
        const encodedCid = response.data.cast.text.split("\n")[0];
        const decodedCid = decodeFromAnkyverseLanguage(encodedCid);
        const writingText = await getOneWriting(decodedCid);
        setWriting(writingText.text);
        setLoading(false);
      } catch (error) {
        console.log("there was an error retrieving the cast", error);
      }
    }
    fetchCastByHash(id);
  }, [id]);
  async function handleDisplayComments() {
    setDisplayComments(!displayComments);
  }
  async function handleRecast() {
    alert("recast!");
  }
  async function handleAddLike() {
    alert("like!");
  }
  if (!cast)
    return (
      <div className="text-white pt-4">
        <p>this is an invalid link</p>
        <p>but since you are here... you can always write a new piece!</p>
        <Link href="/farcaster">write</Link>
      </div>
    );
  return (
    <div className="h-full w-full">
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
      <div className="w-full h-full flex flex-col pt-4">
        <div className="w-6/12 mx-auto rounded-xl pt-2 pb-16 h-96 bg-purple-200 text-black p-2 ">
          <p className="text-sm italic">
            {new Date(cast.timestamp).toLocaleDateString("en-US", options)} - @
            {cast.author.username}
          </p>
          <div className="border-black border h-full px-2 py-1 overflow-y-scroll rounded-xl bg-purple-300  my-2">
            {writing ? (
              writing.includes("\n") ? (
                writing.split("\n").map((x, i) => (
                  <p className="my-2" key={i}>
                    {x}
                  </p>
                ))
              ) : (
                <p className="my-2">{writing}</p>
              )
            ) : null}
          </div>
          {cast.embeds &&
            cast.embeds.length > 0 &&
            cast.embeds.map((x, i) => {
              return (
                <div>
                  <OgDisplay url={x.url} />
                </div>
              );
            })}

          <div className="ml-2 flex space-x-4">
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
        {displayComments && (
          <div className="w-6/12 mx-auto rounded-xl mt-2 bg-purple-200 text-black p-2">
            comments
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadCastPage;
