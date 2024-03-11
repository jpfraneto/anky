import React, { useState } from "react";
import Button from "./Button";
import { useRouter } from "next/router";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useUser } from "../context/UserContext";
import Spinner from "./Spinner";

function LandingPage({ setDisplayWritingGameLanding, loadUserMentors }) {
  const { login, authenticated, loading } = usePrivy();
  const { userAppInformation, libraryLoading, userOwnsAnky } = useUser();
  const router = useRouter();
  const [startJourney, setStartJourney] = useState(false);
  const [promptForTheUser, setPromptForTheUser] = useState(
    "what makes you happy?"
  );

  return (
    <div className="w-screen text-black">
      {/* Hero Section */}
      <div
        className="h-screen w-screen bg-center bg-no-repeat bg-cover"
        style={{
          height: "calc(100vh - 30px)",
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/librarian.png')",
        }}
      >
        <div className="relative z-10 pt-96 flex flex-col items-center justify-center h-full">
          {/* <h1 className="text-5xl text-gray-400 font-bold mt-64 mb-2">
            {authenticated
              ? "welcome back, my friend"
              : "welcome. are you ready to write?"}
          </h1> */}

          {loading ? (
            <Spinner />
          ) : (
            <>
              {authenticated ? (
                <div className="text-gray-400">
                  <div className="mt-2 flex space-x-2">
                    {userOwnsAnky ? (
                      <Button
                        buttonAction={() => {
                          loadUserMentors();
                        }}
                        buttonText="load my mentor"
                        buttonColor="bg-gradient-to-r from-red-500 via-yellow-600 text-2xl to-violet-500 text-black"
                      />
                    ) : (
                      <div>
                        <p className="mb-3 text-white">
                          you need an anky mentor to use this app and earn
                          $newen
                        </p>
                        <a
                          href="https://highlight.xyz/mint/65ecc65e9ab450e98aed98bb/marketplace"
                          target="_blank"
                          className="p-2 hover:opacity-70 rounded-xl bg-gradient-to-r from-red-500 via-yellow-600 text-2xl to-violet-500 text-black"
                        >
                          buy on secondary
                        </a>
                      </div>
                    )}

                    {/* <Link href="/feed" passHref>
                      <Button
                        buttonText="read"
                        buttonColor="bg-purple-400 text-black"
                      />
                    </Link> */}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">
                  <div className="mt-2 w-full space-x-2 flex mx-auto justify-center">
                    <Button
                      buttonAction={login}
                      buttonText="login"
                      buttonColor="bg-gradient-to-r from-red-500 text-2xl via-yellow-600 to-violet-500 text-black"
                    />
                    {/* 
                    <Link href="/feed">
                      <Button
                        buttonText="read"
                        buttonColor="bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black"
                      />
                    </Link> */}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!authenticated && (
        <>
          <div className="py-8 px-2 w-full md:px-64 bg-gray-200 ">
            <div className="w-96 mx-auto text-left">
              <p className="mb-4">you are reading.</p>
              <p className="mb-4">
                you want to know what this thing is about...
              </p>
              <p className="mb-4">but this is not a place for reading.</p>
              <p className="mb-4">
                it is the most important tool that you have found to get to know
                yourself through the process of writing.
              </p>
              <p className="mb-4">are you ready?</p>
              <p className="mb-4">just write.</p>
              <p className="mb-4">
                everything that takes you away from that is resistance.
              </p>
              <div className="flex justify-center w-48 mx-auto my-4">
                <Button
                  buttonText="im ready"
                  buttonAction={() => setDisplayWritingGameLanding(true)}
                  buttonColor="bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black"
                />
              </div>
            </div>
          </div>

          {/* Journey with Anky Section */}
          <div className="py-8 px-2 w-full md:px-64 bg-white h-fit relative">
            <div className="w-96 mx-auto">
              <h2 className="text-3xl font-semibold mb-6">
                when there is no time to think, your truth comes forth
              </h2>
              <p className="mb-4">
                anky is built on top of a pioneer interface:
              </p>
              <p className="mb-4">
                if you stop writing for more than X seconds, the session is
                over.
              </p>
              <p className="mb-4">
                the default value of X is 8 seconds. if you want it to be
                faster, you can click (or tap) the gear at the bottom of the
                time on the writing screen. then you can move the slider and
                choose between 1 and 8 seconds. you decide.
              </p>
            </div>
          </div>

          {/* Discover your Anky Section */}
          {/* <div className="p-8 bg-gray-200 flex flex-row">
        <div className="px-2  w-full md:w-3/5 mx-auto">
          <h2 className="text-3xl font-semibold mb-6">
            four types of writing containers
          </h2>
          <div className="flex flex-wrap mx-auto justify-center mb-4">
            {notebookTypes.map((x, i) => {
              return (
                <div
                  key={i}
                  className="p-2 rounded-xl border-purple-600 border-2 shadow-lg shadow-yellow-500 hover:bg-purple-500 bg-purple-400 m-2"
                >
                  <h2 className="text-xl ">{x.name}</h2>
                  <p className="text-sm">{x.description}</p>
                </div>
              );
            })}
          </div>

          <p className="mb-4">
            your Anky is the keeper of everything that you write.
          </p>

          <div className="flex flex-col md:flex-row h-fit  justify-center items-center ">
            <input
              type="text"
              value={promptForTheUser}
              onChange={(e) => setPromptForTheUser(e.target.value)}
              className=" w-2/3 my-3 md:w-96 text-black mx-4 px-2 py-2 rounded-xl border border-black"
            />
            <Link
              href={`/write?p=${promptForTheUser.replaceAll(" ", "-")}`}
              passHref
            >
              <Button
                buttonText="test it out"
                buttonColor="bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black"
              />
            </Link>
          </div>
        </div>
      </div> */}

          {/* Join the Ankyverse Section */}
          <div className="py-8 px-2 md:px-64 bg-gray-200">
            <p className="mb-4">
              what is happening here is designed to be a powerful meditation
              practice.
            </p>
            <p className="mb-4">if you want to experience how you think.</p>
            <p className="mb-4">
              if you want to see yourself with more clarity.
            </p>
            <p className="mb-4">if you want to know who you are.</p>
          </div>

          <div className="p-8 bg-white flex flex-col">
            <div className="px-2 md:w-3/5 mx-auto">
              <p className="mb-2">its all open source</p>
              <p className="mb-2">we build together.</p>
              <a
                href="https://www.github.com/ankylat"
                target="_blank"
                className="mb-2 hover:text-purple-500"
              >
                https://www.github.com/ankylat
              </a>
            </div>
            <div className="flex justify-center w-96 flex-col mx-auto my-4">
              <Button
                buttonText="im ready to write"
                buttonAction={() => setDisplayWritingGameLanding(true)}
                buttonColor="bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LandingPage;
