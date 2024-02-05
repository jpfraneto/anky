import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

const MintYourAnky = ({ cid }) => {
  console.log("inside the mint your anky function", cid);
  const [anky, setAnky] = useState({});
  useEffect(() => {
    const thisAnkyForMinting = async () => {
      try {
        console.log("trying the mint youasd");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ai/mint-your-anky/${cid}`
        );
        setAnky(response.data.anky);
      } catch (error) {
        console.log("there was an error here", error);
      }
    };
    thisAnkyForMinting();
  }, []);
  return (
    <div>
      <p className="text-white">here you will be able to mint your anky</p>
    </div>
  );
};

export default MintYourAnky;
