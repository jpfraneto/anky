import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Righteous, Dancing_Script } from "next/font/google";
import { FaRegCommentAlt, FaRegHeart } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { GiRollingEnergy } from "react-icons/gi";
import Link from "next/link";
import { getOneWriting } from "../lib/irys";

import { useUser } from "../context/UserContext";

const righteous = Righteous({ weight: "400", subsets: ["latin"] });

const SimpleCast = ({ cast, pfp, userInfo = null }) => {
  const { farcasterUser } = useUser();
  const [editedCast, setEditedCast] = useState(cast);
  const [hasUserCommented, setHasUserCommented] = useState(false);
  const [hasUserRecasted, setHasUserRecasted] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [uniqueRecasts, setUniqueRecasts] = useState(0);
  const [uniqueLikes, setUniqueLikes] = useState(0);
  const [displaySendNewen, setDisplaySendNewen] = useState(false);
  const [totalNewenEarned, setTotalNewenEarned] = useState(0);

  useEffect(() => {
    const fetchThisCast = async () => {
      try {
        if (!cast) return;
        var parts = cast.embeds[0].url.split("/");
        var cid = parts.pop() || "";
        if (cid.length == 43) {
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
  }, [cast]);

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

      setTotalNewenEarned(
        Number(totalNewenEarned) + Number(manaForCongratulation)
      );

      setDisplaySendNewen(false);
    } catch (error) {
      console.log("there was an error sending the mana to the user", error);
    }
  }

  if (!editedCast) return;
  return (
    <div className="w-full pl-2 h-fit flex border-bottom border-purple-200 mt-2 relative">
      <Link href={`/u/${editedCast?.author?.fid || 13850}`} passHref>
        <div className="w-16 h-16 pr-2 md:h-20 md:w-20 rounded-full overflow-hidden bg-black relative">
          {pfp()}
        </div>
      </Link>

      <div className="w-full pb-4 flex flex-col items-start px-2">
        <p className="text-purple-200 text-left">
          <span className="text-white mr-2 ">
            {userInfo?.displayName || editedCast?.author?.display_name}
          </span>
          <span>@{userInfo?.username || editedCast?.author?.username}</span>
        </p>
        <div className="text-purple-200 text-left break-words">
          {editedCast?.text ? (
            editedCast?.text?.includes("\n") ? (
              editedCast?.text?.split("\n").map((x, i) => (
                <p className="mb-4" key={i}>
                  {x}
                </p>
              ))
            ) : (
              <p className="my-2">{editedCast.text || ""}</p>
            )
          ) : null}
        </div>
        <a
          target="_blank"
          href={`https://warpcast.com/${
            cast.author.username
          }/${cast.hash.substring(0, 10)}`}
          className={`${righteous.className} text-purple-200 text-xl hover:text-purple-600`}
        >
          open in warpcast
        </a>
      </div>
    </div>
  );
};

export default SimpleCast;
