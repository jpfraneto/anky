import React from "react";
import Button from "./Button";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/router";

const WhatIsThisPage = () => {
  const router = useRouter();
  const { login, authenticated } = usePrivy();
  return (
    <div className="text-gray-500 md:w-1/2 mx-auto bg-black p-12">
      <div className="px-2 mb-12">
        <h2 className="text-3xl mb-4">What is this?</h2>
        <p className="mb-2">
          We believe in the transformative power of writing.
        </p>
        <p className="mb-2">
          Here, you will embark on a journey of self-discovery, using writing as
          a tool to explore your inner world and connect with your thoughts and
          emotions in a meaningful way.
        </p>

        <p className="mb-2">
          Anky harnesses the serenity of meditation and the clarity of writing
          to create a pioneering system designed to enrich your mental
          well-being. Whether you&apos;re journaling your thoughts, penning down
          your aspirations, or simply reflecting on your day, Anky provides a
          serene and focused environment for you to dive deep into the essence
          of your mind.
        </p>
        <p className="mb-2">
          And to discover how that looks like, both for you, and for others.
          Identified, or anonymous. In here, there is space for everything.
        </p>
        <p className="mb-2">
          The challenge? To break free from the noise and distractions of
          everyday life and discover the power of your own voice.
        </p>
        <p className="mb-2">
          Let Anky be your guide to finding tranquility and insight through the
          art of writing.
        </p>
        <p className="mb-2">
          Experience the power of this practice, not just as a habit, but as a
          meditative practice that can illuminate your path to personal growth
          and inner peace.
        </p>
        <div className="w-48 mx-auto  text-black mt-2">
          <Button
            buttonAction={() => router.back()}
            buttonColor="bg-green-600"
            buttonText="go back"
          />
        </div>
      </div>
    </div>
  );
};

export default WhatIsThisPage;
