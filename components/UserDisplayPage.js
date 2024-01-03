import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { getThisUserWritings } from "../lib/irys";
import Spinner from "./Spinner";
import { Bar } from "react-chartjs-2";
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
  const [usersAnkyFeed, setUsersAnkyFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [allUserWritings, setAllUserWritings] = useState([]);
  const [entryForDisplay, setEntryForDisplay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [longestRun, setLongestRun] = useState(null);
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
        label: "Mana Earned",
        data: [],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  });

  useEffect(() => {
    const fetchUsersInformation = async () => {
      try {
        if (!thisUserInfo) return;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/user/farcaster/${thisUserInfo}`
        );
        console.log("the response here sadasdas: ", response);
        setThisFarcasterUser(response.data.farcasterUser);

        const manaByDate = response.data.manaData;
        const labels = Object.keys(manaByDate);
        const data = Object.values(manaByDate);
        const backgroundColors = data.map(
          (value) => `rgba(53, 162, ${value % 255}, 0.5)` // Dynamic color based on value
        );
        setChartData({
          labels,
          datasets: [
            {
              label: "Mana Earned",
              data,
              backgroundColor: backgroundColors,
            },
          ],
        });
        setThisAnkyUser(response.data.ankyUser);
        setLongestRun(response.data.longestRun);
        setLoadingUser(false);
      } catch (error) {
        console.log("this user doesnt exist");
        setLoading(false);
        setUserNotFound(true);
      }
    };
    fetchUsersInformation();
  }, []);

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
    const fetchUsersAnkyFeed = async () => {
      if (!thisUserInfo) return;
      console.log("fetching the users anky feed", thisUserInfo);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/u/${thisUserInfo}/feed`
      );
      console.log("THE RESPONSE HERE IS: ", response.data);
      setUsersAnkyFeed(response.data.feed);
      setLoading(false);
    };
    fetchUsersAnkyFeed();
  }, []);

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
  if (userNotFound) {
    return (
      <div className="mt-4 text-white px-4">
        <p>This user doesn&apos;t exist in the db yet.</p>
        <p>
          I need to make the connection between the farcaster fid and the user
          inside the database.{" "}
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
    <div className="w-full px-4 h-full ">
      <div className="md:w-5/6 mt-12 h-48  rounded-xl bg-black border-2 border-white relative mx-auto">
        <p className="text-white pt-2">
          this user has not connected her farcaster account yet
        </p>
        <div className="absolute bottom left-1/2 -bottom-1/3 -translate-y-2/5 rounded-xl overflow-hidden border-2 border-white -translate-x-1/2">
          <div className="w-36 h-36 z-5 bg-black relative">
            <Image
              src={`${thisFarcasterUser?.pfp_url || "/ankys/anky.png"}`}
              fill
            />
          </div>
        </div>
      </div>
      {thisAnkyUser ? (
        <div>
          <div className="md:w-full px-4 flex justify-between h-24 z-1 rounded-xl bg-blue-200  mx-auto">
            <div className="w-1/3 flex ">
              <div className="flex w-1/2 h-full  items-center justify-center flex-col">
                <p className="text-md">writing streak</p>
                <p className="text-2xl">
                  {Math.max(thisAnkyUser.longestStreak, thisAnkyUser.streak)}
                </p>
              </div>
              <div className="flex w-1/2 h-full items-center justify-center flex-col">
                <p className="text-md">balance $NEWEN</p>
                <p className="text-2xl">{thisAnkyUser.manaBalance}</p>
              </div>
            </div>
            <div className="text-black flex items-end pb-2">
              <p>@{thisFarcasterUser?.username || "anon"}</p>
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
          <p className="text-white">2000 $NEWEN to level 9</p>
          <div className="w-full mt-2 h-full flex flex-col md:flex-row">
            <div className="flex w-full md:w-1/2 flex-col">
              <div className="w-full grow-0 h-fit bg-black text-white flex flex-col p-2 justify-start items-start">
                <p className="text-xl ">Stats</p>
                <hr className="text-white h-2" />
                <div className="flex justify-between px-2 w-full">
                  <p>total $MANA earned: </p>
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
                  <p>{longestRun.amount} s</p>
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
                          text: "Mana Earned",
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
                              label += `${context.parsed.y} mana`;
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
                )} */}
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
      )}
      {renderModal()}
    </div>
  );
};

export default UserDisplayPage;
