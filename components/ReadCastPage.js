import React, { useEffect, useState } from "react";
import axios from "axios";

const ReadCastPage = () => {
  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  const [cast, setCast] = useState();
  const router = useRouter();
  const { id } = router;
  useEffect(() => {
    if (!id) return;
    async function fetchCastByHash(id) {
      console.log("fetching the cast...");
      const response = await axios.get(`${apiRoute}/farcaster/api/cast/${id}`);
      console.log("the response is: ", response);
    }
    fetchCastByHash(id);
  }, [id]);
  return <div>ReadCastPage</div>;
};

export default ReadCastPage;
