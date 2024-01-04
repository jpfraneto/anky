import React, { useState, useEffect } from "react";

const AboutModal = () => {
  return (
    <div>
      <div className="absolute bg-black w-screen h-screen opacity-50 top-0 left-0"></div>
      <div className="absolute text-left pt-4 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black h-3/5 rounded-xl w-96 z-40 mt-4 text-white overflow-y-scroll px-4 py-4">
        <h2 className="text-2xl">About Anky</h2>
        <p className="mb-2">
          first of all, welcome. it is great to have you here. here are some
          guidelines for using this app.
        </p>
        <ol className="flex flex-col space-y-2">
          <li>
            <span className="text-purple-600">Connect to Farcaster:</span> it is
            ideal that you connect your farcaster account. For doing so, go into
            the settings tab and click on the Farcaster integration. If you
            follow the flow, you will get a QR code (on desktop) or a fancy
            button (on mobile) that will take you to Warpcast. If you need warps
            to pay, HMU on farcaster (@jpfraneto). This will allow you to cast
            under your account.
          </li>
          <li>
            <span className="text-purple-600">Feed:</span> The landing feed is
            the chronological organization of all the casts that have been
            written through Anky, wether it is anonymously or under your
            connected account. The invitation is to be honest, sincere, and to
            use this space as a collective trigger for what is hard to deal with
            personally.
          </li>
          <li>
            <span className="text-purple-600">$NEWEN:</span> This is a currency
            that represents time. For each second that you spend writing in
            here, you will earn it. You will then be able to spend it on
            different ways: "super liking" a cast you&apos;ve read by sending
            newen to the writer, attending events that before were "free", but
            now require something that is "free" (your time writing here), but
            doesn&apos;t have economical value.
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
            the writing is stored forever associated with it.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default AboutModal;
