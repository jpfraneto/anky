import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import { getOneWriting } from "../lib/irys";
import Link from "next/link";
import Button from "./Button";
import IndividualDecodedCastCard from "./farcaster/IndividualDecodedCastCard";
import Image from "next/image";
import { useUser } from "../context/UserContext";
import { usePrivy } from "@privy-io/react-auth";
import Spinner from "./Spinner";

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
  const { authenticated, login } = usePrivy();
  const [castInfo, setCastInfo] = useState({});
  const [decodedCast, setDecodedCast] = useState(null);
  const [castReplies, setCastReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [manaForCongratulation, setManaForCongratulation] = useState(
    Math.min(userDatabaseInformation.manaBalance, 100)
  );
  const [totalNewenEarned, setTotalNewenEarned] = useState(200);
  const [hasUserRecasted, setHasUserRecasted] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [displaySendNewen, setDisplaySendNewen] = useState(false);
  const [displayComments, setDisplayComments] = useState(false);
  const [writing, setWriting] = useState("");

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape" && displayComments) {
        setDisplayComments(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [displayComments]);

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
          const hasUserLikedBool = thisCast.reactions.likes.filter(
            (x) => x.fid == farcasterUser.fid
          );
          const hasUserRecastedBool = thisCast.reactions.recasts.filter(
            (x) => x.fid == farcasterUser.fid
          );
          setHasUserLiked(hasUserLikedBool);
          setHasUserRecasted(hasUserRecastedBool);

          const encodedCid = thisCast.text.split("\n")[0];
          const decodedCid = decodeFromAnkyverseLanguage(encodedCid);
          const writingText = await getOneWriting(decodedCid);
          thisCast.text = writingText.text;
          setDecodedCast(thisCast);

          if (response.status == 200 && thisCast.replies.count > 0) {
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
      setTotalNewenEarned(
        Number(totalNewenEarned) + Number(manaForCongratulation)
      );
      setDisplaySendNewen(false);
    } catch (error) {
      console.log("there was an error sending the mana to the user", error);
    }
  }
  if (loading)
    return (
      <div className="text-white">
        <p>the cast is being translated...</p>
        <Spinner />
      </div>
    );
  if (!decodedCast)
    return (
      <div className="text-white pt-4">
        <p>this is an invalid link</p>
        <p>but since you are here... you can always write a new piece!</p>
        <Link href="/farcaster">write</Link>
      </div>
    );

  return (
    <div className="h-full flex flex-col pt-8">
      <IndividualDecodedCastCard
        cast={decodedCast}
        key={null}
        farcasterUser={farcasterUser}
        fullscreenMode={true}
      />
      <div className="w-48 mx-auto mt-4">
        <Link href="/feed" passHref>
          <Button buttonText="feed" buttonColor="bg-purple-600 text-white" />
        </Link>
      </div>
    </div>
  );
};

const ReplyComponent = ({ cast }) => {
  return (
    <div className="px-2  py-2 border border-black relative w-full text-center w-full justify-center items-center flex flex-col rounded-xl my-4">
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
