import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "./Button";
import Image from "next/image";
import { WebIrys } from "@irys/sdk";
import { FaRegCommentAlt, FaRegHeart } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { GiRollingEnergy } from "react-icons/gi";
import { useUser } from "../context/UserContext";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import Spinner from "./Spinner";

const StepIndicator = ({ stepNumber, currentStep }) => {
  let className = "h-8 w-8 rounded-full border-2";
  if (currentStep < stepNumber) className += " bg-opacity-50";
  else if (currentStep === stepNumber)
    className += " bg-green-500 border-green-500";
  else className += " border-green-500";
  return <div className={className} />;
};

const AskFarcaster = () => {
  const { authenticated, login } = usePrivy();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [promptForFarcaster, setPromptForFarcaster] = useState("");
  const [filter, setFilter] = useState(""); // New state to hold the filter input
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [promptIsReadyToSubmit, setPromptIsReadyToSubmit] = useState(false);
  const [chosenChannel, setChosenChannel] = useState("");
  const [askedCast, setAskedCast] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [allChannels, setAllChannels] = useState([]);
  const [askingTheQuestion, setAskingTheQuestion] = useState(false);

  const { farcasterUser } = useUser();
  const [castAs, setCastAs] = useState("anon");

  const goToNextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    "decide if anon or you",
    "ask question",
    "choose channel",
    "preview",
    "cast as X",
    "see cast/ ask another question",
  ];

  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  useEffect(() => {
    const getFullChannelsList = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/get-channels`
        );
        console.log("all the channels are: ", response.data);
        setAllChannels(response.data.channels);
      } catch (error) {
        console.log("there was an error fetching the channels");
      }
    };
    getFullChannelsList();
  }, []);

  useEffect(() => {
    if (filter) {
      const filtered = allChannels.filter((channel) =>
        channel.name.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredChannels(filtered);
    } else {
      setFilteredChannels(allChannels);
    }
  }, [filter, allChannels]);

  async function uploadPromptToIrys(prompt) {
    try {
      const getWebIrys = async () => {
        // Ethers5 provider
        // await window.ethereum.enable();
        if (!wallet && !authenticated) return;
        console.log("INSIIIIDE HERE, THE WALLET IS: ", wallet);
        // const provider = new providers.Web3Provider(window.ethereum);
        const provider = await wallet.getEthersProvider();

        const url = "https://node2.irys.xyz";
        const token = "ethereum";
        const rpcURL = "https://rpc-mumbai.maticvigil.com"; // Optional parameter

        // Create a wallet object
        const irysWallet = {
          rpcUrl: rpcURL,
          name: "ethersv5",
          provider: provider,
        };
        console.log("ininni¡,", irysWallet);
        // Use the wallet object
        const webIrys = new WebIrys({ url, token, wallet: irysWallet });
        await webIrys.ready();
        return webIrys;
      };
      if (wallet && authenticated) {
        console.log("weeeee have a wallet");
        const webIrys = await getWebIrys();
        const tags = [
          { name: "Content-Type", value: "text/plain" },
          { name: "application-id", value: "Anky Dementors" },
          { name: "container-type", value: "prompts-notebook" },
        ];
        console.log("right before uploading");
        const receipt = await webIrys.upload(prompt, { tags });
        console.log("weeee have a receipt", receipt);
        return receipt.id;
      } else {
        console.log("there is no wallet");
        let responseFromIrys = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/upload-writing`,
          {
            text: prompt,
          }
        );
        console.log("IN HERE, THE REPSONSE FROM IRYS IS: ", responseFromIrys);
        let cid = responseFromIrys.data.cid;
        console.log("weeee have a cid", cid);
        return cid;
      }
    } catch (error) {
      console.log("there was an error uploading the thing to irys", error);
    }
  }
  async function handleSubmitPrompt() {
    console.log("setting the current step to 5");
    setCurrentStep(5);

    console.log("AFTER setting the current step to 5");

    try {
      setAskingTheQuestion(true);
      if (promptForFarcaster && promptForFarcaster.length > 0) {
        // upload the prompt to irys to get a cid
        const irysResponseCid = await uploadPromptToIrys(promptForFarcaster);
        console.log("the irys respoinse cid is: ", irysResponseCid);
        if (!irysResponseCid)
          return alert("there was an error uploading to irys");
        // use that cid to publish the question on farcaster with an embed that links to /reply/:cid
        const newCastText = `${
          promptForFarcaster.length > 300
            ? `${promptForFarcaster.slice(0, 300)}...`
            : promptForFarcaster
        }`;
        console.log("the new cast text is: ", newCastText, irysResponseCid);

        const forEmbedding = [
          { url: `https://www.anky.lat/reply/${irysResponseCid}` },
        ];

        let response;
        const parentAsUrl = chosenChannel
          ? `https://warpcast.com/~/channel/${chosenChannel}`
          : "";
        console.log(
          "the parent as url is: ",
          parentAsUrl,
          castAs,
          farcasterUser
        );
        if (castAs == "user" && farcasterUser.signerUuid) {
          response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/cast`,
            {
              text: newCastText,
              signer_uuid: farcasterUser.signerUuid,
              embeds: forEmbedding,
              parent: parentAsUrl,
              cid: irysResponseCid,
            }
          );
        } else {
          response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/api/cast/anon`,
            {
              cid: irysResponseCid,
              text: newCastText,
              parent: parentAsUrl,
              embeds: forEmbedding,
            }
          );
        }
        setAskingTheQuestion(false);
        setAskedCast(response.data.cast);
        console.log("the response from asking the question is: ", response);
      }
    } catch (error) {
      setAskingTheQuestion(false);
      setErrorMessage("there was an error broadcasting your prompt");
    }
  }
  return (
    <div className="w-96 mx-auto mt-4 text-white mb-12 h-screen overflow-y-scroll">
      {currentStep === 1 && (
        <div className="flex flex-col items-center justify-center">
          <p>
            welcome. here you can ask a question to the farcaster community.
          </p>
          <p className="mt-2">
            you can decide to ask it anonymously, or as the account you have
            connected:
          </p>
          <div className="flex mt-4">
            <div className="flex justify-center w-96 mx-auto">
              <Button
                buttonText={`ask anon`}
                buttonAction={() => {
                  setCurrentStep(2);
                  setCastAs("anon");
                }}
                buttonColor={`${
                  castAs == "anon"
                    ? "bg-green-600 border-white border-2"
                    : "bg-green-400"
                }`}
              />
              {farcasterUser?.username && authenticated ? (
                <div>
                  <Button
                    buttonText={`ask as ${farcasterUser.username}`}
                    buttonAction={() => {
                      setCurrentStep(2);
                      setCastAs("user");
                    }}
                    buttonColor={`w-fit ${
                      castAs == "user"
                        ? "bg-purple-600 border-white border-2"
                        : "bg-purple-400"
                    }`}
                  />
                </div>
              ) : (
                <div>
                  {authenticated ? (
                    <Link href="/settings?link=farcaster">
                      <Button
                        buttonText="connect farcaster account"
                        buttonColor="bg-purple-400"
                      />
                    </Link>
                  ) : (
                    <Button
                      buttonAction={() => {
                        setCastAs("user");
                        login();
                      }}
                      buttonText="login"
                      buttonColor="bg-purple-400"
                    />
                  )}
                </div>
              )}
            </div>
          </div>{" "}
        </div>
      )}
      {currentStep === 2 && (
        <div className="">
          <p className="mb-2 text-xl shadow-yellow-600 shadow-lg">
            what do you want to ask farcaster?
          </p>
          <textarea
            onChange={(e) => setPromptForFarcaster(e.target.value)}
            value={promptForFarcaster}
            placeholder="what is your purpose in life?"
            className="w-full h-36 text-black p-2 rounded-xl overflow-hidden"
          />
          <div className="border-white border-2 w-full rounded-xl mt-2 px-2 text-xs italic py-2">
            <div className="flex-none h-fit flex items-start justify-start ">
              <Link href={`/u/18350`} passHref>
                <div className="w-24 h-24 active:translate-x-2  mt-4 rounded-full overflow-hidden relative shadow-2xl">
                  <Image
                    alt="user image"
                    src={
                      castAs == "anon" ? "/images/anky.png" : farcasterUser.pfp
                    }
                    fill
                  />
                </div>
              </Link>
              <div className="grow overflow-y-scroll  px-2 py-2 text-xl text-left pl-8">
                {promptForFarcaster ? (
                  promptForFarcaster.includes("\n") ? (
                    promptForFarcaster.split("\n").map((x, i) => (
                      <p className="mb-4" key={i}>
                        {x}
                      </p>
                    ))
                  ) : (
                    <p className="my-2">{promptForFarcaster}</p>
                  )
                ) : null}
              </div>
            </div>
            <div className="w-full h-fit">
              <div className="flex flex-col h-full text-xl py-1.5 bg-black text-white w-full left-0  relative">
                <div className="px-2 w-full h-8 flex justify-between items-center">
                  <div className="pl-4 flex space-x-4 h-full">
                    <div
                      className={`flex space-x-1 items-center  hover:text-gray-500 cursor-pointer`}
                    >
                      <FaRegCommentAlt size={14} />
                      <span>12</span>
                    </div>
                    <div
                      className={`flex space-x-1 items-center  hover:text-green-500 cursor-pointer`}
                    >
                      <BsArrowRepeat size={19} />
                      <span>6</span>
                    </div>
                    <div
                      className={`flex space-x-1 items-center  hover:text-red-500 cursor-pointer`}
                    >
                      <FaRegHeart />
                      <span>48</span>
                    </div>
                    <div
                      className={`flex space-x-1 items-center  text-purple-300
            hover:text-purple-500 cursor-pointer`}
                    >
                      <GiRollingEnergy />
                      <span>2222</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={goToPreviousStep}
              className={`px-4 py-2 rounded-lg ${
                currentStep === 1 ? "opacity-50" : "bg-blue-500 text-white"
              }`}
              disabled={currentStep === 1}
            >
              {"<"}
            </button>
            <button
              onClick={goToNextStep}
              className={`px-4 py-2 rounded-lg ${
                currentStep === totalSteps
                  ? "opacity-50"
                  : "bg-green-500 text-white"
              }`}
              disabled={currentStep === totalSteps}
            >
              choose channel
            </button>
          </div>
        </div>
      )}
      {currentStep === 3 && (
        <div>
          <p className="mb-2 text-xl">Select a channel:</p>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filter channels..."
            className="mb-4 w-full border-2 border-gray-300 text-black p-2 rounded-lg"
          />
          <div className="h-36 overflow-y-auto mb-2 border-2 border-gray-300 p-2 rounded-lg">
            <ul>
              {filteredChannels.map((channel) => (
                <li
                  key={channel.id}
                  className="cursor-pointer hover:bg-purple-400"
                  onClick={() => setChosenChannel(channel.name.toLowerCase())}
                >
                  {channel.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={goToPreviousStep}
              className={`px-4 py-2 rounded-lg ${
                currentStep === 1 ? "opacity-50" : "bg-blue-500 text-white"
              }`}
              disabled={currentStep === 1}
            >
              {"<"}
            </button>
            <div>
              <button
                onClick={() => {
                  setChosenChannel(null);
                  goToNextStep();
                }}
                className={`px-4 py-2 rounded-lg bg-red-400`}
              >
                no channel
              </button>
            </div>
            {chosenChannel && (
              <div>
                <button
                  onClick={goToNextStep}
                  className={`px-4 py-2 rounded-lg ${
                    currentStep === totalSteps
                      ? "opacity-50"
                      : "bg-green-500 text-white"
                  }`}
                >
                  ask on /{chosenChannel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div>
          {chosenChannel ? (
            <p className="bg-purple-200 px-2  mb-0 py-1 w-fit text-black border border-white rounded-xl mx-auto text-lg">
              asking to {"/" + chosenChannel}
            </p>
          ) : (
            <p className="bg-purple-200 px-2  mb-0 py-1 w-fit text-black border border-white rounded-xl mx-auto text-lg">
              no channel
            </p>
          )}
          <div className="border-white border-2 w-full rounded-xl mt-2 px-2 text-xs italic py-2">
            <div className="flex-none h-fit flex items-start justify-start ">
              <Link href={`/u/18350`} passHref>
                <div className="w-24 h-24 active:translate-x-2  mt-4 rounded-full overflow-hidden relative shadow-2xl">
                  <Image
                    alt="user image"
                    src={
                      castAs == "anon" ? "/images/anky.png" : farcasterUser.pfp
                    }
                    fill
                  />
                </div>
              </Link>
              <div className="grow overflow-y-scroll  px-2 py-2 text-xl text-left pl-8">
                {promptForFarcaster ? (
                  promptForFarcaster.includes("\n") ? (
                    promptForFarcaster.split("\n").map((x, i) => (
                      <p className="mb-4" key={i}>
                        {x}
                      </p>
                    ))
                  ) : (
                    <p className="my-2">{promptForFarcaster}</p>
                  )
                ) : null}
              </div>
            </div>
            <div className="w-full h-fit">
              <div className="flex flex-col h-full text-xl py-1.5 bg-black text-white w-full left-0  relative">
                <div className="px-2 w-full h-8 flex justify-between items-center">
                  <div className="pl-4 flex space-x-4 h-full">
                    <div
                      className={`flex space-x-1 items-center  hover:text-gray-500 cursor-pointer`}
                    >
                      <FaRegCommentAlt size={14} />
                      <span>12</span>
                    </div>
                    <div
                      className={`flex space-x-1 items-center  hover:text-green-500 cursor-pointer`}
                    >
                      <BsArrowRepeat size={19} />
                      <span>6</span>
                    </div>
                    <div
                      className={`flex space-x-1 items-center  hover:text-red-500 cursor-pointer`}
                    >
                      <FaRegHeart />
                      <span>48</span>
                    </div>
                    <div
                      className={`flex space-x-1 items-center  text-purple-300
            hover:text-purple-500 cursor-pointer`}
                    >
                      <GiRollingEnergy />
                      <span>2222</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                setPromptIsReadyToSubmit(!promptIsReadyToSubmit);
                goToPreviousStep();
              }}
              className={`px-4 py-2 rounded-lg ${
                currentStep === 1 ? "opacity-50" : "bg-blue-500 text-white"
              }`}
              disabled={currentStep === 1}
            >
              {"<"}
            </button>
            <div>
              {promptForFarcaster && promptForFarcaster.length > 0 && (
                <div className="w-48 mx-auto">
                  <Button
                    buttonText={
                      promptIsReadyToSubmit
                        ? "submit"
                        : `ask as ${
                            castAs == "anon" ? "@anky" : farcasterUser.username
                          }`
                    }
                    buttonAction={() => {
                      if (promptIsReadyToSubmit) {
                        handleSubmitPrompt();
                      } else {
                        setPromptIsReadyToSubmit(!promptIsReadyToSubmit);
                      }
                    }}
                    buttonColor={
                      promptIsReadyToSubmit ? "bg-green-600 " : "bg-purple-400"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div>
          {askingTheQuestion ? (
            <div className="flex flex-col items-center">
              <p>your question is being broadcasted...</p>
              <Spinner />
            </div>
          ) : (
            <div>
              {askedCast ? (
                <div>
                  <p>your prompt was successfully asked</p>
                  <div className="flex justify-between">
                    <Button
                      buttonColor="bg-purple-600"
                      buttonText="ask again"
                      buttonAction={() => {
                        setCurrentStep(1);
                        setPromptForFarcaster("");
                        setChosenChannel(null);
                      }}
                    />
                    <a
                      target="_blank"
                      href={`https://warpcast.com/${
                        askedCast.author.username
                      }/${askedCast.hash.substring(0, 10)}`}
                      className="ml-auto hover:text-red-200"
                    >
                      open prompt on warpcast
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <p>there was an error</p>
                  <p>{errorMessage}</p>
                  <Button
                    buttonText="try again"
                    buttonColor="bg-purple-600"
                    buttonAction={goToPreviousStep}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center space-x-2 mb-6">
        {[...Array(totalSteps).keys()].map((step) => (
          <StepIndicator
            key={step}
            stepNumber={step + 1}
            currentStep={currentStep}
          />
        ))}
      </div>
    </div>
  );
};

export default AskFarcaster;
