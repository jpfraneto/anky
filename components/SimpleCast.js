import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaRegCommentAlt, FaRegHeart, FaPencilAlt } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { getOneWriting } from "../lib/irys";
import { GiRollingEnergy } from "react-icons/gi";
import { useUser } from "../context/UserContext";

const SimpleCast = ({ cast, pfp, userInfo = null }) => {
  const { farcasterUser } = useUser();
  const [editedCast, setEditedCast] = useState(cast);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [hasUserRecasted, setHasUserRecasted] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [uniqueRecasts, setUniqueRecasts] = useState(0);
  const [uniqueLikes, setUniqueLikes] = useState(0);
  const [displaySendNewen, setDisplaySendNewen] = useState(false);
  const [totalNewenEarned, setTotalNewenEarned] = useState(222);

  useEffect(() => {
    const fetchThisCast = async () => {
      try {
        var parts = cast.embeds[0].url.split("/");
        var cid = parts.pop() || "";
        if (cid.length == 43) {
          console.log("IN HERE");
          const thisWriting = await getOneWriting(cid);
          setEditedCast((x) => {
            return { ...x, text: thisWriting.text };
          });
        }
      } catch (error) {
        console.log("the error is: ", error);
      }
    };
    if (cast && cast?.embeds[0]?.url?.includes("anky.lat")) {
      fetchThisCast();
    }
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

  async function copyTheText() {
    try {
      await navigator.clipboard.writeText(writing);
      setTextForCopy("copied");
      setTimeout(() => {
        setTextForCopy("copy");
      }, 1111);
    } catch (error) {}
  }

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
      console.log("the farcaster user is:", farcasterUser);
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
  if (!userInfo) return;
  return (
    <div className="w-full pl-4 flex border-bottom border-purple-200 mt-2 relative">
      <div className="w-16 h-16 pr-2 md:h-20 md:w-20 rounded-full overflow-hidden bg-black relative">
        {pfp()}
      </div>
      <div className="grow pb-4 flex flex-col items-start px-2">
        <p className="text-purple-200">
          <span className="text-white ">{userInfo.displayName}</span>{" "}
          <span>@{userInfo.username}</span>
        </p>
        <p className="text-purple-200 text-left break-words">
          {editedCast.text ? (
            editedCast.text.includes("\n") ? (
              editedCast.text.split("\n").map((x, i) => (
                <p className="mb-4" key={i}>
                  {x}
                </p>
              ))
            ) : (
              <p className="my-2">{editedCast.text}</p>
            )
          ) : null}
        </p>
        <div className="px-2 text-xl w-full h-8 flex justify-between text-purple-200 items-center">
          <div className="flex space-x-4 h-full">
            <div
              onClick={handleDisplayComments}
              className={`flex space-x-1 items-center ${
                hasUserCommented && "text-gray-500"
              } hover:text-gray-500 cursor-pointer`}
            >
              <FaRegCommentAlt size={18} />
              <span>{cast?.replies?.count || 0}</span>
            </div>
            <div
              onClick={handleRecast}
              className={`flex space-x-1 items-center ${
                hasUserRecasted ? "text-green-300" : ""
              } hover:text-green-500 cursor-pointer`}
            >
              <BsArrowRepeat size={19} />
              <span>{uniqueRecasts?.length || 0}</span>
            </div>
            <div
              onClick={handleLike}
              className={`flex space-x-1 items-center ${
                hasUserLiked ? "text-red-300" : ""
              } hover:text-red-500 cursor-pointer`}
            >
              <FaRegHeart />
              <span>{uniqueLikes?.length || 0}</span>
            </div>
            <div
              onClick={() => {
                alert(
                  "this button is for sending newen, the currency you earn by writing"
                );
              }}
              className={`flex space-x-1 items-center ${
                displaySendNewen ? "text-purple-300" : ""
              } hover:text-purple-500 cursor-pointer`}
            >
              <GiRollingEnergy />
              <span>{totalNewenEarned}</span>
            </div>
          </div>
        </div>
      </div>

      <span
        onClick={() => alert("open cast options")}
        className="absolute top-0 right-2 text-purple-200 "
      >
        · · ·
      </span>
    </div>
  );
};

export default SimpleCast;
