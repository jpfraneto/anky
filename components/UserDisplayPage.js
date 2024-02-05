import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { getThisUserWritings } from "../lib/irys";
import Spinner from "./Spinner";
import { Bar } from "react-chartjs-2";
import { useUser } from "../context/UserContext";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserDisplayPage = ({
  thisUserInfo,
  displayAnkyModal,
  setDisplayFarcasterConnectionModalState,
}) => {
  const router = useRouter();
  const { farcasterUser } = useUser();
  const { authenticated } = usePrivy();
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
              buttonAction={() => {
                if (authenticated && farcasterUser?.status != "approved") {
                  if (farcasterUser.signerStatus == "approved") {
                    return alert("follow this user");
                  } else {
                    setDisplayFarcasterConnectionModalState(true);
                  }
                } else {
                  if (!authenticated) {
                    alert(
                      "you need to login first and then connect your farcaster account to do this"
                    );
                  } else {
                    alert("follow this user");
                  }
                }
              }}
            />
          )}
        </div>
        <div className="w-1/2 px-1">
          <Button
            buttonText={`gift newen`}
            buttonColor="bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black border-black border-2"
            buttonAction={() => alert("send x newen to this user")}
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
      {renderModal()}
    </div>
  );
};

export default UserDisplayPage;
