import React, { useState } from "react";
import Link from "next/link";
import Button from "./Button";
import { usePrivy } from "@privy-io/react-auth";

var options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
};

const WelcomePage = ({ text }) => {
  console.log("the welcome page is:stext ", text);
  const { login } = usePrivy();
  const [copyText, setCopyText] = useState("copy text");
  const [copyLinkText, setCopyLinkText] = useState("copy anky link");
  const [displayMoreInformation, setDisplayMoreInformation] = useState(false);
  const now = new Date();
  const copyToClipboard = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopyText("copied");
    setTimeout(() => {
      setCopyText("copy text");
    }, 1111);
  };
  const copyLinkToClipboard = async () => {
    setDisplayMoreInformation(!displayMoreInformation);
  };

  return (
    <div
      className={` h-full flex flex-col items-start justify-start text-left pt-8`}
    >
      <div
        className={`${
          displayMoreInformation && "border-2 border-red-600 rounded-xl"
        }  h-fit md:w-96 mx-auto text-white p-2`}
      >
        <span
          onClick={() => console.log("the cast wrapper is: ", castWrapper)}
          className="text-sm  w-96 top-1 left-1/2 -translate-x-1/2"
        >
          {new Date(now).toLocaleDateString("en-US", options)}
        </span>
        <div className="my-2 flex ">
          <Button
            buttonAction={copyToClipboard}
            buttonText={copyText}
            buttonColor="bg-green-600 mx-2 w-32 text-center"
          />
          <Button
            buttonAction={copyLinkToClipboard}
            buttonText={copyLinkText}
            buttonColor="bg-purple-600 w-48 text-center"
          />
        </div>
        {text ? (
          text.includes("\n") ? (
            text.split("\n").map((x, i) => (
              <p className="my-2" key={i}>
                {x}
              </p>
            ))
          ) : (
            <p className="my-2">{text}</p>
          )
        ) : null}
      </div>
      {displayMoreInformation && (
        <div className={`text-purple-300 h-fit md:w-96 mx-auto text-white p-2`}>
          <p>welcome to anky</p>
          <p>this is a place for writing.</p>
          <p>
            for getting to know yourself, through the experience of writing.
          </p>
          <p>
            it is simple, yet that simplicity is what ends up being the vehicle.
          </p>
          <p>for you to discover who you are.</p>
          <p>through the power of curiosity.</p>
          <div className="mt-2 w-fit flex space-x-2">
            <Button
              buttonAction={login}
              buttonText="login"
              buttonColor="bg-purple-600"
            />
            <Link href="/feed" passHref>
              <Button buttonText="explore" buttonColor="bg-green-600" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
