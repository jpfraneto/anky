import { usePrivy } from "@privy-io/react-auth";
import React, { useEffect } from "react";
import ankyOneABI from "../lib/ankyOne.json";

const addresses = [
  {
    name: "AnkyOne",
    abi: ankyOneABI,
    address: "0x87586325d3Fb4bd4F2dc712728Da84277051C641",
  },
];

const MyGalleryPage = () => {
  const { user, authenticated } = usePrivy();
  useEffect(() => {
    async function fetchUserAnkys() {
      try {
        if (!authenticated) return;
        console.log("the user is: ", user);
      } catch (error) {
        console.log("there was an error fetching the users ankys");
      }
    }
    fetchUserAnkys();
  }, []);
  return (
    <div className="text-white">
      <p>display all of the users ankys</p>
    </div>
  );
};

export default MyGalleryPage;
