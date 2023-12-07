import React from "react";
import Button from "./Button";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

const WhatIsThisPage = () => {
  const { login, authenticated } = usePrivy();
  return (
    <div className="mt-3 text-white md:w-1/2 mx-auto">
      {!authenticated ? (
        <div>
          <h2 className="text-3xl mb-4">What is this?</h2>
          <p className="mb-2">
            We believe in the transformative power of writing.
          </p>
          <p className="mb-2">
            This practice is not just a means of communication; it&apos;s a pathway
            to deeper self-awareness and mindfulness. Here, you embark on a
            journey of self-discovery, using writing as a tool to explore your
            inner world and connect with your thoughts and emotions in a
            meaningful way.
          </p>
          <p className="mb-2">
            Our mission is to guide you through this introspective process.
          </p>
          <p className="mb-2"></p>
          <p className="mb-2">
            Anky harnesses the serenity of meditation and the clarity of writing
            to create a pioneering system designed to enrich your mental
            well-being. Whether you&apos;re journaling your thoughts, penning down
            your aspirations, or simply reflecting on your day, Anky provides a
            serene and focused environment for you to dive deep into the essence
            of your mind.
          </p>
          <p className="mb-2">
            The challenge? To break free from the noise and distractions of
            everyday life and discover the power of your own voice. In doing so,
            you&apos;ll find a sense of peace, gain new perspectives, and cultivate a
            practice that nurtures your mental health.
          </p>
          <p className="mb-2">
            Let Anky be your guide to finding tranquility and insight through
            the art of writing. Experience the power of writing, not just as a
            habit, but as a meditative practice that can illuminate your path to
            personal growth and inner peace.
          </p>
          <div className="w-48 mx-auto mt-2">
            <Button
              buttonAction={login}
              buttonColor="bg-green-600"
              buttonText="Create Account"
            />
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-3xl mb-4">Welcome</h2>
          <p className="mb-2">Your account was created.</p>
          <p className="mb-2">Now, just write.</p>
          <div className="w-48 mx-auto mt-2">
          <Link passHref href='/write?p=explain-how-it-feels-to-be-you'>
            <Button
              buttonText="write"
              buttonAction={null}
              buttonColor="bg-purple-600"
            />
          </Link>
          </div>
         
        </div>
      )}
    </div>
  );
};

export default WhatIsThisPage;
