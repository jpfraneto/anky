import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../Button";
import Image from "next/image";
import Link from "next/link";
import IndividualCastCard from "./IndividualCastCard";
import { useUser } from "../../context/UserContext";
import Spinner from "../Spinner";

const UserByFidComponent = ({
  chosenUserToDisplay,
  setChosenUserToDisplay,
  fid,
}) => {
  const { farcasterUser } = useUser();
  const [user, setUser] = useState(chosenUserToDisplay || fid);
  const [loading, setLoading] = useState(true);
  const [chosenCast, setChosenCast] = useState(null);
  const [following, setFollowing] = useState(false);
  const [usersAnkyFeed, setUsersAnkyFeed] = useState([]);

  useEffect(() => {
    const fetchUsersAnkyFeed = async () => {
      if (!chosenUserToDisplay.fid || !chosenUserToDisplay.fid > 0) return;
      console.log("fetching the users anky feed", chosenUserToDisplay.fid);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/u/${chosenUserToDisplay.fid}/feed`
      );
      console.log("THE RESPONSE HERE IS: ", response.data);
      setUsersAnkyFeed(response.data.feed);
      setLoading(false);
    };
    // fetchUserInformationOnFarcaster();
    fetchUsersAnkyFeed();
  }, []);

  const followUnfollowUser = async () => {
    try {
      let response;
      let action;
      if (following) {
        action = "unfollow";
      } else {
        action = "follow";
      }
      response = await axios.post("/follow-unfollow-user", {
        viewerFid: farcasterUser?.fid,
        action: action,
      });
    } catch (error) {
      console.log("there was an error here");
    }
  };

  return (
    <div className="w-screen h-screen overflow-y-scroll mx-auto px-2 py-4 text-white">
      <section>
        <div className="flex w-full h-48 items-center">
          <div className="h-36 w-36 rounded-full relative border border-white mx-auto overflow-hidden">
            <Image fill src={user.pfp.url || null} alt="user image" />
          </div>
        </div>
        <p>
          {user.displayName} - @{user.username}
        </p>
        <p>
          Following: {user.followingCount} | Followers: {user.followerCount}
        </p>
        <div className="flex justify-center items-center my-2 w-64 mx-auto">
          <div className="w-fit mx-2">
            <a
              className={`bg-purple-600 px-4 py-2 mx-auto hover:opacity-70 shadow shadow-slate-500 cursor-pointer rounded-xl border border-black`}
              target="_blank"
              href={`https://warpcast.com/${user.username}`}
            >
              warpcast
            </a>
          </div>

          <div className="w-fit mx-2">
            <Button
              buttonAction={() => setChosenUserToDisplay(null)}
              buttonText="go back"
              buttonColor=" bg-green-600"
            />
          </div>
        </div>
      </section>
      <hr className="my-3 " />
      <div className="flex flex-col md:flex-row">
        <section className="md:w-96 mx-auto">
          {loading ? (
            <div className="flex flex-col items-center text-white">
              <Spinner />
              <p>loading user casts...</p>
            </div>
          ) : (
            <>
              <p>these are this user&apos;s casts:</p>
              <div className="w-full mt-4 flex flex-wrap justify-center">
                {usersAnkyFeed.map((thisCast, i) => {
                  return (
                    <div
                      key={i}
                      onClick={() => setChosenCast(thisCast)}
                      className={`${
                        chosenCast == thisCast
                          ? "bg-purple-600"
                          : "bg-purple-200"
                      } hover:cursor-pointer hover:bg-purple-500 m-1 h-12 w-12  rounded-full border border-white`}
                    ></div>
                  );
                })}
              </div>
            </>
          )}
        </section>
        {chosenCast && (
          <div className="md:w-96 mx-auto flex flex-col">
            <div
              onClick={() => console.log(chosenCast)}
              className="text-ellipsis overflow-x-hidden p-2 rounded-xl bg-purple-200 text-black w-full mx-auto mt-4"
            >
              {chosenCast.text}
            </div>
            <a
              className="p-2 mt-2 w-48 mx-auto rounded-xl bg-purple-600 border border-black"
              target="_blank"
              href={`https://warpcast.com/${
                chosenCast.author.username
              }/${chosenCast.hash.substring(0, 10)}`}
            >
              open in warpcast
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserByFidComponent;
