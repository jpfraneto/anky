import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
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
  const [thisFarcasterUser, setThisFarcasterUser] = useState({});
  const [userNotFound, setUserNotFound] = useState(false);
  const [thisAnkyUser, setThisAnkyUser] = useState({});

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
        console.log("the this user info is: ", thisUserInfo);
        if (!thisUserInfo) return;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/user/farcaster/${thisUserInfo}`
        );
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
        setLoadingUser(false);
      } catch (error) {
        console.log("this user doesnt exist");
        setLoading(false);
        setUserNotFound(true);
      }
    };
    fetchUsersInformation();
  }, []);

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
  // useEffect(() => {
  //   const fetchUsersAnkyFeed = async () => {
  //     if (!thisUserInfo) return;
  //     console.log("fetching the users anky feed", thisUserInfo);
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/u/${thisUserInfo}/feed`
  //     );
  //     console.log("THE RESPONSE HERE IS: ", response.data);
  //     setUsersAnkyFeed(response.data.feed);
  //     setLoading(false);
  //   };
  //   // fetchUserInformationOnFarcaster();
  //   fetchUsersAnkyFeed();
  // }, []);
  if (userNotFound) {
    return (
      <div className="mt-4 text-white">
        <p>This user doesn&apos;t exist.</p>
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
              <div className="flex w-1/2 h-full items-center justify-center flex-col">
                <p className="text-md">daily streak</p>
                <p className="text-2xl">21</p>
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
            <div className="flex w-1/2 flex-col">
              <div className="w-full grow-0 h-fit bg-black text-white flex flex-col p-2 justify-start items-start">
                <p className="text-xl ">Stats</p>
                <hr className="text-white h-2" />
                <div className="flex justify-between px-2 w-full">
                  <p>total $MANA earned: </p>
                  <p>{thisAnkyUser.totalManaEarned}</p>
                </div>
                <div className="flex justify-between px-2 w-full">
                  <p>longest streak: </p>
                  <p>88</p>
                </div>
                <div className="flex justify-between px-2 w-full">
                  <p>longest writing session: </p>
                  <p>2839 s</p>
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

            <div className="w-full md:w-2/3 mt-2 md:mt-0 overflow-y-scroll mx-2 h-96 bg-black text-white flex flex-col p-2 justify-start items-start">
              <p className="text-xl ">Writing Feed</p>
              <hr className="text-white h-2" />
              {usersAnkyFeed &&
                usersAnkyFeed.length &&
                usersAnkyFeed.map((cast, i) => {
                  return (
                    <div
                      key={i}
                      className="p-2 border border-red-300 w-full my-2 bg-purple-400 rounded-xl"
                    >
                      <div className="text-xs text-left">{cast.text}</div>
                      <div className="mt-2 w-full flex justify-between items-start">
                        <div className="flex">
                          <div className="mx-2 hover:text-red-200">
                            likes: {cast.reactions.likes.length}
                          </div>
                          <div className="mx-2 hover:text-green-200">
                            recasts: {cast.reactions.recasts.length}
                          </div>
                          <div className="mx-2">
                            comments: {cast.replies.count}
                          </div>
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
    </div>
  );
};

export default UserDisplayPage;
