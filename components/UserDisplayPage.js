import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { getThisUserWritings } from "../lib/irys";
import Spinner from "./Spinner";
import { Bar } from "react-chartjs-2";
import { GiRollingEnergy } from "react-icons/gi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";
import Button from "./Button";
import { useRouter } from "next/router";
import SimpleCast from "./SimpleCast";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserDisplayPage = ({ thisUserInfo }) => {
  const router = useRouter();
  const [usersAnkyFeed, setUsersAnkyFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [allUserWritings, setAllUserWritings] = useState([]);
  const [thisUserFeed, setThisUserFeed] = useState({});
  const [entryForDisplay, setEntryForDisplay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [longestRun, setLongestRun] = useState(null);
  const [thisUserFarcasterInfo, setThisUserFarcasterInfo] = useState({});
  const [writingsLoading, setWritingsLoading] = useState(true);
  const [thisFarcasterUser, setThisFarcasterUser] = useState({});
  const [userNotFound, setUserNotFound] = useState(false);
  const [thisAnkyUser, setThisAnkyUser] = useState({});
  const wallet = { address: "0x82C7C20B2368aE27727390753aC037f1d3265df7" };
  function sortWritings(a, b) {
    const timestampA = a.timestamp;
    const timestampB = b.timestamp;
    return timestampB - timestampA;
  }
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEntryForDisplay(null);
  }, []);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "newen earned",
        data: [],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  });

  useEffect(() => {
    const fetchUsersInformation = async () => {
      try {
        if (!thisUserInfo) return;
        console.log("the this user info is: ", thisUserInfo);
        if (router.query.fid) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_ROUTE}/user/farcaster-feed/${router.query.fid}`
          );
          console.log("the response is: ", response);
          setThisUserFarcasterInfo(response.data.user);
          setThisUserFeed(response.data.feed);
        }

        // const response = await axios.get(
        //   `${process.env.NEXT_PUBLIC_API_ROUTE}/user/farcaster/${thisUserInfo}`
        // );

        // const manaByDate = response.data.manaData;
        // const labels = Object.keys(manaByDate);
        // const data = Object.values(manaByDate);
        // const backgroundColors = data.map(
        //   (value) => `rgba(53, 162, ${value % 255}, 0.5)` // Dynamic color based on value
        // );
        // setChartData({
        //   labels,
        //   datasets: [
        //     {
        //       label: "newen earned",
        //       data,
        //       backgroundColor: backgroundColors,
        //     },
        //   ],
        // });
        // setThisAnkyUser(response.data.ankyUser);
        // setLongestRun(response.data.longestRun);
        setLoadingUser(false);
      } catch (error) {
        console.log("this user doesnt exist", error);
        setLoading(false);
        setUserNotFound(true);
      }
    };
    fetchUsersInformation();
  }, [router]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      setEntryForDisplay((prevPage) => prevPage - 1);
    } else if (event.key === "ArrowRight") {
      setEntryForDisplay((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isModalOpen, closeModal]);

  useEffect(() => {
    async function getAllUserWritings() {
      if (!wallet) return;
      // HERE I NEED TO FETCH ALL THE WRITINGS OF THIS USER INSIDE THE ANKY CHANNEL. THE CASTS.
      return;
      const writings = await getThisUserWritings(wallet.address);

      const sortedWritings = writings.sort(sortWritings);
      setAllUserWritings(sortedWritings);
      setWritingsLoading(false);
    }

    getAllUserWritings();
  }, []);

  function renderModal() {
    let content;
    if (!allUserWritings.length > 0) return;
    let thisEntry = allUserWritings[entryForDisplay];
    if (entryForDisplay > allUserWritings.length) {
      setEntryForDisplay(allUserWritings.length);
    }
    if (entryForDisplay < 0) {
      setEntryForDisplay(0);
    }
    if (!thisEntry) return;
    content = thisEntry.content || thisEntry.text;

    return (
      isModalOpen && (
        <div className="fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50">
          <div className="bg-purple-300 overflow-y-scroll text-black rounded relative p-6 w-11/12 h-3/4 md:w-2/3 md:h-2/3">
            <p className="absolute top-1 w-fit cursor-pointer left-2 text-gray-800">
              {entryForDisplay + 1}
            </p>
            <p
              onClick={closeModal}
              className="absolute w-fit top-1 cursor-pointer right-2 text-red-600"
            >
              close
            </p>
            <div className="overflow-y-scroll h-9/12">
              {content ? (
                content.includes("\n") ? (
                  content.split("\n").map((x, i) => (
                    <p className="my-2" key={i}>
                      {x}
                    </p>
                  ))
                ) : (
                  <p className="my-2">{content}</p>
                )
              ) : null}
            </div>
            <span className="text-sm absolute w-96 top-1 left-1/2 -translate-x-1/2">
              {new Date(thisEntry.timestamp).toLocaleDateString(
                "en-US",
                options
              )}
            </span>
            <div className="w-48 mx-auto mt-2">
              <Button
                buttonAction={() => setIsModalOpen(false)}
                buttonText="close"
                buttonColor="bg-red-600"
              />
            </div>
          </div>
        </div>
      )
    );
  }

  const UserPfP = () => {
    if (!thisUserFarcasterInfo || !thisUserFarcasterInfo.pfp) return;
    return <Image src={thisUserFarcasterInfo.pfp.url || ""} fill />;
  };

  if (userNotFound) {
    return (
      <div className="mt-4 text-white px-4">
        <p>This user doesn&apos;t exist in the db yet.</p>
        <p>
          I need to make the connection between the farcaster fid and the user
          inside the database.
        </p>
        <div className="w-48 mt-2 mx-auto">
          <Link href="/feed" passHref>
            <Button buttonColor="bg-purple-600" buttonText="back to feed" />
          </Link>
        </div>
      </div>
    );
  }
  if (loadingUser)
    return (
      <div>
        <Spinner />
        <p>loading</p>
      </div>
    );

  return (
    <div className="w-full h-full md:w-96 mx-auto overflow-y-scroll">
      <div className="flex w-full px-2 pt-3">
        <div className="rounded-full mx-1 mr-auto overflow-hidden border-2 border-white w-fit h-fit">
          <div className="w-16 h-16 md:h-48 md:w-48 z-5 bg-black relative">
            {UserPfP()}
          </div>
        </div>
        <div className="pl-2 w-4/5 text-purple-200 text-left">
          <p className="text-bold text-xl">
            {thisUserFarcasterInfo.displayName}
          </p>
          <div className="flex">
            <p className="">@{thisUserFarcasterInfo.username}</p>
            {thisUserFarcasterInfo.viewerContext.followedBy && (
              <span className="px-2 py-1 bg-purple-600 rounded-xl border border-white ml-4">
                Follows you
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-purple-200 px-2 mt-2">
        <p>{thisUserFarcasterInfo.profile.bio.text}</p>
        <div className="flex ml-2 mt-2">
          <span className="mr-2">
            {thisUserFarcasterInfo.followingCount} Followers
          </span>
          <span>{thisUserFarcasterInfo.followerCount} Following</span>
        </div>
      </div>
      <div className="text-purple-200 px-2 mt-2 flex">
        <div className="w-1/2 px-1">
          {thisUserFarcasterInfo.viewerContext.following ? (
            <Button
              buttonText="unfollow"
              buttonColor="bg-transparent-600 border-white border-2"
              buttonAction={() => alert("unfollow this user")}
            />
          ) : (
            <Button
              buttonText="follow"
              buttonColor="bg-purple-600 border-black border-2"
              buttonAction={() => alert("follow this user")}
            />
          )}
        </div>
        <div className="w-1/2 px-1">
          <Button
            buttonText={`gift newen`}
            buttonColor="bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black border-black border-2"
            buttonAction={() => alert("send x newen to user")}
          />
        </div>
      </div>
      <div className="w-full  mt-2">
        {thisUserFeed.map((cast, i) => {
          return (
            <SimpleCast
              cast={cast}
              key={i}
              pfp={UserPfP}
              userInfo={thisUserFarcasterInfo}
            />
          );
        })}
      </div>
      {/* {thisAnkyUser ? (
        <div>
          <div className="md:w-full px-4 mt-4 flex justify-between py-4 h-fit z-1 rounded-xl bg-blue-200  mx-auto">
            <div className="w-1/3 flex ">
              <div className="flex w-1/2 h-full  items-center justify-center flex-col">
                <p className="text-md">writing streak</p>
                <p className="text-2xl">
                  {Math.max(thisAnkyUser.longestStreak, thisAnkyUser.streak)}
                </p>
              </div>
              <div className="flex w-1/2 h-full items-center justify-center flex-col">
                <p className="text-md">newen balance</p>
                <p className="text-2xl">{thisAnkyUser.manaBalance}</p>
              </div>
            </div>
            <div className="text-black flex flex-col items-center justify-center ">
              <p>{thisAnkyUser?.farcasterAccount?.displayName}</p>
              <p>@{thisAnkyUser?.farcasterAccount?.username || "anon"}</p>
            </div>
            <div className="w-1/3 flex ">
              <div className="flex w-1/2 h-full items-center justify-center flex-col">
                <p className="text-md">rank</p>
                <p className="text-2xl">???</p>
              </div>
              <div className="flex w-1/2 h-full items-center justify-center flex-col">
                <p className="text-md">level</p>
                <p className="text-2xl">???</p>
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
          <p className="text-white">2000 newen to level 9</p>
          <div className="w-full mt-2 h-full flex flex-col md:flex-row">
            <div className="flex w-full md:w-1/2 flex-col">
              <div className="w-full grow-0 h-fit bg-black text-white flex flex-col p-2 justify-start items-start">
                <p className="text-xl ">Stats</p>
                <hr className="text-white h-2" />
                <div className="flex justify-between px-2 w-full">
                  <p>total newen earned: </p>
                  <p>{thisAnkyUser.totalManaEarned}</p>
                </div>
                <div className="flex justify-between px-2 w-full">
                  <p>longest streak: </p>
                  <p>
                    {Math.max(thisAnkyUser.longestStreak, thisAnkyUser.streak)}
                  </p>
                </div>
                <div className="flex justify-between px-2 w-full">
                  <p>longest writing session: </p>
                  <p>{longestRun?.amount || 0} s</p>
                </div>
              </div>
              <div className="w-full bg-purple-100 text-black">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Date",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "newen Earned",
                        },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            let label = context.dataset.label || "";
                            if (label) {
                              label += ": ";
                            }
                            if (context.parsed.y !== null) {
                              label += `${context.parsed.y} newen`;
                            }
                            return label;
                          },
                        },
                      },
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="w-full md:w-2/3 mt-2 md:mt-0 overflow-y-scroll  grow bg-black text-white flex flex-col p-2 justify-start items-start">
              <p className="text-xl ">Writing Feed</p>
              <hr className="text-white h-2" />
              <div className="w-full flex overflow-y-scroll justify-center flex-wrap  h-fit p-2 my-2">
                <p>
                  waiting for neynar&apos;s functionality to display the feed of
                  a user inside a specific channel (in this case, /anky on
                  farcaster).
                </p>
                {/* {writingsLoading ? (
                  <>
                    <Spinner />
                    <p>loading your writings</p>
                  </>
                ) : (
                  <>
                    {allUserWritings &&
                      allUserWritings.map((writing, i) => {
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              setEntryForDisplay(i);
                              setIsModalOpen(true);
                            }}
                            className="px-2 text-black border-black border py-1 m-1 w-10 h-10 flex justify-center items-center hover:shadow-xl hover:shadow-black hover:bg-blue-600 text-xl cursor-pointer bg-blue-400 rounded-xl"
                          >
                            {i + 1}
                          </div>
                        );
                      })}
                  </>
                )} 
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white mt-24">
          <p>
            @{thisFarcasterUser?.username || null} doesn&apos;t have an account
            on anky yet
          </p>
          <p>please extend a warm invitation to this person</p>
          <p>this community is built together</p>
          <a
            target="_blank"
            href={`https://warpcast.com/${
              thisFarcasterUser?.username || "anky"
            }/`}
            className="ml-auto hover:text-red-200"
          >
            open in warpcast
          </a>
        </div>
      )}*/}
      {renderModal()}
    </div>
  );
};

export default UserDisplayPage;
