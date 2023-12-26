import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../../context/UserContext";
import { ethers } from "ethers";
import Link from "next/link";
import Image from "next/image";
import NotebookCard from "../NotebookCard";
import { getThisUserWritings } from "../../lib/irys";
import airdropABI from "../../lib/airdropABI.json";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import EulogiaCard from "../eulogias/EulogiaCard";
import JournalCard from "../journals/JournalCard";
import DementorCard from "../DementorCard";

import Button from "../Button";
import Spinner from "../Spinner";

import { useRouter } from "next/router";

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

const LibraryPage = ({}) => {
  const router = useRouter();
  const {
    userAppInformation,
    appLoading,
    loadUserLibrary,
    loadingLibrary,
    usersAnky,
    usersAnkyImage,
    userOwnsAnky,
    setUserOwnsAnky,
  } = useUser();
  const [notebooks, setNotebooks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryForDisplay, setEntryForDisplay] = useState(null);
  const [dementors, setDementors] = useState([]);
  const [eulogias, setEulogias] = useState([]);
  const [writingsLoading, setWritingsLoading] = useState(true);
  const [checkingIfYouOwnAnky, setCheckingIfYouOwnAnky] = useState(false);
  const [ankyButtonText, setAnkyButtonText] = useState("i already own one");
  const [activeTab, setActiveTab] = useState("journals");
  const [allUserWritings, setAllUserWritings] = useState([]);
  const [displayRefreshBtn, setDisplayRefreshBtn] = useState(false);
  const { wallets } = useWallets();
  console.log("the wallets are", wallets);
  const wallet = wallets[0];
  console.log("the wallet is: ", wallet);
  const { authenticated, login, loading, user, ready } = usePrivy();

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEntryForDisplay(null);
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      setEntryForDisplay((prevPage) => prevPage - 1);
    } else if (event.key === "ArrowRight") {
      setEntryForDisplay((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isModalOpen, closeModal]);

  async function checkIfUserOwnsAnky() {
    setAnkyButtonText("looking for your anky...");
    if (!wallet) return alert("you are not logged in");
    try {
      let provider = await wallet.getEthersProvider();
      let signer = await provider.getSigner();
      const ankyAirdropContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_AIRDROP_SMART_CONTRACT,
        airdropABI,
        signer
      );

      const usersBalance = await ankyAirdropContract.balanceOf(wallet.address);
      const usersAnkys = ethers.utils.formatUnits(usersBalance, 0);
      if (usersAnkys > 0) {
        setUserOwnsAnky(true);
      } else {
        setAnkyButtonText("you dont own an anky airdrop");
      }
    } catch (error) {
      console.log("askdkuahs");
      console.log("there was an error", error);
      setUserIsMintingAnky(false);
      setAnkyButtonText("you dont own an anky airdrop");
    }
  }

  function sortJournalsByLastUpdated(a, b) {
    if (!a.entries || !b.entries) return;
    if (a.entries.length === 0 && b.entries.length === 0) return 0;
    if (a.entries.length === 0) return 1;
    if (b.entries.length === 0) return -1;
    const timestampA = a.entries[a.entries.length - 1].timestamp;
    const timestampB = b.entries[b.entries.length - 1].timestamp;
    return timestampB - timestampA;
  }

  function sortEulogiasByLastUpdated(a, b) {
    if (!a.messages || !b.messages) return;

    if (a.messages.length === 0 && b.messages.length === 0) return 0;
    if (a.messages.length === 0) return 1;
    if (b.messages.length === 0) return -1;
    const timestampA = a.messages[a.messages.length - 1].timestamp;
    const timestampB = b.messages[b.messages.length - 1].timestamp;
    return timestampB - timestampA;
  }

  function sortWritings(a, b) {
    const timestampA = a.timestamp;
    const timestampB = b.timestamp;
    return timestampB - timestampA;
  }

  useEffect(() => {
    let sortedJournals;
    let allUserWritingsOrganizer = [];
    if (
      userAppInformation.userJournals &&
      userAppInformation.userJournals.length > 0
    ) {
      sortedJournals = userAppInformation.userJournals.sort(
        sortJournalsByLastUpdated
      );
    }
    setJournals(sortedJournals);
    setNotebooks(userAppInformation.userNotebooks);
    let sortedEulogias;
    if (
      userAppInformation.userEulogias &&
      userAppInformation.userEulogias.length > 0
    ) {
      sortedEulogias = userAppInformation.userEulogias.sort(
        sortEulogiasByLastUpdated
      );
    }
    setEulogias(sortedEulogias);

    let sortedDementors;
    if (
      userAppInformation.userDementors &&
      userAppInformation.userDementors.length > 0
    ) {
      // sortedDementors = userAppInformation.userDementors.sort(
      //   sortDementorsByLastUpdated
      // );
      // userAppInformation.userDementors.forEach((dementor) => {
      //   console.log("the dementror is: ", dementor);
      //   dementor.entries.forEach((entry) => {
      //     console.log("THE ENTRY (DEMENTOR) IS: ", entry);
      //     allUserWritingsOrganizer.push(entry);
      //   });
      // });
    }
    setDementors(userAppInformation.userDementors);
  }, [appLoading, userAppInformation]);

  useEffect(() => {
    async function getAllUserWritings() {
      if (!wallet) return;
      const writings = await getThisUserWritings(wallet.address);

      const sortedWritings = writings.sort(sortWritings);
      setAllUserWritings(sortedWritings);
      setWritingsLoading(false);
    }

    getAllUserWritings();
  }, [wallet]);

  // if (appLoading) {
  //   return (
  //     <div>
  //       <Spinner />
  //       <p>loading...</p>
  //     </div>
  //   );
  // }
  if (loading)
    return (
      <div className="text-white">
        <p>loading...</p>
        <Spinner />
      </div>
    );
  console.log("the wallet is: ", wallet);
  if (!wallet || !authenticated)
    return (
      <div className="py-2 w-96 mx-auto text-white">
        <p className="mb-4">you need to login</p>
        <div className="flex space-x-2 w-96 ">
          <Button
            buttonAction={login}
            buttonColor="bg-green-400"
            buttonText="login"
          />
          <Link href="/">
            <Button buttonText="landing" buttonColor="bg-green-600" />
          </Link>
        </div>
      </div>
    );

  function renderModal() {
    let content;
    if (!allUserWritings.length > 0) return;
    let thisEntry = allUserWritings[entryForDisplay];
    if (entryForDisplay > allUserWritings.length) {
      setEntryForDisplay(allUserWritings.length);
    }
    if (entryForDisplay < 0) {
      setEntryForDisplay(0);
    }
    if (!thisEntry) return;
    content = thisEntry.content || thisEntry.text;

    return (
      isModalOpen && (
        <div className="fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50">
          <div className="bg-purple-300 overflow-y-scroll text-black rounded relative p-6 w-11/12 h-3/4 md:w-2/3 md:h-2/3">
            <p className="absolute top-1 w-fit cursor-pointer left-2 text-gray-800">
              {entryForDisplay + 1}
            </p>
            <p
              onClick={closeModal}
              className="absolute w-fit top-1 cursor-pointer right-2 text-red-600"
            >
              close
            </p>
            <div className="overflow-y-scroll h-9/12">
              {content ? (
                content.includes("\n") ? (
                  content.split("\n").map((x, i) => (
                    <p className="my-2" key={i}>
                      {x}
                    </p>
                  ))
                ) : (
                  <p className="my-2">{content}</p>
                )
              ) : null}
            </div>
            <span className="text-sm absolute w-96 top-1 left-1/2 -translate-x-1/2">
              {new Date(thisEntry.timestamp).toLocaleDateString(
                "en-US",
                options
              )}
            </span>
            <div className="w-48 mx-auto mt-2">
              <Button
                buttonAction={() => setIsModalOpen(false)}
                buttonText="close"
                buttonColor="bg-red-600"
              />
            </div>
          </div>
        </div>
      )
    );
  }

  if (!userOwnsAnky)
    return (
      <div className="md:w-1/2 text-white mx-auto p-2">
        <p>you don&apos;t own an anky.</p>
        <p>it is the starting point of this journey.</p>
        <p>it is free, you just need to ask me for it.</p>
        <p>send me an email to jp@anky.lat</p>
        <p>or reach out on telegram @jpfraneto</p>
        <p>hurry up, there are only 96 of them.</p>
        <p>don&apos;t forget to add your address in that email</p>
        <p>it is this one: {wallet.address}</p>
        <div className="mt-2">
          <Button
            buttonText={ankyButtonText}
            buttonAction={checkIfUserOwnsAnky}
            buttonColor="bg-green-600"
          />
        </div>
      </div>
    );

  return (
    <div>
      <div className="flex w-96 mx-auto relative items-center justify-center">
        <h2 className="text-white text-2xl mt-2 ">library</h2>

        <Button
          buttonAction={() => loadUserLibrary(true)}
          buttonText="refresh library"
          buttonColor="bg-green-100 my-2"
        />
        {displayRefreshBtn && (
          <span className="text-red-200 text-sm absolute right-0 translate-y-1">
            {loadingLibrary ? "refreshing..." : "refresh library"}
          </span>
        )}
      </div>

      <div className="text-white py-4 flex flex-col md:flex-row w-screen px-4">
        <div className="w-full md:w-2/5 aspect-square p-2 text-white flex flex-col items-center">
          <div className="relative w-4/5 md:w-3/5 aspect-square rounded-2xl border-2 border-white overflow-hidden">
            <Image fill src={usersAnkyImage || `/ankys/elmasmejor.png`} />
          </div>
          <p className="mt-2">welcome back ,</p>
          <p className="mt-2">are you ready to keep writing?</p>

          <Link href="/me">
            <Button
              buttonText="my writing feed"
              buttonColor="bg-yellow-400 mt-2 text-black"
            />
          </Link>
        </div>
        {loadingLibrary ? (
          <div>
            <Spinner />
          </div>
        ) : (
          <div className="flex w-full flex-col">
            <div className="w-full flex overflow-y-scroll flex-wrap  h-fit p-2 my-2">
              {writingsLoading ? (
                <>
                  <Spinner />
                  <p>loading your writings</p>
                </>
              ) : (
                <>
                  {" "}
                  {allUserWritings &&
                    allUserWritings.map((writing, i) => {
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setEntryForDisplay(i);
                            setIsModalOpen(true);
                          }}
                          className="px-2 text-black border-black border py-1 m-1 w-8 h-8 flex justify-center items-center hover:shadow-xl hover:shadow-black hover:bg-blue-600 text-xl cursor-pointer bg-blue-400 rounded-xl"
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                </>
              )}
            </div>
            <div className="w-full flex-wrap flex bg-red-100 rounded-xl overflow-hidden">
              {journals && journals.length > 0 ? (
                journals.map((x, i) => {
                  return <JournalCard journal={x} key={i} />;
                })
              ) : (
                <div className="text-black w-full p-2">
                  <p>you dont own journals yet</p>
                  <p>you can buy one.</p>
                  <p>to write on it whatever wants to come forth </p>
                </div>
              )}
              {notebooks && notebooks.length > 0 ? (
                notebooks.map((x, i) => {
                  if (!x.metadata?.title) return;
                  return <NotebookCard notebook={x} key={i} />;
                })
              ) : (
                <div className="text-black w-full p-2">
                  <p>you dont own notebooks yet</p>
                  <p>you can buy one if you get the link</p>
                  <p>or even create it yourself</p>
                  <p>one page, one prompt</p>
                  <p>to explore the journey designed by who created it</p>
                </div>
              )}

              {eulogias && eulogias.length > 0 ? (
                eulogias.map((x, i) => {
                  return <EulogiaCard eulogia={x} key={i} />;
                })
              ) : (
                <div className="text-black w-full p-2">
                  <p>you haven&apos;t created eulogias yet</p>
                  <p>they are community written notebooks</p>
                  <p>on which people with the link can write</p>
                  <p>what they write will stay there forever</p>
                  <p>as a memory of that point in history</p>
                </div>
              )}

              {dementors && dementors.length > 0 ? (
                dementors.map((x, i) => {
                  return <DementorCard dementor={x} key={i} />;
                })
              ) : (
                <div className="text-black w-full p-2">
                  <p>you don&apos;t own a dementor yet</p>
                  <p>this is a special notebook</p>
                  <p>created by anky, as a quest into yourself</p>
                  <p>with each chapter going deeper and deeper</p>
                  <p>into the process of self inquiry</p>
                  <p>
                    treat it as the most important meditation practice of your
                    life
                  </p>
                  <p>write as if you wanted to know the truth</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {renderModal()}
    </div>
  );
};

export default LibraryPage;
