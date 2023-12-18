import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import axios from "axios";
import CastDisplayCard from "./CastDisplayCard";

const FarcasterFeedPage = () => {
  const [feedCasts, setFeedCasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  useEffect(() => {
    async function loadFarcasterFeed() {
      try {
        const response = await axios.get(`${apiRoute}/farcaster/feed`);
        console.log("the response from the feed is: ", response.data);
        setFeedCasts(response.data.feed.casts);
        setTimeout(() => {
          setLoading(false);
        }, 2222);
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
  if (error) {
    return (
      <div className="pt-4 text-white">
        <p>there was an error. sorry about that.</p>
        <p>write</p>
      </div>
    );
  }
  return (
    <div className="pt-4 text-white">
      <p className="text-4xl">/anky</p>
      <div className="h-screen overflow-y-scroll">
        {feedCasts &&
          feedCasts.map((x, i) => {
            console.log("INEIJADOIHCAS", x);
            if (x.text && x.text.length > 10) {
              return <CastDisplayCard thisCast={x} key={i} />;
            }
          })}
      </div>
    </div>
  );
};

export default FarcasterFeedPage;
