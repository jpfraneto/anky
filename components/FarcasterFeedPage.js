import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import axios from "axios";
import Image from "next/image";
import CastDisplayCard from "./CastDisplayCard";
import Link from "next/link";

const FarcasterFeedPage = () => {
  const [feedCasts, setFeedCasts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [collectionAddress, setCollectionAddress] = useState("");

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  useEffect(() => {
    async function loadFarcasterFeed() {
      try {
        const response = await axios.get(`${apiRoute}/farcaster/random-feed`);
        console.log("the response from the feed is: ", response.data);
        setUsers(response.data.users);
        setLoading(false);
      } catch (error) {
        setError(true);
      }
    }
    loadFarcasterFeed();
  }, []);

  if (loading)
    return (
      <div className="pt-4 text-white">
        <p>the feed is loading...</p>
        <Spinner />
      </div>
    );
  if (!users) {
    return <p>loading</p>;
  }
  return (
    <div className="pt-4 text-white">
      <p className="text-4xl">/anky/ethereum/cryptopunks</p>

      <div className="w-96 h-screen mx-auto flex flex-wrap justify-center mt-8">
        {users &&
          users.map((user, i) => {
            return <FarcasterCard user={user} key={i} />;
          })}
      </div>
    </div>
  );
};

export default FarcasterFeedPage;

const FarcasterCard = ({ user }) => {
  const random = Math.floor(5 * Math.random());
  return (
    <Link href={`/u/${user.fid}`} passHref>
      <div className="flex m-2 relative w-16 h-16">
        <div className="w-16 h-16 rounded-full overflow-hidden relative hover:border hover:border-white cursor-pointer">
          <Image fill src={user.pfp.url} />
        </div>
        <div className="absolute bg-red-600 hover:bg-red-400 px-3 border border-white rounded-full w-1 flex items-center justify-center text-white font-2xl -top-2 -right-0">
          {random}
        </div>
      </div>
    </Link>
  );
};
