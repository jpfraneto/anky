import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Button from "./Button";

const MintYourAnky = ({ cid }) => {
  console.log("inside the mint your anky function", cid);
  const [anky, setAnky] = useState({});
  const [chosenImage, setChosenImage] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  useEffect(() => {
    const thisAnkyForMinting = async () => {
      try {
        console.log("trying the mint youasd");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ai/mint-your-anky/${cid}`
        );
        console.log("the response is: ", response);
        setAnky(response.data.anky);
        setChosenImage(response.data.chosenImageIndex);
        setImageUrls([
          response.data.anky.imageOneUrl,
          response.data.anky.imageTwoUrl,
          response.data.anky.imageThreeUrl,
          response.data.anky.imageFourUrl,
        ]);
      } catch (error) {
        console.log("there was an error here", error);
      }
    };
    thisAnkyForMinting();
  }, []);
  return (
    <div>
      <p className="text-white">here you will be able to mint your anky</p>
      <div className="flex flex-col w-96">
        <div className="my-2 w-full aspect-square relative">
          <Image src={chosenImage} alt="image" fill />
        </div>
        <div className="flex flex-row w-full h-fit">
          {imageUrls.map((x, i) => {
            return (
              <div key={i} className="w-1/5 aspect square relative">
                <Image src={x} alt="image" fill />
              </div>
            );
          })}
        </div>
        <div>
          <Button
            buttonText="mint this anky"
            buttonAction={() => alert("mint this anky")}
            buttonColor="bg-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

export default MintYourAnky;
