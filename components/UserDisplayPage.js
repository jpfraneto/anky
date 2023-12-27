import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

const UserDisplayPage = ({ thisUserInfo }) => {
  const [usersAnkyFeed, setUsersAnkyFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAnkyFeed = async () => {
      if (!thisUserInfo) return;
      console.log("fetching the users anky feed", thisUserInfo);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/u/${thisUserInfo}/feed`
      );
      console.log("THE RESPONSE HERE IS: ", response.data);
      setUsersAnkyFeed(response.data.feed);
      setLoading(false);
    };
    // fetchUserInformationOnFarcaster();
    fetchUsersAnkyFeed();
  }, []);
  return (
    <div className="w-full px-4 h-full">
      <div className="md:w-5/6 mt-12 h-48  rounded-xl bg-black border-2 border-white relative mx-auto">
        <div className="absolute bottom left-1/2 -bottom-1/3 -translate-y-2/5 rounded-xl overflow-hidden border-2 border-white -translate-x-1/2">
          <div className="w-36 h-36 z-5 relative">
            <Image
              src={
                "https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/https%3A%2F%2Fi.imgur.com%2FBZ8CGCy.jpg" ||
                "/ankys/anky.png"
              }
              fill
            />
          </div>
        </div>
      </div>
      <div className="md:w-full px-4 flex justify-between h-24 z-1 rounded-xl bg-blue-200  mx-auto">
        <div className="w-1/3 flex ">
          <div className="flex w-1/2 h-full items-center justify-center flex-col">
            <p className="text-md">daily streak</p>
            <p className="text-2xl">21</p>
          </div>
          <div className="flex w-1/2 h-full items-center justify-center flex-col">
            <p className="text-md">balance $NEWEN</p>
            <p className="text-2xl">2372</p>
          </div>
        </div>
        <div className="text-black flex items-end pb-2">
          <p>@jpfraneto</p>
        </div>
        <div className="w-1/3 flex ">
          <div className="flex w-1/2 h-full items-center justify-center flex-col">
            <p className="text-md">rank</p>
            <p className="text-2xl">amateur</p>
          </div>
          <div className="flex w-1/2 h-full items-center justify-center flex-col">
            <p className="text-md">level</p>
            <p className="text-2xl">8</p>
          </div>
        </div>
      </div>
      <div className="md:w-1/3 flex justify-between h-4 mt-4 z-1 rounded-lg bg-white  mx-auto">
        <div className="h-full w-full">
          <div
            className="h-full opacity-50"
            style={{
              width: `${20}%`,
              backgroundColor: 50 > 30 ? "green" : "red",
            }}
          ></div>
        </div>
      </div>
      <p className="text-white">2000 $NEWEN to level 9</p>
      <div className="w-full mt-2 flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 grow-0 h-fit bg-black text-white flex flex-col p-2 justify-start items-start">
          <p className="text-xl ">Stats</p>
          <hr className="text-white h-2" />
          <div className="flex justify-between px-2 w-full">
            <p>total $MANA earned: </p>
            <p>482.842</p>
          </div>
          <div className="flex justify-between px-2 w-full">
            <p>longest streak: </p>
            <p>88</p>
          </div>
          <div className="flex justify-between px-2 w-full">
            <p>longest writing session: </p>
            <p>2839 s</p>
          </div>
          <div className="flex justify-between px-2 w-full">
            <p>open source contributions: </p>
            <p>0</p>
          </div>
          <div className="flex justify-between px-2 w-full">
            <p>badges: </p>
            <p>3</p>
          </div>
        </div>
        <div className="w-full md:w-2/3 mt-2 md:mt-0  mx-2 h-fit bg-black text-white flex flex-col p-2 justify-start items-start">
          <p className="text-xl ">Writing Feed</p>
          <hr className="text-white h-2" />
          {usersAnkyFeed.map((cast, i) => {
            console.log("the cast is: ", cast);
            return (
              <div
                key={i}
                className="p-2 border border-red-300 my-2 bg-purple-400 rounded-xl"
              >
                <div className="text-xs text-left">{cast.text}</div>
                <div className="mt-2 w-full flex justify-between items-start">
                  <div className="flex">
                    <div className="mx-2">
                      likes: {cast.reactions.likes.length}
                    </div>
                    <div className="mx-2">
                      recasts: {cast.reactions.recasts.length}
                    </div>
                    <div className="mx-2">comments: {cast.replies.count}</div>
                  </div>
                  <div>
                    <a
                      target="_blank"
                      href={`https://warpcast.com/${
                        cast.author.username
                      }/${cast.hash.substring(0, 10)}`}
                      className="ml-auto hover:text-purple-200"
                    >
                      open in warpcast
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserDisplayPage;
