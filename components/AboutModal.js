import { usePrivy } from "@privy-io/react-auth";
import Button from "./Button";
import React, { useState, useEffect } from "react";

const AboutModal = ({ setDisplayAboutModal, setDisplayWritingGameLanding }) => {
  const { login } = usePrivy();
  return (
    <div>
      <div
        onClick={() => setDisplayAboutModal(false)}
        className="fixed bg-black w-screen h-screen opacity-80 top-0 left-0"
      ></div>
      <div className="fixed text-left pt-4 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black h-4/5 rounded-xl w-5/6 md:w-2/3 lg:w-1/3 z-40 mt-4 text-white overflow-y-scroll px-4 py-4">
        <span
          className="fixed right-4 top-2 text-red-600 cursor-pointer"
          onClick={() => setDisplayAboutModal(false)}
        >
          close
        </span>
        <h2 className="text-2xl">About Anky</h2>
        <p className="mb-2">
          first of all, welcome. it is great to have you here. these are some
          guidelines for using this app.
        </p>
        <ol className="flex flex-col space-y-2">
          <li>
            <span className="text-purple-600">Login:</span> you can log in using
            any email that you control, or an ethereum wallet directly. We use
            Privy as a provider, and every transaction that happens in here is
            secured by their system.
          </li>
          <li>
            <span className="text-purple-600">Connect to Farcaster:</span> it is
            ideal that you connect your farcaster account. For doing so, go into
            the settings tab and click on the Farcaster integration. If you
            follow the flow, you will get a QR code (on desktop) or a fancy
            button (on mobile) that will take you to Warpcast. This connection
            will allow you to cast under your account and connect with others.
          </li>
          <li>
            <span className="text-purple-600">Feed:</span> The landing feed is
            the chronological organization of all the casts that have been
            written through Anky, wether it is anonymously or under
            people&apos;s connected account. The invitation is to be honest,
            sincere, and to use this space as a collective trigger for what is
            hard to deal with personally.
          </li>
          <li>
            <span className="text-purple-600">$NEWEN:</span> This is a currency
            that represents time. For each second that you spend writing in
            here, you will earn it. You will then be able to spend it on
            different ways: &quot;super liking&quot; a cast you&apos;ve read by
            sending newen to the writer, attending events that before were
            &quot;free&quot;, but now require something that is &quot;free&quot;
            (your time writing here), but doesn&apos;t have economical value.
            This whole journey is an exploration into the role that time plays
            in our life.
          </li>
          <li>
            <span className="text-purple-600">$ANKY:</span> This is the
            economical currency inside this system, and its tokenomics is
            currently under development. If you want to contribute to it, you
            can gather more information and comment on{" "}
            <a
              className="text-purple-400 active:text-purple-600"
              rel="noopener noreferrer"
              href="https://docs.google.com/document/d/16hUjgyodcO7ke1VN3fcV0Z_1-37RQq8IKLIl32WBO1I/edit?usp=sharing"
              target="_blank"
            >
              this google doc
            </a>
            . Further developments of the platform will include the direct usage
            of AI, on a bidirectional basis: Imagine an LLM created with all of
            the writings of people (with you getting an allocation of $ANKY for
            each time that it is used, based on the amount you own). Imagine
            getting feedback of your writing. Imagine getting direct prompts
            that trigger you. Imagine transforming your writing into an image.
            Imagine transforming all of what you write into a cartoon that
            represents your subconscious better than everything that you have
            seen until now. All of that will be possible, and we will build this
            platform together to get to that point.
          </li>
          <li>
            <span className="text-purple-600">open source:</span> All of the
            code for what happens here is open source. You can contribute to it
            here:{" "}
            <a
              className="text-purple-400 active:text-purple-600"
              rel="noopener noreferrer"
              href="https://www.github.com/ankylat"
              target="_blank"
            >
              https://www.github.com/ankylat
            </a>
          </li>
          <li>
            <span className="text-purple-600">tech:</span> Every writing is
            stored on arweave using Irys as the proxy. If you logged in using
            your wallet, you will get a modal every time that you submit your
            writing. That is because your personal wallet signs that message and
            the writing is stored forever associated with it. If you logged in
            with email this is done under the hood.
          </li>
          <li>
            <span className="text-purple-600">Ankyverse:</span> The journey
            through the human experience that you will embark through this
            platform has as a guiding process this allegorical interpretation of
            the human experience. There are 8 kingdoms, each one representing an
            aspect of the human experience. You can get to know more about the
            lore of anky on the{" "}
            <a
              className="text-purple-400 active:text-purple-600"
              rel="noopener noreferrer"
              href="https://wiki.anky.lat"
              target="_blank"
            >
              wiki.
            </a>
            .
          </li>
          <li>
            <span className="text-purple-600">Collaborate:</span> Today, one of
            the most powerful ways on which you can contribute to what is
            happening here (besides writing!) is to get your Anky Genesis NFT.
            The contract is deployed on ethereum mainnet, the price is 0.01618
            eth and you can mint yours here:{" "}
            <a
              className="text-purple-400 active:text-purple-600"
              rel="noopener noreferrer"
              href="https://mint.anky.lat"
              target="_blank"
            >
              mint my anky
            </a>
            .
          </li>
        </ol>
        <div className="mt-2 w-24 flex ">
          <div className="">
            <Button
              buttonAction={() => {
                setDisplayAboutModal(false);
                setDisplayWritingGameLanding(true);
              }}
              buttonColor="bg-green-600 text-center"
              buttonText="write"
            />
          </div>
          <div className="ml-2">
            <Button
              buttonAction={() => setDisplayAboutModal(false)}
              buttonColor="bg-red-600 text-center"
              buttonText="close"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
