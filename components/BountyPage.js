import { usePrivy } from "@privy-io/react-auth";
import React from "react";
import Button from "./Button";

const BountyPage = ({ setDisplayWritingGameLanding }) => {
  const { authenticated, login } = usePrivy();
  if (!authenticated)
    return (
      <div className="mt-4 w-96 mx-auto text-white ">
        <p>you need to login first to participate in the bounty</p>
        <p>(with any wallet or email you control)</p>
        <div className="flex justify-center mt-2">
          <Button
            buttonText="login"
            buttonAction={login}
            buttonColor="bg-green-600"
          />
        </div>
      </div>
    );
  return (
    <div className="mt-4 text-white">
      <h2 className="text-xl">bounty instructions</h2>
      <p>
        this app is for writing, and your mission is to write between 15 and 25
        minutes.
      </p>
      <p>once you finish writing, you will see a screen that will tell you:</p>
      <p>how much newen you earned for your session </p>
      <p>
        if you want to cast anonymously (you can choose if yes or no, this one
        is optional)
      </p>
      <p>
        if you want to store your writing forever (you need to have this enabled
        to be eligible for the bounty)
      </p>
      <div className="w-48 mx-auto">
        <Button
          buttonText="ready"
          buttonColor="bg-purple-600"
          buttonAction={() => setDisplayWritingGameLanding(true)}
        />
      </div>
    </div>
  );
};

export default BountyPage;
