import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { MdOutlineInsertLink } from "react-icons/md";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { getOneWriting } from "../lib/irys";
import Button from "./Button";
import { ethers } from "ethers";
import ankyOneABI from "../lib/ankyOne.json";
import degenBaseMainnetAbi from "../lib/degenBaseMainnetAbi.json";
import { useWallets } from "@privy-io/react-auth";
import { usePrivy } from "@privy-io/react-auth";

const MintYourAnky = ({ cid }) => {
  const { authenticated, login } = usePrivy();
  const [anky, setAnky] = useState({});
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [chosenImage, setChosenImage] = useState(null);
  const [error, setError] = useState(""); // New state for holding error message
  const [loading, setLoading] = useState(true);
  const [mintingAnky, setMintingAnky] = useState(false);
  const [thisWriting, setThisWriting] = useState("");
  const [ankyMinted, setAnkyMinted] = useState(false);
  const [userTriedToMint, setUserTriedToMint] = useState(false);
  const [votePercentages, setVotePercentages] = useState([]);
  const [votes, setVotes] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [votingOn, setVotingOn] = useState(false);
  const [mintingStatus, setMintingStatus] = useState("");
  const [mintingEnded, setMintingEnded] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState("");

  const { wallets } = useWallets();

  const thisWallet = wallets[0];

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
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ai/mint-an-anky/${cid}`
        );
        if (!response.data.anky) return;
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
  }, [cid]);

  const updateTimers = () => {
    const now = Date.now();
    const votingEnds = new Date(anky.createdAt).getTime() + 8 * 60 * 60 * 1000; // 8 hours from createdAt
    const mintingEnds = votingEnds + 16 * 60 * 60 * 1000; // Additional 24 hours for minting window
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
      console.log("minting this anky");
      if (!authenticated) return alert("login to mint");
      if (!thisWallet) {
        alert("No wallet found.");
        return;
      }

      if (votingOn) {
        setUserTriedToMint(true);
        setTimeout(() => {
          setUserTriedToMint(false);
        }, 2222);
      } else {
        const changeChain = async () => {
          if (thisWallet) {
            setMintingStatus("changing the chain...");
            await thisWallet.switchChain(8453);
            console.log("your wallet is active on base mainnet now");
          }
        };
        if (!thisWallet.chainId.includes("8453")) {
          await changeChain();
        }
        setMintingStatus("approving $DEGEN spending...");
        let provider = await thisWallet.getEthersProvider();
        let signer = await provider.getSigner();
        const ankyOneContract = new ethers.Contract(
          "0x87586325d3Fb4bd4F2dc712728Da84277051C641",
          ankyOneABI,
          signer
        );
        const degenTokenContract = new ethers.Contract(
          "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", // The address of the $DEGEN token contract
          degenBaseMainnetAbi, // ABI of the $DEGEN token contract
          signer // An instance of ethers.Signer
        );
        console.log("the degen token contract");

        const priceResponse = await ankyOneContract.getAnkyPriceInDegen(cid);
        const priceInDegen = ethers.utils.formatUnits(priceResponse, 18);
        console.log("the response dfreom the price is: ", priceInDegen);

        const currentAllowance = await degenTokenContract.allowance(
          await signer.getAddress(), // The owner's address
          "0x87586325d3Fb4bd4F2dc712728Da84277051C641" // The address of the AnkyOne contract
        );
        const formattedAllowance = ethers.utils.formatUnits(
          currentAllowance,
          18
        );

        // we need to check if to approve first.
        if (parseFloat(formattedAllowance) < parseFloat(priceInDegen)) {
          setMintingStatus("approving $DEGEN spending...");
          const approvalTx = await degenTokenContract.approve(
            "0x87586325d3Fb4bd4F2dc712728Da84277051C641", // The address of the AnkyOne contract
            ethers.utils.parseUnits(priceInDegen, 18) // The amount of $DEGEN to approve, parsed to the correct unit
          );
          await approvalTx.wait(); // Wait for the transaction to be mined
          setMintingStatus(
            "approval transaction successful... minting your anky"
          );
        } else {
          setMintingStatus(
            "approval not needed, sufficient allowance detected"
          );
        }
        const transactionResponse = await ankyOneContract.mintAnky(cid);
        await transactionResponse.wait(); // Wait for the minting transaction to be mined
        setMintingStatus("anky minted successfully!");
        setAnkyMinted(true);
        console.log("Anky minted successfully!");
      }
    } catch (error) {
      console.log("there was an error minting this anky", error);
      setError(
        "There was an error minting this Anky. Please ensure you have enough funds for the transaction. You can copy your wallet address by clicking on it on the left menu."
      );
    }
  }

  if (loading) return <p>loading...</p>;
  if (!anky) return <p>this anky was not found</p>;

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://www.anky.lat/mint-an-anky/${anky.cid}`
      );
      setCopiedToClipboard(true);
      setTimeout(() => {
        setCopiedToClipboard(false);
      }, 2222);
    } catch (error) {
      console.log("there was an error");
    }
  };

  return (
    <div className="w-96 mx-auto relative">
      <span
        className="cursor-pointer absolute right-0 top-0"
        onClick={copyLinkToClipboard}
      >
        {copiedToClipboard ? (
          <IoMdCheckmarkCircle size={26} color="green" />
        ) : (
          <MdOutlineInsertLink size={26} color="purple" />
        )}
      </span>
      <p className="text-white mt-2 text-xl">{anky.title || ""}</p>
      <div className="flex flex-col w-96">
        <div className="my-2 w-full aspect-square relative">
          <Image src={chosenImage} alt="image" fill />
        </div>
        {votingOn && (
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
                      chosenImage == i && "border-white border-2"
                    } w-1/5 aspect-square relative ${
                      !votingOn ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <Image src={x} alt="image" fill />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl text-white">
                      {votePercentages[i]}%
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {votingOn && <div className="text-white">{votes.length} votes</div>}
        {votingOn && (
          <div
            className={`${
              votingOn && userTriedToMint
                ? "text-red-200 text-lg"
                : "text-white"
            }`}
          >
            <p>
              {votingOn
                ? `Voting closes in ${countdownTimer}`
                : mintingEnded
                ? "Minting period ended"
                : `Minting ends in ${countdownTimer}`}
            </p>
          </div>
        )}

        <div className="flex space-x-2 justify-center w-full mt-2">
          {votingOn && (
            <a
              target="_blank"
              href={`https://warpcast.com/anky/${
                anky?.frameCastHash?.substring(0, 10) || ""
              }`}
              className=" hover:text-red-200"
            >
              <Button
                buttonText="vote on warpcast"
                buttonColor="bg-purple-600 text-white"
              />
            </a>
          )}
          {anky.mintOpen && (
            <>
              {authenticated ? (
                <>
                  {ankyMinted ? (
                    <div className="text-white">
                      <p>congratulations. your anky was minted successfully</p>
                    </div>
                  ) : (
                    <>
                      {!votingOn && !mintingEnded && (
                        <div className="flex flex-col text-white">
                          <p>
                            {votingOn
                              ? `Voting closes in ${countdownTimer}`
                              : mintingEnded
                              ? "Minting period ended"
                              : `Minting ends in ${countdownTimer}`}
                          </p>
                          {mintingStatus.length > 0 && <p> {mintingStatus}</p>}
                          <Button
                            buttonText={
                              mintingAnky ? "minting..." : "mint (222 $degen)"
                            }
                            buttonAction={mintThisAnky}
                            buttonColor="bg-purple-600 text-white"
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <Button
                  buttonText="login to mint"
                  buttonAction={login}
                  buttonColor="bg-purple-600 text-white"
                />
              )}
            </>
          )}
        </div>
        {error && <p className="text-red-500">{error}</p>}
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
