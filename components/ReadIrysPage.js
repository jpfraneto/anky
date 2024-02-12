import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { decodeFromAnkyverseLanguage } from "../lib/ankyverse";
import { getOneWriting } from "../lib/irys";
import SimpleCast from "./SimpleCast";
import Link from "next/link";
import Button from "./Button";
import { Inter } from "next/font/google";
import IndividualDecodedCastCard from "./farcaster/IndividualDecodedCastCard";
import Image from "next/image";
import { useUser } from "../context/UserContext";
import { usePrivy } from "@privy-io/react-auth";
import Spinner from "./Spinner";

const inter = Inter({ subsets: ["cyrillic"], weight: ["400"] });

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

const ReadIrysPage = ({ setShow }) => {
  const router = useRouter();
  const { authenticated, login } = usePrivy();
  const [thisWriting, setThisWriting] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [thisFullCast, setThisFullCast] = useState(null);
  const [castWrapper, setCastWrapper] = useState({});
  const [thisCast, setThisCast] = useState(null);
  const [errorWrapper, setErrorWrapper] = useState(false);
  const [copyText, setCopyText] = useState("copy text");
  const [copyLinkText, setCopyLinkText] = useState("copy anky link");
  const [showCopyTextButton, setShowCopyTextButton] = useState(true);
  const [showCopyLinkButton, setShowCopyLinkButton] = useState(true);
  const { farcasterUser, userDatabaseInformation, allUserWritings } = useUser();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional: adds a smooth scrolling effect
    });
  };

  useEffect(() => {
    async function searchThisText() {
      try {
        const thisIrysIndex = allUserWritings.findIndex((x) => {
          return x.cid == router.query.cid;
        });
        if (thisIrysIndex == -1 || !authenticated || !allUserWritings) {
          const writingFromIrys = await getOneWriting(router.query.cid);
          setThisWriting({ text: writingFromIrys.text, timestamp: new Date() });
          setLoadingPage(false);
        } else {
          const writerPlaceholder = allUserWritings[thisIrysIndex];
          if (writerPlaceholder) {
            setThisWriting(writerPlaceholder);
            console.log("in hereee", writerPlaceholder);
            setThisCast((x) => {
              return { ...x, text: writerPlaceholder, timestamp: new Date() };
            });
            setLoadingPage(false);
          }
        }
      } catch (error) {
        setErrorWrapper(true);
      }
    }
    async function getCastByCid() {
      try {
        if (!router?.query?.cid || !authenticated) return;
        console.log("inside the get cast by cid function", router.query.cid);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/farcaster/get-cast-by-cid/${router.query.cid}`
        );
        console.log("the response here is: ", response);
        if (response?.data?.cast) {
          console.log(
            "inside the get cast by cid, the cast is: ",
            response.data
          );
          setThisFullCast(response.data.cast);
        } else {
          setThisFullCast(null);
        }
      } catch (error) {
        console.log(
          "there was an error inside the get cast by cid function",
          error
        );
      }
    }
    getCastByCid();
    searchThisText();
  }, [allUserWritings, router.query]);

  async function handleDisplayComments() {
    setDisplayComments((x) => !x);
  }
  async function handleRecast(e) {
    e.currentTarget.blur();
    const prev = hasUserRecasted;
    setHasUserRecasted(!prev);
    const response = await axios.post(`${apiRoute}/farcaster/api/reaction`, {
      reactionType: "recast",
      hash: cast.hash,
      signer_uuid: farcasterUser.signer_uuid,
    });
    if (response.status !== 200) {
      alert("there was an error recasting");
      setHasUserRecasted(!prev);
    }
  }
  async function handleLike(e) {
    console.log("THE EEEEE IS: ", e);
    e.currentTarget.blur();
    const prev = hasUserLiked;
    setHasUserLiked(!prev);
    const response = await axios.post(`${apiRoute}/farcaster/api/reaction`, {
      reactionType: "like",
      hash: cast.hash,
      signer_uuid: farcasterUser.signer_uuid,
    });
    if (response.status !== 200) {
      alert("there was an error recasting");
      setHasUserLiked(!prev);
    }
  }
  async function sendManaToCastCreator() {
    try {
      if (manaForCongratulation > userDatabaseInformation.manaBalance)
        return alert("You dont have enough $NEWEN balance for that.");
      alert(`this will send ${manaForCongratulation} to the user`);
      console.log("the total", totalNewenEarned, manaForCongratulation);
      setTotalNewenEarned(
        Number(totalNewenEarned) + Number(manaForCongratulation)
      );
      setDisplaySendNewen(false);
    } catch (error) {
      console.log("there was an error sending the mana to the user", error);
    }
  }

  const copyToClipboard = async () => {
    if (!thisWriting) return;
    await navigator.clipboard.writeText(thisWriting.text);
    setCopyText("text copied"); // Change here to reflect the action
    setShowCopyLinkButton(false); // Hide the link copy button
  };

  const copyLinkToClipboard = async () => {
    if (!thisWriting) return;
    await navigator.clipboard.writeText(
      `https://www.anky.lat/i/${router.query.cid}`
    );
    setCopyLinkText("link to anky copied"); // Change here to reflect the action
    setShowCopyTextButton(false); // Hide the text copy button
  };

  const UserPfP = () => {
    if (!thisFullCast || !thisFullCast.author.pfp_url) return;
    return <Image src={thisFullCast.author.pfp_url || ""} fill />;
  };

  if (errorWrapper) {
    return (
      <div className="mt-4 text-white">
        <p>there was an error</p>
        <Link href="/feed">feed</Link>
      </div>
    );
  }

  if (loadingPage)
    return (
      <div className="mt-4 text-white">
        <Spinner />
        <p>loading...</p>
        <div className="mx-auto w-24">
          <Button
            buttonAction={() => router.reload()}
            buttonColor="bg-green-600"
            buttonText="reload"
          />
        </div>
      </div>
    );

  if (!thisWriting)
    return (
      <div className="mt-8 text-white">
        <p>writing not found</p>
        {!authenticated && (
          <div className="text-white w-64 mx-auto">
            <p className="mb-2">perhaps you need to login</p>

            <Button
              buttonAction={login}
              buttonText="login"
              buttonColor="bg-green-600"
            />
          </div>
        )}
      </div>
    );

  return (
    <div
      className={`${inter.className} h-full px-3 flex flex-col items-start justify-start text-left pt-8`}
    >
      {thisFullCast ? (
        <div className="text-white w-96 mx-auto">
          <SimpleCast cast={thisFullCast} pfp={UserPfP} />
        </div>
      ) : (
        <div className="overflow-y-scroll h-full md:w-96 mx-auto text-white ">
          <span className="text-sm  w-96 top-1 left-1/2 -translate-x-1/2">
            {new Date(thisWriting.timestamp).toLocaleDateString(
              "en-US",
              options
            )}
          </span>
          <div className="my-2 flex ">
            {showCopyTextButton && (
              <Button
                buttonAction={copyToClipboard}
                buttonText={copyText}
                buttonColor="bg-green-600 mx-2 w-fit text-center"
              />
            )}
            {showCopyLinkButton && (
              <Button
                buttonAction={copyLinkToClipboard}
                buttonText={copyLinkText}
                buttonColor="bg-purple-600 w-fit text-center"
              />
            )}
          </div>

          {thisWriting ? (
            thisWriting.text.includes("\n") ? (
              thisWriting.text.split("\n").map((x, i) => (
                <p className="my-2" key={i}>
                  {x}
                </p>
              ))
            ) : (
              <p className="my-2">{thisWriting.text}</p>
            )
          ) : null}
          {/* <SimpleCast cast={thisCast} pfp={UserPfP} /> */}
        </div>
      )}
    </div>
  );
};

export default ReadIrysPage;
