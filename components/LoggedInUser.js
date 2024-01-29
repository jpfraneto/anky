import React, { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Button from "./Button";
import { getFeedbackFromAnky } from "../lib/backend";

const LoggedInUser = ({ startNewRun, text, prompt }) => {
  const { user, logout } = usePrivy();
  const [getAnkyProcess, setGetAnkyProcess] = useState(false);
  const [baseActive, setBaseActive] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [copyText, setCopyText] = useState("Copy my writing");

  const [userWallet, setUserWallet] = useState(null);
  const wallets = useWallets();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    console.log("in here");
    if (wallet) {
      await wallet.switchChain(8453);
      setBaseActive(true);
      setUserWallet(wallet);
      console.log("the chain was changed");
    }
  };
  useEffect(() => {
    changeChain();
  }, [wallet]);

  const pasteText = async () => {
    await navigator.clipboard.writeText(text);
    setCopyText("Copied.");
  };

  const getFeedbackFromWriting = async () => {
    console.log("now going to get the feedback from the writing");
    const feedbackFromAnky = await getFeedbackFromAnky(
      text,
      {
        wallet: userWallet.address,
        username: "chocapec",
      },
      prompt
    );
    setFeedback(feedbackFromAnky.ankyResponse);
  };

  return (
    <div className="z-50 overflow-y-scroll bg-black p-4 rounded-xl">
      {feedback ? (
        <div className="flex flex-col space-y-2 h-2/3 overflow-y-scroll">
          {feedback.split("\n").map((x, i) => {
            return (
              <p className="mb-2" key={i}>
                {x}
              </p>
            );
          })}
        </div>
      ) : (
        <>
          {getAnkyProcess ? (
            <div className="flex flex-col space-y-2 h-2/3 overflow-y-scroll">
              <p>How does this work?</p>
              <p>
                The idea is that you can store each day of writing in your
                wallet. How?
              </p>
              <p>
                At this point in time you should already have an Anky in your
                wallet. I should work on that back end functionality.
              </p>
              <p>
                An Anky is just an ERC721 NFT with updatable metadata. You can
                choose to update how it looks, and each time that you get a new
                anky you will be able to pay for it. A little bit. But
                something.
              </p>
              <p>
                It is not only an ERC721. It is an ERC-6551 account, which will
                store other NFTs.
              </p>
              <p>
                That are your writings. Each day that you come here to write, it
                will be stored on the blockchain. Anon.
              </p>
              <p>
                And your anky will store the money that you have on this system.
                Which will be counted on 3 different currencies, that have
                different values. This is just a symbolism.
              </p>
              <p>
                I could mint a specific NFT (and charge for it with crossmint)
                and then send the money to the user right away.
              </p>
              <p>How to fund the users wallet easily?</p>
              <p>Which is the flow that wants to happen here?</p>
              <p>
                This is just an ongoing exploration. If you have any ideas, feel
                free to reach out to me at jp@anky.lat and help me to understand
                which is the UX that wants to happen here.
              </p>

              <div className="flex justify-around mt-3">
                <Button
                  buttonAction={pasteText}
                  buttonText={copyText}
                  buttonColor="bg-purple-600"
                />
                <Button
                  buttonAction={getFeedbackFromWriting}
                  buttonText="Get Feedback"
                  buttonColor="bg-purple-600"
                />
                <Button
                  buttonAction={startNewRun}
                  buttonText="Start Again"
                  buttonColor="bg-yellow-400 text-black"
                />
                <Button
                  buttonAction={() => alert("How can I fund the users wallet?")}
                  buttonColor="bg-green-600"
                  buttonText="Add eth to wallet"
                />
                <Button
                  buttonAction={logout}
                  buttonText="Log Out"
                  buttonColor="bg-red-600"
                />{" "}
              </div>
            </div>
          ) : (
            <>
              {baseActive && (
                <div className="flex flex-col space-y-2">
                  <p>You are logged in.</p>
                  <p>This is your wallets address:</p>

                  <p>{userWallet.address}</p>
                </div>
              )}
              <div className="flex justify-center mt-2">
                <Button
                  buttonAction={pasteText}
                  buttonText={copyText}
                  buttonColor="bg-purple-600"
                />
                <Button
                  buttonAction={() => setGetAnkyProcess(true)}
                  buttonText="Next step"
                  buttonColor="bg-green-600"
                />
                <Button
                  buttonAction={logout}
                  buttonText="Log Out"
                  buttonColor="bg-red-600"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LoggedInUser;
