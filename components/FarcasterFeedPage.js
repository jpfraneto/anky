import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import axios from "axios";
import Image from "next/image";
import CastDisplayCard from "./CastDisplayCard";
import Link from "next/link";
import Button from "./Button";
import UserByFidComponent from "./farcaster/UserByFidComponent";

const FarcasterFeedPage = ({ router }) => {
  const [feedCasts, setFeedCasts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedCollection, setLoadedCollection] = useState(false);
  const [chosenUserToDisplay, setChosenUserToDisplay] = useState(null);
  const [collectionAddress, setCollectionAddress] = useState(
    router.query.collectionAddress || ""
  );
  const [
    loadingFarcasterUsersForCollection,
    setLoadingFarcasterUsersForCollection,
  ] = useState(false);
  const [error, setError] = useState(false);

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  useEffect(() => {
    if (collectionAddress) {
      loadTheFarcasterCollection(collectionAddress);
    }
  }, []);

  const loadTheFarcasterCollection = async (collection) => {
    try {
      if (!collection || collection.length < 38) return;
      setLoadingFarcasterUsersForCollection(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/get-feed/${
          collection || collectionAddress
        }`
      );
      setUsers(response.data.users);
      setLoadingFarcasterUsersForCollection(false);
      setLoadedCollection(true);
    } catch (error) {
      console.log(
        "there was an error in the load the farcaster collection function",
        error
      );
    }
  };
  return (
    <div className="pt-4 text-white h-full flex flex-col">
      <div className=" flex flex-col w-96 mx-auto">
        <select
          onChange={(e) => {
            setUsers([]);
            setCollectionAddress(e.target.value);
            loadTheFarcasterCollection(e.target.value);
          }}
          className="p-3 mb-2 text-black rounded-xl"
          value={collectionAddress}
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
          <option value="custom">/custom-contract</option>
        </select>
        <input
          className="p-2 rounded-xl text-sm text-black"
          placeholder="manually enter collection address: 0x24...."
          type="text"
          value={collectionAddress}
          onChange={(e) => {
            setCollectionAddress(e.target.value);
            if (e.target.value == 42)
              loadTheFarcasterCollection(e.target.value);
          }}
        />
        {loadingFarcasterUsersForCollection && (
          <div className="w-4/5 mx-auto mt-4">
            <p>your farcaster connections are loading.</p>
            <p>patience, my dear friend.</p>
            <p>patience is all we need.</p>
            <Spinner />
          </div>
        )}
      </div>

      <div className="w-full px-4 md:px-0 md:w-full flex-grow mx-auto flex flex-wrap items-start justify-center mt-8">
        {loadedCollection &&
          users &&
          (users.length > 0 ? (
            <>
              {users.map((user, i) => {
                return (
                  <FarcasterCard
                    setChosenUserToDisplay={setChosenUserToDisplay}
                    user={user}
                    key={i}
                  />
                );
              })}
            </>
          ) : (
            <>
              {!loading && (
                <p>
                  this collection doesn&apos;t have any users on farcaster yet
                </p>
              )}
            </>
          ))}
      </div>
      {chosenUserToDisplay && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black">
          <UserByFidComponent
            chosenUserToDisplay={chosenUserToDisplay}
            setChosenUserToDisplay={setChosenUserToDisplay}
          />
        </div>
      )}
    </div>
  );
};

export default FarcasterFeedPage;

const FarcasterCard = ({ user, setChosenUserToDisplay }) => {
  const random = Math.floor(5 * Math.random());
  return (
    <div
      onClick={() => {
        setChosenUserToDisplay(user);
      }}
      className="flex m-1 relative w-16 h-16 "
    >
      <div className="border border-white w-16 h-16 rounded-full overflow-hidden relative hover:border hover:border-white cursor-pointer">
        <Image fill src={user.pfp.url || ""} />
      </div>
      <div className="absolute bg-red-600 hover:bg-red-400 px-3 border border-white rounded-full w-1 flex items-center justify-center text-white font-2xl -top-2 -right-0">
        {random}
      </div>
    </div>
  );
};
