import React, { useEffect, useState } from "react";
import Button from "./Button";
import axios from "axios";
import IndividualDecodedCastCard from "./farcaster/IndividualDecodedCastCard";
import Spinner from "./Spinner";
import { useRouter } from "next/router";

const FeedByFidPage = () => {
  const router = useRouter();
  const [thisFeed, setThisFeed] = useState(false);
  const [fid, setFid] = useState(router.query?.fid || 0);
  const [loadingFeed, setLoadingFeed] = useState(false);
  async function fetchFeed() {
    try {
      setLoadingFeed(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/feed-by-fid/${fid}`
      );
      console.log("the response is: ", response);
      setThisFeed(response.data.feed);
      setLoadingFeed(false);
    } catch (error) {
      alert("there was an error fetching the feed!");
    }
  }
  return (
    <div className="flex flex-col mt-4  w-96 mx-auto">
      <div className="flex  flex-col justify-center items-center ">
        <div className="text-white flex space-x-2 mb-2">
          <input
            type="number"
            value={fid}
            className="p-2 rounded-xl text-black"
            onChange={(e) => setFid(e.target.value)}
            placeholder="enter a fid number"
          />
        </div>

        <Button
          buttonAction={fetchFeed}
          buttonColor="bg-green-600"
          buttonText={`fetch feed for ${fid}`}
        />
      </div>
      {loadingFeed && (
        <div>
          <p className="text-white mb-2">loading feed...</p>
          <Spinner />
        </div>
      )}
      <div>
        {thisFeed &&
          thisFeed.length > 0 &&
          thisFeed.map((cast, i) => {
            return <IndividualDecodedCastCard cast={cast} key={i} />;
          })}
        {thisFeed.length == 0 && (
          <div>
            <p className="text-white">no feed for this user</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedByFidPage;
