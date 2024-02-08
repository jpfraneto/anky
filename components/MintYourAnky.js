import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { getOneWriting } from "../lib/irys";
import Button from "./Button";

const MintYourAnky = ({ cid }) => {
  const [anky, setAnky] = useState({});
  const [chosenImage, setChosenImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mintingAnky, setMintingAnky] = useState(false);
  const [thisWriting, setThisWriting] = useState("");
  const [votePercentages, setVotePercentages] = useState([]);
  const [votes, setVotes] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  useEffect(() => {
    const fetchWritingFromIrys = async (cid) => {
      try {
        const writingFromIrys = await getOneWriting(cid);
        setThisWriting(writingFromIrys.text);
      } catch (error) {
        console.log("there was an error fetching the writing from irys", error);
      }
    };
    const thisAnkyForMinting = async () => {
      try {
        console.log("sending to ", process.env.NEXT_PUBLIC_API_ROUTE);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ai/mint-your-anky/${cid}`
        );
        console.log("the response is: ", response);
        setAnky(response.data.anky);
        const responseVotes = response.data.votes;
        setVotes(responseVotes);
        let voteCounts = [0, 0, 0, 0];
        responseVotes.forEach((vote) => {
          if (vote.voteIndex >= 0 && vote.voteIndex < 4) {
            voteCounts[vote.voteIndex]++;
          }
        });
        // Calculate total votes for normalization
        const totalVotes = votes.length;

        // Calculate percentages for each option
        let votePercentagesResponse = voteCounts.map((count) => {
          return totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : 0;
        });
        console.log(
          "the response votes",
          responseVotes,
          votePercentagesResponse
        );
        setVotePercentages(votePercentagesResponse);

        setChosenImage(response.data.anky.imageOneUrl);
        setImageUrls([
          response.data.anky.imageOneUrl,
          response.data.anky.imageTwoUrl,
          response.data.anky.imageThreeUrl,
          response.data.anky.imageFourUrl,
        ]);
        if (cid) {
          fetchWritingFromIrys(cid);
        }
        setLoading(false);
      } catch (error) {
        console.log("there was an error here", error);
      }
    };
    console.log("right before this");
    thisAnkyForMinting();
  }, []);

  async function mintThisAnky() {
    try {
      alert("now the anky should be minted");
      setMintingAnky(true);
      const thisProvider = await thisWallet.getEthersProvider();
      let signer = await thisProvider.getSigner();
      const ankyFirstContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_FIRST_CONTRACT_ADDRESS,
        AnkyFirstAbi,
        signer
      );
      // mintThisAnky(cid)
      const tx = await ankyFirstContract.mintThisAnky(to, cid, metadataHash);
      console.log("the tx is: ", tx);
    } catch (error) {
      console.log("there was an error minting this anky");
    }
  }
  if (loading) return <p>loading...</p>;
  console.log("HERE", imageUrls[chosenImage]);
  console.log("the image urls0", imageUrls, chosenImage);
  console.log("this writing is: ", thisWriting);
  return (
    <div className="w-96 mx-auto">
      <p className="text-white mt-2 text-xl">MINT THIS ANKY</p>
      <div className="flex flex-col w-96">
        <div className="my-2 w-full aspect-square relative">
          <Image src={chosenImage} alt="image" fill />
        </div>
        <div className="flex flex-row justify-between mb-2 w-full h-fit">
          {imageUrls &&
            imageUrls.map((x, i) => {
              return (
                <div
                  key={i}
                  onClick={() => setChosenImage(imageUrls[i])}
                  className={`${
                    chosenImage == i
                      ? "border-white border-2"
                      : "cursor-not-allowed"
                  } w-1/5 aspect-square relative `}
                >
                  <Image src={x} alt="image" fill />
                </div>
              );
            })}
        </div>
        <div>
          <Button
            buttonText={`${
              mintingAnky ? "minting..." : "mint this anky (888 $degen)"
            }`}
            buttonAction={mintThisAnky}
            buttonColor="bg-purple-600 text-white"
          />
        </div>
      </div>
      <div className="text-white text-left">
        {thisWriting ? (
          thisWriting.includes("\n") ? (
            thisWriting.split("\n").map((x, i) => (
              <p className="my-2" key={i}>
                {x}
              </p>
            ))
          ) : (
            <p className="my-2">{thisWriting}</p>
          )
        ) : null}
      </div>
    </div>
  );
};

export default MintYourAnky;
