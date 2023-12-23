import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import axios from "axios";
import Image from "next/image";
import CastDisplayCard from "./CastDisplayCard";
import Link from "next/link";
import Button from "./Button";

const FarcasterFeedPage = () => {
  const [feedCasts, setFeedCasts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionAddress, setCollectionAddress] = useState("");
  const [
    loadingFarcasterUsersForCollection,
    setLoadingFarcasterUsersForCollection,
  ] = useState(false);
  const [error, setError] = useState(false);

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  const loadTheFarcasterCollection = async () => {
    try {
      setLoadingFarcasterUsersForCollection(true);
      console.log("the collection address is: ", collectionAddress);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/get-feed/${collectionAddress}`
      );
      setUsers(response.data.users);
      setLoadingFarcasterUsersForCollection(false);
    } catch (error) {
      console.log(
        "there was an error in the load the farcaster collection function",
        error
      );
    }
  };

  return (
    <div className="pt-4 text-white">
      <select
        onChange={(e) => setCollectionAddress(e.target.value)}
        className="p-3 text-black rounded-xl"
      >
        <option value={null}>choose nft collection</option>
        <option value="0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb">
          /ethereum/cryptopunks
        </option>
        <option value="0x5806485215c8542c448ecf707ab6321b948cab90">
          /ethereum/anky-genesis
        </option>
        <option value="0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d">
          /ethereum/boredapeyatchclub
        </option>
        <option value="0xbd3531da5cf5857e7cfaa92426877b022e612cf8">
          /ethereum/pudgypenguins
        </option>
        <option value="0xd4b7d9bb20fa20ddada9ecef8a7355ca983cccb1">
          /ethereum/quirkies
        </option>
      </select>
      {collectionAddress && (
        <div className="w-96 mx-auto px-24 mt-4">
          <Button
            buttonText="load this collection"
            buttonAction={loadTheFarcasterCollection}
            buttonColor="bg-purple-600"
          />
        </div>
      )}

      {loadingFarcasterUsersForCollection && (
        <div className="w-4/5 mx-auto mt-4">
          <p>your farcaster connections are loading.</p>
          <p>patience, my dear friend.</p>
          <p>patience is all we need.</p>
          <Spinner />
        </div>
      )}

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
