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
  const [votingOn, setVotingOn] = useState(false);
  const [mintingEnded, setMintingEnded] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState("");

  useEffect(() => {
    // Your existing useEffect code for fetching Anky data
    // After setting Anky data, calculate and set timers
    if (anky?.createdAt) {
      updateTimers();
    }
  }, [anky?.createdAt]);

  useEffect(() => {
    // Assuming `anky.createdAt` is a timestamp or a date string that can be parsed by `Date`
    if (anky && anky?.createdAt) {
      const intervalId = setInterval(() => {
        updateTimers();
      }, 1000); // Update every second

      // Cleanup interval on component unmount or when `anky.createdAt` changes
      return () => clearInterval(intervalId);
    }
  }, [anky?.createdAt]);

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
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ai/mint-your-anky/${cid}`
        );
        if (!anky) return;
        setAnky(response.data.anky);
        const responseVotes = response.data.votes;
        setVotes(responseVotes);
        let voteCounts = [0, 0, 0, 0];
        responseVotes.forEach((vote) => {
          if (vote.voteIndex >= 0 && vote.voteIndex < 4) {
            voteCounts[vote.voteIndex]++;
          }
        });
        setVotes(responseVotes);
        // Calculate total votes for normalization
        const totalVotes = responseVotes.length;

        // Calculate percentages for each option
        let votePercentagesResponse = voteCounts.map((count) => {
          return totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : 0;
        });

        setVotePercentages(votePercentagesResponse);
        const highestVoteIndex = votePercentagesResponse.findIndex(
          (percentage) => {
            return percentage == Math.max(...votePercentagesResponse);
          }
        );

        const newImageUrls = [
          response.data.anky.imageOneUrl,
          response.data.anky.imageTwoUrl,
          response.data.anky.imageThreeUrl,
          response.data.anky.imageFourUrl,
        ];
        setImageUrls(newImageUrls);
        const highestVoteImageUrl = newImageUrls[highestVoteIndex];
        setChosenImage(highestVoteImageUrl);

        if (cid) {
          fetchWritingFromIrys(cid);
        }
        setLoading(false);
      } catch (error) {
        console.log("there was an error here", error);
      }
    };
    thisAnkyForMinting();
  }, []);

  const updateTimers = () => {
    const now = Date.now();
    const votingEnds = new Date(anky.createdAt).getTime() + 8 * 60 * 60 * 1000; // 8 hours from createdAt
    const mintingEnds = votingEnds + 24 * 60 * 60 * 1000; // Additional 24 hours for minting window
    if (now < votingEnds) {
      setVotingOn(true);
      setCountdownTimer(formatTime(votingEnds - now));
    } else if (now >= votingEnds && now < mintingEnds) {
      setVotingOn(false); // Voting period ended, minting period starts
      setCountdownTimer(formatTime(mintingEnds - now));
    } else {
      setMintingEnded(true); // Both voting and minting periods have ended
      setCountdownTimer("00:00:00");
    }
  };

  const formatTime = (milliseconds) => {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const pad = (num) => (num < 10 ? `0${num}` : num);

  async function mintThisAnky() {
    try {
      alert("now the anky should be minted. i dont know how to do this. help");
      return;
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

  return (
    <div className="w-96 mx-auto">
      <p className="text-white mt-2 text-xl">{anky.title || ""}</p>
      <div className="flex flex-col w-96">
        <div className="my-2 w-full aspect-square relative">
          <Image src={chosenImage} alt="image" fill />
        </div>
        <div className="flex flex-row mb-4 justify-between  w-full h-fit">
          {imageUrls &&
            imageUrls.map((x, i) => {
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (votingOn) {
                      setChosenImage(imageUrls[i]);
                    } else if (mintingEnded) {
                      alert("the minting process for this anky is closed");
                    } else {
                      alert("that anky was not voted");
                    }
                  }}
                  className={`${
                    chosenImage == i
                      ? "border-white border-2"
                      : "cursor-not-allowed"
                  } w-1/5 aspect-square relative `}
                >
                  <Image src={x} alt="image" fill />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl text-white">
                    {votePercentages[i]}%
                  </span>
                </div>
              );
            })}
        </div>
        {votes && <div className="text-white">{votes.length} votes</div>}

        <div className="text-white">
          <p>
            {votingOn
              ? `Voting closes in ${countdownTimer}`
              : mintingEnded
              ? "Minting period ended"
              : `Minting ends in ${countdownTimer}`}
          </p>
        </div>
        <div className="flex space-x-2 justify-center w-full mt-2">
          {votingOn && (
            <a
              target="_blank"
              href={`https://warpcast.com/anky/${anky.frameCastHash.substring(
                0,
                10
              )}`}
              className=" hover:text-red-200"
            >
              <Button
                buttonText="vote in warpcast"
                buttonColor="bg-purple-600 text-white"
              />
            </a>
          )}
          {!votingOn && !mintingEnded}
          {
            <Button
              buttonText={`${mintingAnky ? "minting..." : "mint (222 $degen)"}`}
              buttonAction={mintThisAnky}
              buttonColor="bg-purple-600 text-white"
            />
          }
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
