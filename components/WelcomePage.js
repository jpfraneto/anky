import React, { useState } from "react";
import Link from "next/link";
import Button from "./Button";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { FaRegCommentAlt, FaRegHeart, FaPencilAlt } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { GiRollingEnergy } from "react-icons/gi";

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

const WelcomePage = ({ text, setDisplayWritingGameLanding }) => {
  console.log("the welcome page is:stext ", text);
  const { login, authenticated, user } = usePrivy();
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
  if (!text)
    return (
      <div className="text-white mt-4">
        <p>please write first before coming into this page.</p>
      </div>
    );

  return (
    <div
      className={` h-full md:w-96 mx-auto flex flex-col items-start justify-start text-left pt-8`}
    >
      <div className={`h-fit md:w-96 mx-auto text-white p-2`}>
        <p>
          this is how your writing would look like on farcaster, if you had
          chosen to cast it anonymously
        </p>
      </div>
      <div className="w-full pl-2 h-fit flex border-bottom border-purple-200 mt-2 relative">
        <Link href={`/u/13850`} passHref>
          <div className="w-16 h-16 pr-2 md:h-20 md:w-20 rounded-full overflow-hidden bg-black relative">
            <Image src="/images/anky.png" fill />
          </div>
        </Link>

        <div className="w-full pb-4 flex flex-col items-start px-2">
          <p className="text-purple-200 text-left">
            <span className="text-white mr-2 ">Anky</span>
            <span>@anky</span>
          </p>
          <div className="text-purple-200 text-left break-words">
            {text ? (
              text?.includes("\n") ? (
                text?.split("\n").map((x, i) => (
                  <p className="mb-4" key={i}>
                    {x}
                  </p>
                ))
              ) : (
                <p className="my-2">{text || ""}</p>
              )
            ) : null}
          </div>
          <div className="px-2 text-xl w-full h-4 flex justify-between text-purple-200 items-center">
            <div className="flex space-x-4 h-full">
              <div
                onClick={() => alert("display the comments!")}
                className={`flex space-x-1 items-center  hover:text-gray-500 cursor-pointer`}
              >
                <FaRegCommentAlt size={18} />
                <span>{5}</span>
              </div>
              <div
                onClick={() => alert("recast!")}
                className={`flex space-x-1 items-center  hover:text-green-500 cursor-pointer`}
              >
                <BsArrowRepeat size={19} />
                <span>{8}</span>
              </div>
              <div
                onClick={() => alert("like!")}
                className={`flex space-x-1 items-center  hover:text-red-500 cursor-pointer`}
              >
                <FaRegHeart />
                <span>{8}</span>
              </div>
              <div
                onClick={() => {
                  alert(
                    "this button is for sending newen, the currency you earn by writing"
                  );
                }}
                className={`flex space-x-1 items-center hover:text-purple-500 cursor-pointer`}
              >
                <GiRollingEnergy />
                <span>{12}</span>
              </div>
            </div>
          </div>
        </div>

        <span
          onClick={() => alert("open cast options")}
          className="absolute top-0 right-2 text-purple-200 "
        >
          · · ·
        </span>
      </div>
      <div className="w-fit mt-4">
        <Button
          buttonText="what is this?"
          buttonColor={`${
            displayMoreInformation
              ? "bg-purple-600 shadow-yellow-600 shadow-lg"
              : "bg-purple-400"
          }`}
          buttonAction={() =>
            setDisplayMoreInformation(!displayMoreInformation)
          }
        />
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
            {authenticated ? (
              <Button
                buttonAction={() => {
                  setDisplayWritingGameLanding("write");
                }}
                buttonText="write"
                buttonColor="bg-purple-600"
              />
            ) : (
              <Button
                buttonAction={login}
                buttonText="login"
                buttonColor="bg-purple-600"
              />
            )}

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
