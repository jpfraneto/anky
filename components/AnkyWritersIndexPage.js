import axios from "axios";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const AnkyWritersIndexPage = () => {
  const [ankyWriters, setAnkyWriters] = useState([]);
  useEffect(() => {
    const fetchAllAnkyWriters = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ankywriters`
        );
        console.log("respo", response);
        const writers = await response.data;
        console.log("the resopnse is : ", writers);

        setAnkyWriters(writers.ankyWriters);
      } catch (error) {
        console.log("there was an error", error);
      }
    };
    fetchAllAnkyWriters();
  }, []);

  return (
    <div className="w-full">
      <p className="text-white px-8 py-4 mb-2">
        welcome to anky writers. this is the website where you will be able to
        see the stories of the 192 anky writers that will be available for free
        minting on the 10th of march at 5 am eastern time. you can add any email
        you control on{" "}
        <a
          className="text-blue-300 hover:text-yellow-600"
          href="https://warpcast.com/jpfraneto/0x9664dfc0"
          target="_blank"
        >
          this farcaster frame
        </a>{" "}
        to participate. this will be a journey to develop consistency, using the
        practice of writing as an excuse.
      </p>
      {ankyWriters.length > 0 ? (
        <div>
          {ankyWriters.map((writer, index) => {
            return (
              <div
                key={index}
                className="flex mb-4 md:mb-0 flex-col md:flex-row w-full"
              >
                <div className="md:w-96 w-full aspect-[10/16] relative">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${writer.uploadedImage}`}
                    fill
                  />
                </div>
                <div className="pt-4 md:pt-0 flex-grow w-full flex flex-col items-start text-left px-4 text-white text-2xl">
                  <h2 className="my-2">
                    {writer.writer} - {writer.book}
                  </h2>
                  <p className="text-gray-400 text-xl">{writer.story}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <p>loading...</p>
        </div>
      )}
    </div>
  );
};

export default AnkyWritersIndexPage;
