import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import Button from "../Button";
import { getContainerInfoFromIrys } from "../../lib/irys.js";
import { WebIrys } from "@irys/sdk";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import WritingGameComponent from "../WritingGameComponent";
import Spinner from "../Spinner";
import { useUser } from "../../context/UserContext";
import { setUserData } from "../../lib/idbHelper";

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

const JournalById = ({ setLifeBarLength, lifeBarLength }) => {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { userAppInformation } = useUser();
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [text, setText] = useState("");
  const [noJournals, setNoJournals] = useState(false);
  const [uploadingWriting, setUploadingWriting] = useState(false);
  const [journalPrompt, setJournalPrompt] = useState(
    "write as if the world was going to end"
  );
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [entryForDisplay, setEntryForDisplay] = useState(null);
  const [chosenPrompt, setChosenPrompt] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [writingForDisplay, setWritingForDisplay] = useState(null);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [whoIsWriting, setWhoIsWriting] = useState("");
  const { wallets } = useWallets();
  const { setUserAppInformation } = useUser();

  const thisWallet = wallets[0];

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

  useEffect(() => {
    async function fetchJournal() {
      try {
        if (!thisWallet) return;
        const userJournals = userAppInformation.userJournals;
        console.log("the user app information is: ", userAppInformation);
        console.log(router.query);
        console.log("the user journals are: ", userJournals);

        if (userJournals?.length > 0) {
          const thisJournal = userJournals.filter(
            (x) => x.journalId == router.query.id
          );
          console.log("this journal is: ", thisJournal);
          if (thisJournal.length > 0) {
            console.log("sajl", thisJournal);
            const fetchedJournal = thisJournal[0];
            console.log("the fetched journal is: 0", fetchedJournal);

            let thisContainerContract =
              process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS;

            const writtenPages = await getContainerInfoFromIrys(
              "journal",
              router.query.id,
              thisWallet.address,
              thisContainerContract
            );

            fetchedJournal.entries = writtenPages;
            fetchedJournal.updatedFromArweave = true;
            setJournal(fetchedJournal);
            setLoading(false);
          } else {
            setNoJournals(true);
            throw Error("No journal found");
          }
        } else {
          setNoJournals(true);
          throw Error("No journal found");
        }
      } catch (error) {
        console.log("there was an error");
        console.error(error);
      }
    }

    fetchJournal();
  }, [thisWallet]);

  const writeOnJournal = async () => {
    const pagesWritten = journal.entries.length;
    console.log("the pages written are:", pagesWritten);
    if (!journalPrompt && journalPrompt.length == 0)
      return alert("add a prompt!");
    if (pagesWritten == 96) {
      alert("this journal aint having more space my friend");
      return;
    }
    const writingGameParameters = {
      notebookType: "journal",
      targetTime: 480,
      backgroundImage: null, // You can modify this if you have an image.
      prompt: journalPrompt, // You need to fetch and set the correct prompt.
      musicUrl: "https://www.youtube.com/watch?v=HcKBDY64UN8",
      onFinish: updateJournalWithPage,
    };

    setWritingGameProps(writingGameParameters);
    setLoadWritingGame(true);
  };

  const updateJournalWithPage = async (finishText) => {
    try {
      console.log("inside the update journal with page function", finishText);
      const getWebIrys = async () => {
        // Ethers5 provider
        // await window.ethereum.enable();
        if (!thisWallet) return;
        // const provider = new providers.Web3Provider(window.ethereum);
        console.log("thiiiiis wallet is: ", thisWallet);
        const provider = await thisWallet.getEthersProvider();

        const url = "https://node2.irys.xyz";
        const token = "ethereum";
        const rpcURL = "https://rpc-mumbai.maticvigil.com"; // Optional parameter

        // Create a wallet object
        const wallet = { rpcUrl: rpcURL, name: "ethersv5", provider: provider };
        // Use the wallet object
        const webIrys = new WebIrys({ url, token, wallet });
        await webIrys.ready();
        return webIrys;
      };
      const webIrys = await getWebIrys();
      let previousPageCid = 0;
      console.log("JHSALCHSAKJHCAS", journal.entries);
      if (journal.entries.length > 0) {
        previousPageCid = journal.entries[journal.entries.length - 1].cid;
      }
      const tags = [
        { name: "Content-Type", value: "text/plain" },
        { name: "application-id", value: "Anky Dementors" },
        { name: "container-type", value: "journal" },
        { name: "container-id", value: router.query.id.toString() },
        { name: "page-number", value: journal.entries.length.toString() },
        {
          name: "smart-contract-address",
          value: process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
        },
        {
          name: "previous-page",
          value: previousPageCid.toString(),
        },
      ];
      console.log("right after the tags", tags);
      try {
        const receipt = await webIrys.upload(finishText, { tags });
        console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
        let newJournalEntry;
        setUserAppInformation((x) => {
          // Find the specific journal index by its id
          const journalIndex = x.userJournals.findIndex(
            (j) => j.journalId == router.query.id
          );

          newJournalEntry = {
            text: finishText,
            timestamp: new Date().getTime(),
            pageNumber: journal.entries.length,
            previousPageCid: previousPageCid,
            cid: receipt.id,
          };

          // If the journal is found
          if (journalIndex !== -1) {
            const updatedJournal = {
              ...x.userJournals[journalIndex],
              entries: [
                ...x.userJournals[journalIndex].entries,
                newJournalEntry,
              ],
            };

            const updatedUserJournals = [
              ...x.userJournals.slice(0, journalIndex),
              updatedJournal,
              ...x.userJournals.slice(journalIndex + 1),
            ];

            setUserData("userJournals", updatedUserJournals);

            return {
              ...x,
              userJournals: updatedUserJournals,
            };
          }

          // Return the original state if the journal isn't found (for safety)
          return x;
        });

        setJournal((x) => {
          return {
            ...x,
            entries: [...journal.entries, newJournalEntry],
          };
        });
        setLifeBarLength(0);
        console.log("the entry for display is: ", newJournalEntry.pageNumber);
        setEntryForDisplay(newJournalEntry.pageNumber);
        setLoadWritingGame(false);
        setIsModalOpen(true);

        console.log("after the setloadwrtinggame put into false");
      } catch (e) {
        console.log("Error uploading data ", e);
      }
    } catch (error) {
      setLoadWritingGame(false);
      setThereWasAnError(true);
      console.error("Failed to write to notebook:", error);
    }
  };

  function renderModal() {
    let content;
    if (!journal.entries) return;
    let thisEntry = journal.entries[entryForDisplay];
    if (entryForDisplay > journal.entries.length) {
      setEntryForDisplay(journal.entries.length);
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

  if (loading)
    return (
      <div>
        <Spinner />
        <p className="text-white">loading...</p>
      </div>
    );

  if (noJournals) {
    return (
      <div className="pt-8">
        <p className="text-white mb-3">
          this journal doesn&apos;t belong to you
        </p>
        <Link href="/library" passHref>
          <Button buttonText="my library" buttonColor="bg-green-600" />
        </Link>
      </div>
    );
  }

  if (loadWritingGame)
    return (
      <WritingGameComponent
        {...writingGameProps}
        text={text}
        setLifeBarLength={setLifeBarLength}
        lifeBarLength={lifeBarLength}
        setText={setText}
        time={time}
        setTime={setTime}
        cancel={() => setLoadWritingGame(false)}
      />
    );

  if (thereWasAnError) {
    <div className="text-white">
      <p>there was an error, but here is your writing:</p>
      <div className="p-2 bg-green-100">
        {text.includes("\n") ? (
          text.split("\n").map((x, i) => {
            return (
              <p key={i} className="my-2">
                {x}
              </p>
            );
          })
        ) : (
          <p key={i} className="my-2">
            {text}
          </p>
        )}
      </div>
      <Button
        buttonText="upload again"
        buttonColor="bg-green-600"
        buttonAction={() => updateJournalWithPage(text)}
      />
    </div>;
  }
  return (
    <div className="text-white pt-4">
      <h2 className="text-2xl mb-2 underline">{journal.title}</h2>
      <input
        type="text"
        value={journalPrompt}
        onChange={(e) => setJournalPrompt(e.target.value)}
        className="mb-2 text-xl text-black md:w-7/12 flex justify-center mx-auto px-2 py-1 rounded-xl"
      />
      {journal.entries && journal.entries.length !== 0 ? (
        <div className="p-4 flex rounded-xl bg-yellow-500 md:w-9/12 mx-auto flex-wrap">
          {journal.entries.map((x, i) => {
            return (
              <div
                key={i}
                onClick={() => {
                  setEntryForDisplay(i);
                  setIsModalOpen(true);
                }}
                className="px-2  py-1 m-1 w-8 h-8 flex justify-center items-center hover:bg-blue-600 cursor-pointer bg-blue-400 rounded-xl"
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <p>you haven&apos;t written here yet</p>
        </div>
      )}
      {journal.pagesLeft === 0 ? (
        <p className="text-4xl p-4 bg-red-400 rounded-xl hover:bg-red-600 hover:cursor-not-allowed my-4">
          you wrote it all
        </p>
      ) : (
        <div>
          <button
            onClick={writeOnJournal}
            className="text-4xl p-4 bg-red-400 rounded-xl hover:bg-red-600 my-4"
          >
            write journal
          </button>
        </div>
      )}
      <div className="flex justify-center w-96 mx-auto">
        <div className="flex space-x-2 justify-center">
          <Button
            buttonText="buy new journal"
            buttonColor="bg-purple-600"
            buttonAction={() => router.push("/journal/new")}
          />
          <Button
            buttonText="library"
            buttonColor="bg-green-600"
            buttonAction={() => router.push("/library")}
          />
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default JournalById;
