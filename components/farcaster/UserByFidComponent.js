import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../Button";
import Image from "next/image";
import Link from "next/link";
import IndividualCastCard from "./IndividualCastCard";

const UserByFidComponent = ({ fid }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  console.log("THE FID IS: ", fid);
  const [usersAnkyFeed, setUsersAnkyFeed] = useState([]);
  useEffect(() => {
    const fetchUserCastsOnAnky = async () => {
      if (!fid) return;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/u/${fid}`
      );
      setUser(response.data.user);

      setLoading(false);
    };
    const fetchUsersAnkyFeed = async () => {
      if (!fid || !fid > 0) return;
      console.log("fetching the users anky feed", fid);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/u/${fid}/feed`
      );
      console.log("THE RESPONSE HERE IS: ", response.data);
      setUsersAnkyFeed(response.data.feed);
    };
    fetchUserCastsOnAnky();
    fetchUsersAnkyFeed();
  }, []);

  if (loading) return <p className="text-white">loading user...</p>;
  console.log("this user is: ", user);
  console.log("the users anky feed is: ", usersAnkyFeed);
  return (
    <div className="w-fit h-screen overflow-y-scroll mx-auto px-2 py-4 text-white">
      <section>
        <div className="flex w-full h-48 items-center">
          <div className="h-36 w-36 rounded-full relative border border-white mx-auto my-2 overflow-hidden">
            <Image fill src={user.pfp.url} alt="user image" />
          </div>
        </div>

        <p>
          Following: {user.followingCount} | Followers: {user.followerCount}
        </p>
        <div className="flex justify-between my-2 w-48 mx-auto">
          <Button
            buttonAction={() => alert("follow or unfollow")}
            buttonText="unfollow"
            buttonColor="bg-red-600"
          />
          <Link href="/farcaster/feed" passHref>
            <Button buttonText="go back" buttonColor="bg-green-600" />
          </Link>
        </div>
      </section>
      <hr className="my-3 " />
      <section>
        {usersAnkyFeed &&
          usersAnkyFeed.map((cast, i) => {
            return <IndividualCastCard cast={cast} key={i} />;
          })}
      </section>
    </div>
  );
};

export default UserByFidComponent;
