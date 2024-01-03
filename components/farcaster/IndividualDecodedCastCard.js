import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { GiRollingEnergy } from "react-icons/gi";
import { decodeFromAnkyverseLanguage } from "../../lib/ankyverse";
import { getOneWriting } from "../../lib/irys";
import Link from "next/link";
import { FaRegCommentAlt, FaRegHeart, FaPencilAlt } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import Image from "next/image";
import Head from "next/head";
import OgDisplay from "../OgDisplay";
import { useUser } from "../../context/UserContext";
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

const IndividualDecodedCastCard = ({ cast, farcasterUser }) => {
  const { authenticated, login, getAccessToken, user } = usePrivy();
  const { userDatabaseInformation, setUserDatabaseInformation } = useUser();
  const [castReplies, setCastReplies] = useState([]);
  const [userPrivyId, setUserPrivyId] = useState("");
  const [totalNewenEarned, setTotalNewenEarned] = useState(222);
  const [manaForCongratulation, setManaForCongratulation] = useState(
    Math.min(userDatabaseInformation?.manaBalance, 100)
  );
  const [thisCast, setThisCast] = useState(cast);
  const [displaySendNewen, setDisplaySendNewen] = useState(false);
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

  useEffect(() => {
    const fetchThisUserByFid = async () => {
      console.log("farcasterUser", cast, farcasterUser);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/user/fid/${cast.author.fid}`
        );
        const data = response.data;
        setUserPrivyId("clmgol0to069tms0f3urwkiis");
        console.log("the data in here is: ", data);
      } catch (error) {
        console.log("the error is: ", error);
      }
    };
    fetchThisUserByFid();
  }, []);

  async function handleDisplayComments() {
    return alert("work on the comments functionality");
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
    } else {
      return alert("You need to connect your farcaster account to do that");
    }
  };

  async function sendManaToCastCreator() {
    try {
      if (manaForCongratulation > userDatabaseInformation.manaBalance)
        return alert("You dont have enough $NEWEN balance for that.");
      alert(`WIP: this will send ${manaForCongratulation} to the user`);
      if (!farcasterUser && !farcasterUser.fid && authenticated) {
        return alert("You need to log in with farcaster to do that");
      }
      // const authToken = await getAccessToken();
      // console.log("posting a mana transaction");
      // const response = await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_ROUTE}/mana/mana-transaction`,
      //   {
      //     senderPrivyId: user.id.replace("did:privy:", ""),
      //     sender: farcasterUser.fid,
      //     receiver: cast.author.fid,
      //     manaSent: manaForCongratulation,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${authToken}`,
      //     },
      //   }
      // );
      // console.log("the response from the server is: ", response);
      setTotalNewenEarned(
        Number(totalNewenEarned) + Number(manaForCongratulation)
      );
      // setUserDatabaseInformation((x) => {
      //   console.log(
      //     "updating the userdatabaseinformation substracting the spent mana.",
      //     x.manaBalance,
      //     frontendWrittenTime
      //   );
      //   return {
      //     ...x,
      //     manaBalance: response.data.data.manaBalance - manaForCongratulation,
      //   };
      // });
      setDisplaySendNewen(false);
    } catch (error) {
      console.log("there was an error sending the mana to the user", error);
    }
  }

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
      } else {
        return alert("You need to connect your farcaster account to do that");
      }
    } catch (error) {
      console.log("the error is: ", error);
      console.log("there was an error handling the like");
    }
  }

  if (cast.text == "Not Found") return;

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
        <meta
          property="og:url"
          content={`https://www.anky.lat/r/${cast.hash}`}
        />
        <meta property="og:type" content="website" />
      </Head>
      <div className="active:none w-96 mx-auto relative h-96  md:mx-auto flex flex-col my-2 rounded-xl overflow-y-scroll">
        <div className="w-full md:w-96 mx-auto  bg-gray-300 text-gray-700 ">
          <div className="h-10/12 overflow-y-scroll flex flex-col">
            <div className="text-xs italic py-3 flex-none h-32 flex items-center justify-center ">
              <Link
                href={`/u/${
                  cast.author.fid == 18350
                    ? "clmgp49nc026wmf0fl8ulevqp"
                    : userPrivyId
                }`}
                passHref
              >
                <div className="w-24 h-24 active:translate-x-2 rounded-full overflow-hidden relative shadow-2xl">
                  <Image src={cast.author.pfp_url} fill />
                </div>
              </Link>
            </div>
            <div className="w-96 h-2/12">
              <div className="flex flex-col h-full py-1 bg-black text-white w-full left-0  relative">
                <div className="px-2 w-full h-8 flex justify-between items-center">
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
                        hasUserRecasted ? "text-green-300" : "text-green-200"
                      } hover:text-green-300 cursor-pointer`}
                    >
                      <BsArrowRepeat size={19} />
                      <span>{cast.reactions.recasts.length}</span>
                    </div>
                    <div
                      onClick={handleLike}
                      className={`flex space-x-1 items-center ${
                        hasUserLiked ? "text-red-300" : "text-red-200"
                      } hover:text-red-500 cursor-pointer`}
                    >
                      <FaRegHeart />
                      <span>{cast.reactions.likes.length}</span>
                    </div>
                    <div
                      onClick={() => {
                        setDisplaySendNewen(!displaySendNewen);
                      }}
                      className={`flex space-x-1 items-center ${
                        displaySendNewen ? "text-purple-300" : "text-purple-200"
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
                    className="bg-purple-600 px-2 py-1 rounded-xl border border-white ml-auto hover:text-red-200 text-white"
                  >
                    Warpcast
                  </a>
                </div>
                <>
                  {authenticated && displaySendNewen && (
                    <div className="flex h-14 mt-1 bg-purple-600 relative text-white w-full px-4 relative justify-between items-center">
                      {userDatabaseInformation.manaBalance ? (
                        <>
                          <div className="flex flex-row w-full items-center">
                            <div className="flex flex-col items-start justify-start">
                              <p>$NEWEN{!authenticated && "*"}</p>

                              <small className=" text-purple-200 bottom-0">
                                your balance is{" "}
                                {userDatabaseInformation.manaBalance}
                              </small>
                            </div>
                            <input
                              className="rounded-xl mx-auto w-24 h-fit text-black  px-4"
                              type="number"
                              disabled={!authenticated}
                              min={0}
                              onChange={(e) =>
                                setManaForCongratulation(e.target.value)
                              }
                              max={userDatabaseInformation?.manaBalance || 1000}
                              value={manaForCongratulation}
                            />
                          </div>

                          <button
                            onClick={sendManaToCastCreator}
                            className="bg-purple-800 border border-white w-48 px-2 py-1 rounded-xl hover:text-green-500 active:text-yellow-500"
                          >
                            send to user
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-left text-sm">
                            you need to write more than 30 seconds to earn your
                            first $NEWEN and send it to this user.
                          </p>
                        </>
                      )}{" "}
                    </div>
                  )}

                  {displaySendNewen && !authenticated && (
                    <small className="text-red-800">
                      *
                      <span
                        className="text-red-500 hover:text-red-700 cursor-pointer shadow-md shadow-yellow-600"
                        onClick={login}
                      >
                        login
                      </span>{" "}
                      to send $NEWEN to the creator of this cast
                    </small>
                  )}
                </>
              </div>
            </div>

            <div className="grow rounded px-2 py-2 text-2xl text-left pl-8">
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
          </div>

          {displayComments && (
            <div
              className={`${
                displayComments &&
                "border-black border-2 absolute top-0 left-0 w-full bg-purple-300 rounded px-2 py-1 my-2"
              } overflow-hidden`}
            >
              <div className="relative">
                <span
                  className="text-red-600 text-xl hover:text-red-800 -top-6 right-0 absolute cursor-pointer"
                  onClick={() => setDisplayComments(false)}
                >
                  X
                </span>
                {castReplies &&
                  castReplies.length > 0 &&
                  castReplies.map((reply, i) => (
                    <>
                      <ReplyComponent key={i} cast={reply} />
                    </>
                  ))}
              </div>
            </div>
          )}
          <div className="w-96 h-2/12">
            <div className="flex flex-col h-full py-1 bg-black text-white w-full left-0  relative">
              <div className="px-2 w-full h-8 flex justify-between items-center">
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
                      hasUserRecasted ? "text-green-300" : "text-green-200"
                    } hover:text-green-300 cursor-pointer`}
                  >
                    <BsArrowRepeat size={19} />
                    <span>{cast.reactions.recasts.length}</span>
                  </div>
                  <div
                    onClick={handleLike}
                    className={`flex space-x-1 items-center ${
                      hasUserLiked ? "text-red-300" : "text-red-200"
                    } hover:text-red-500 cursor-pointer`}
                  >
                    <FaRegHeart />
                    <span>{cast.reactions.likes.length}</span>
                  </div>
                  <div
                    onClick={() => {
                      setDisplaySendNewen(!displaySendNewen);
                    }}
                    className={`flex space-x-1 items-center ${
                      displaySendNewen ? "text-purple-300" : "text-purple-200"
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
                  className="bg-purple-600 px-2 py-1 rounded-xl border border-white ml-auto hover:text-red-200 text-white"
                >
                  Warpcast
                </a>
              </div>
              <>
                {authenticated && displaySendNewen && (
                  <div className="flex h-14 mt-1 bg-purple-600 relative text-white w-full px-4 relative justify-between items-center">
                    {userDatabaseInformation.manaBalance ? (
                      <>
                        <div className="flex flex-row w-full items-center">
                          <div className="flex flex-col items-start justify-start">
                            <p>$NEWEN{!authenticated && "*"}</p>

                            <small className=" text-purple-200 bottom-0">
                              your balance is{" "}
                              {userDatabaseInformation.manaBalance}
                            </small>
                          </div>
                          <input
                            className="rounded-xl mx-auto w-24 h-fit text-black  px-4"
                            type="number"
                            disabled={!authenticated}
                            min={0}
                            onChange={(e) =>
                              setManaForCongratulation(e.target.value)
                            }
                            max={userDatabaseInformation?.manaBalance || 1000}
                            value={manaForCongratulation}
                          />
                        </div>

                        <button
                          onClick={sendManaToCastCreator}
                          className="bg-purple-800 border border-white w-48 px-2 py-1 rounded-xl hover:text-green-500 active:text-yellow-500"
                        >
                          send to user
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-left text-sm">
                          you need to write more than 30 seconds to earn your
                          first $NEWEN and send it to this user.
                        </p>
                      </>
                    )}{" "}
                  </div>
                )}

                {displaySendNewen && !authenticated && (
                  <small className="text-red-800">
                    *
                    <span
                      className="text-red-500 hover:text-red-700 cursor-pointer shadow-md shadow-yellow-600"
                      onClick={login}
                    >
                      login
                    </span>{" "}
                    to send $NEWEN to the creator of this cast
                  </small>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualDecodedCastCard;

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
