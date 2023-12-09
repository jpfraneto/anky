import React, { useState, useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import AnkyEulogiasAbi from "../../lib/eulogiaABI.json";
import { WebIrys } from "@irys/sdk";
import { getContainerInfoFromIrys } from "../../lib/irys";

import Link from "next/link";
import { useRouter } from "next/router";
import { processFetchedEulogia } from "../../lib/notebooks.js";
import { ethers } from "ethers";
import { useUser } from "../../context/UserContext";
import Button from "../Button";
import Image from "next/image";
import { setUserData } from "../../lib/idbHelper";
import WritingGameComponent from "../WritingGameComponent";
import Spinner from "../Spinner";

const IndividualEulogiaDisplayPage = ({ setLifeBarLength, lifeBarLength }) => {
  const { login, authenticated, loading, getAccessToken } = usePrivy();
  const router = useRouter();
  const [eulogia, setEulogia] = useState(null);
  const [eulogiaLoading, setEulogiaLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [displayModalMessage, setDisplayModalMessage] = useState(null);
  const [preloadedBackground, setPreloadedBackground] = useState(null);
  const [whoIsWriting, setWhoIsWriting] = useState("");
  const [mintingEulogia, setMintingEulogia] = useState(false);
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [userEulogiaBalance, setUserEulogiaBalance] = useState(null);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [text, setText] = useState("");
  const [provider, setProvider] = useState(null);
  const [pages, setPages] = useState([]);
  const [userHasWritten, setUserHasWritten] = useState(false);
  const { wallets } = useWallets();
  const thisWallet = wallets[0];
  const { setUserAppInformation, userAppInformation } = useUser();

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
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
    async function fetchEulogia() {
      try {
        if (eulogia) return;
        if (!router.query) return;

        if (!authenticated && !loading) {
          const serverResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/eulogia/${router.query.id}`
          );
          const data = await serverResponse.json();
          console.log("the server response is: ", data);
          if (!data.success) {
            setEulogiaLoading(false);
            return setEulogiaDoesnt;
          }
          setEulogia(data.eulogia);
          setPages(data.eulogia.pages);
          setEulogiaLoading(false);
        } else {
          if (!thisWallet) return;
          console.log("before fetching the infor from irys");

          console.log("in hereeeee", thisWallet);
          console.log("the user app information is: ", userAppInformation);
          let thisEulogiaInUser = false;
          if (userAppInformation.userEulogias?.length > 0) {
            thisEulogiaInUser = userAppInformation.userEulogias.filter(
              (x) => x.eulogiaId === router.query.id
            )[0];
          }
          console.log("this eulogia in the user is", thisEulogiaInUser);
          if (thisEulogiaInUser) {
            const userMessage = thisEulogiaInUser.pages.find(
              (msg) => msg.writer === thisWallet.address
            );
            setUserHasWritten(Boolean(userMessage));
            setEulogiaLoading(false);
            setEulogia(thisEulogiaInUser);
          } else {
            let fetchedProvider = await thisWallet.getEthersProvider();
            setProvider(fetchedProvider);
            let signer = await fetchedProvider.getSigner();

            const eulogiasContract = new ethers.Contract(
              process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
              AnkyEulogiasAbi,
              signer
            );
            console.log("the router query is: ", router.query.id);
            const eulogiaId = router.query.id;
            const thisEulogia = await eulogiasContract.getEulogia(eulogiaId);
            console.log("this eulogia is: ", thisEulogia);
            if (thisEulogia.metadataURI === "") return setEulogiaLoading(false);
            const formattedEulogia = await processFetchedEulogia(
              thisEulogia,
              thisWallet
            );
            formattedEulogia.eulogiaId = eulogiaId;

            formattedEulogia.metadata.backgroundImageUrl = `https://ipfs.io/ipfs/${formattedEulogia.metadata.backgroundImageCid}`;
            formattedEulogia.metadata.coverImageUrl = `https://ipfs.io/ipfs/${formattedEulogia.metadata.coverImageCid}`;

            const response = await fetch(
              formattedEulogia.metadata.backgroundImageUrl
            );
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            setPreloadedBackground(imageUrl);

            if (formattedEulogia) {
              const fetchedPages = await getContainerInfoFromIrys(
                "eulogia",
                router.query.id,
                thisWallet.address,
                process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS
              );
              console.log("OUT HERE, THE FETCHED PAGES ARE: ", fetchedPages);

              setEulogia((x) => {
                return { ...formattedEulogia, pages: fetchedPages };
              });
              setEulogiaLoading(false);
              setEulogiaLoading(false);
            } else {
              throw Error("No eulogia");
            }
          }
        }
      } catch (error) {
        console.log(error);
        console.log("There was an error.");
      }
    }

    fetchEulogia();
  }, [loading, authenticated, thisWallet, router.query]);

  useEffect(() => {
    if (thisWallet) {
      checkIfUserOwnsEulogiaAsNFT();
    }
    async function checkIfUserOwnsEulogiaAsNFT() {
      let thisProvider = await thisWallet.getEthersProvider();
      let signer = await thisProvider.getSigner();

      const eulogiasContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
        AnkyEulogiasAbi,
        signer
      );
      const eulogiaId = router.query.id;
      const userBalanceNotFormatted = await eulogiasContract.getEulogiaBalance(
        eulogiaId
      );
      const userBalance = ethers.utils.formatUnits(userBalanceNotFormatted, 0);
      setUserEulogiaBalance(userBalance);
    }
  }, [thisWallet]);

  async function getContentFromArweave(cid) {
    try {
      console.log("inside the get content from arwarave", cid);
      const response = await fetch(`https://www.arweave.net/${cid}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data from Arweave");
      }
      const textContent = await response.text();
      return textContent;
    } catch (error) {
      console.error("Error fetching content from Arweave:", error);
      return null;
    }
  }

  const mintEulogia = async () => {
    try {
      setMintingEulogia(true);
      const thisProvider = await thisWallet.getEthersProvider();
      let signer = await thisProvider.getSigner();
      const eulogiasContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
        AnkyEulogiasAbi,
        signer
      );
      console.log("the eulogia is: ", eulogia);
      const tx = await eulogiasContract.mintEulogia(eulogia.eulogiaId);
      console.log("the tx is: ", tx);
      setMintingEulogia(false);
    } catch (error) {
      console.error("Error minting eulogia:", error);
      alert(
        "Error minting eulogia. Please check the console for more details."
      );
    }
  };

  const onFinish = async (finishText) => {
    try {
      console.log("before getting the auth token");

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
      if (eulogia.pages.length > 0) {
        previousPageCid = eulogia.pages[eulogia.pages.length - 1].cid;
      }
      const tags = [
        { name: "Content-Type", value: "text/plain" },
        { name: "application-id", value: "Anky Dementors" },
        { name: "container-type", value: "eulogia" },
        { name: "container-id", value: router.query.id.toString() },
        {
          name: "smart-contract-address",
          value: process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
        },
        // what is the CID from the previous page? this is where the provenance plays an important role and needs to be taken care of.
        {
          name: "previous-page",
          value: previousPageCid.toString(),
        },
      ];
      console.log("right after the tags", tags);
      try {
        const receipt = await webIrys.upload(finishText, { tags });
        console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
        const newEulogiaWriting = {
          writer: thisWallet.address,
          whoWroteIt: whoIsWriting,
          text: finishText,
          cid: receipt.id,
          timestamp: new Date().getTime(),
        };
        console.log("the new eulogia writing is: ", newEulogiaWriting);

        const updatedEulogia = {
          ...eulogia,
          eulogiaId: router.query.id,
          pages: [...eulogia.pages, newEulogiaWriting],
        };
        console.log("the updated Eulogia is: , updat", updatedEulogia);
        setPages([...eulogia.pages, newEulogiaWriting]);
        setEulogia(updatedEulogia);
        let updatedUserEulogias;

        setUserAppInformation((x) => {
          // Find the specific journal index by its id
          if (x && x.userEulogias && x.userEulogias.length > 0) {
            const eulogiaIndex = x.userEulogias.findIndex(
              (j) => j.eulogiaId == eulogia.eulogiaId
            );

            // If the journal is found
            if (eulogiaIndex !== -1) {
              updatedUserEulogias = [
                ...x.userEulogias.slice(0, eulogiaIndex),
                updatedEulogia,
                ...x.userEulogias.slice(eulogiaIndex + 1),
              ];

              return {
                ...x,
                userEulogias: updatedUserEulogias,
              };
            } else {
              updatedUserEulogias = [...x.userEulogias, updatedEulogia];
              return {
                ...x,
                userEulogias: updatedUserEulogias,
              };
            }
          } else {
            if (x.userEulogias.length > 0) {
              return {
                ...x,
                userEulogias: [...x.userEulogias, updatedEulogia],
              };
            } else {
              return {
                ...x,
                userEulogias: [updatedEulogia],
              };
            }
          }
        });
        setUserData("userEulogias", updatedUserEulogias);
        setUserHasWritten(true); // Update the state to reflect the user has written.
        setLoadWritingGame(false);
      } catch (error) {
        console.log(error);
      }

      return;
    } catch (error) {
      await navigator.clipboard.writeText(finishText);
      console.error("Failed to write to eulogia:", error);
      alert(
        "Failed to write to eulogia. Please try again. Your writing is on the clipboard."
      );
    }
  };

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

  const writeOnEulogia = async () => {
    const writingGameParameters = {
      notebookType: "eulogia",
      targetTime: 480,
      notebookTypeId: eulogia.eulogiaID,
      backgroundImage: eulogia.metadata.backgroundImage || null,
      prompt: eulogia.metadata.description,
      musicUrl: "https://www.youtube.com/watch?v=HcKBDY64UN8",
      cancel: () => setLoadWritingGame(false),
      onFinish,
    };
    setWritingGameProps(writingGameParameters);
    setLoadWritingGame(true);
  };

  const copyEulogiaLink = async () => {
    await navigator.clipboard.writeText(`https://www.anky.lat${router.asPath}`);
    setLinkCopied(true);
  };

  function renderModal() {
    console.log(displayModalMessage);
    return (
      isModalOpen && (
        <div className="fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50">
          <div className="bg-purple-200 relative overflow-y-scroll text-black rounded p-6 w-1/2 h-2/3">
            <p
              onClick={() => setIsModalOpen(false)}
              className="absolute top-1 cursor-pointer right-2 text-red-600 hover:text-red-800"
            >
              close
            </p>
            <span className="text-sm absolute w-96 top-1 left-1/2 -translate-x-1/2 ">
              {new Date(displayModalMessage.timestamp).toLocaleDateString(
                "en-US",
                options
              )}
            </span>

            <div className="overflow-y-scroll h-9/12">
              {displayModalMessage && displayModalMessage.text ? (
                displayModalMessage.text.includes("\n") ? (
                  displayModalMessage.text.split("\n").map((x, i) => (
                    <p className="my-2" key={i}>
                      {x}
                    </p>
                  ))
                ) : (
                  <p className="my-2">{displayModalMessage.text}</p>
                )
              ) : null}
            </div>
            <p className="absolute w-full right-2 bottom-1 italic  flex flex-col">
              <span className="text-xl mb-4">
                {" "}
                {displayModalMessage.whoWroteIt}
              </span>
            </p>
          </div>
        </div>
      )
    );
  }

  if (eulogiaLoading)
    return (
      <div>
        <Spinner />
        <p className="text-white">loading...</p>
      </div>
    );

  if (!eulogia)
    return (
      <div className="text-white">
        <p>this eulogia doesn&apos;t exist.</p>
        <p>add it by clicking this button.</p>
        <Button
          buttonAction={() => router.push("/eulogias/new")}
          buttonText="add eulogia"
          buttonColor="bg-purple-600"
        />
      </div>
    );

  if (loadWritingGame)
    return (
      <div className="relative w-screen h-screen">
        <WritingGameComponent
          {...writingGameProps}
          text={text}
          preloadedBackground={preloadedBackground}
          setLifeBarLength={setLifeBarLength}
          lifeBarLength={lifeBarLength}
          setText={setText}
          time={time}
          setTime={setTime}
        />
      </div>
    );
  return (
    <div className="text-white">
      <div className="flex flex-col">
        <div className="p-2">
          <h2 className="text-2xl md:text-6xl my-2 text-purple-200">
            {eulogia.metadata.title}
          </h2>
          <p className="italic text-lg md:text-2xl mb-2 w-96 mx-auto">
            {eulogia.metadata.description}
          </p>
          <div className="mx-auto relative w-96 h-96 flex overflow-hidden border-white border rounded-xl justify-center">
            <Image
              src={eulogia.metadata.coverImageUrl}
              fill
              alt="Eulogia Cover Image"
            />
          </div>
        </div>

        <div className="w-full flex justify-center flex-wrap mx-auto">
          {eulogia.pages &&
            eulogia.pages.map((msg, index) => (
              <div
                className="p-2 w-8 flex justify-center items-center cursor-pointer h-8 mx-auto bg-purple-200 hover:bg-purple-400 m-2 rounded-xl text-black"
                key={index}
                onClick={() => {
                  setIsModalOpen(true);
                  setDisplayModalMessage(msg);
                }}
              >
                <p>{index}</p>
              </div>
            ))}
        </div>
        <div className="p-2 h-full overflow-y-scroll my-0">
          {!authenticated ? (
            <div>
              <p>this is a community written notebook.</p>
              <p>
                you can write here if you{" "}
                <span
                  className="text-orange-300 hover:text-orange-400 active:text-yellow-300 cursor-pointer"
                  onClick={login}
                >
                  login
                </span>
                .
              </p>
            </div>
          ) : userHasWritten ? (
            <div className="w-full">
              <p>you already wrote here.</p>
            </div>
          ) : (
            <div className="my-0 h-full">
              <p>You have been invited to write in this eulogia.</p>
              <p>
                What you will write here will stay forever associated with it.
              </p>
              <p>Are you ready?</p>
              <input
                type="text"
                className="my-2 p-2 w-48 mx-auto rounded-xl text-black"
                placeholder="your signature"
                value={whoIsWriting}
                onChange={(e) => setWhoIsWriting(e.target.value)}
              />
              {whoIsWriting && (
                <Button
                  buttonText={`Write and sign as ${whoIsWriting}`}
                  buttonColor="bg-purple-500 w-48 mx-auto"
                  buttonAction={writeOnEulogia}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="w-full mx-auto mb-16">
        <div className="flex w-4/5 h-fit mx-auto justify-center">
          {authenticated && (
            <div className="flex space-x-2">
              {userEulogiaBalance == 0 && (
                <Button
                  buttonAction={mintEulogia}
                  buttonColor="bg-green-500"
                  buttonText={mintingEulogia ? "minting..." : "mint eulogia"}
                />
              )}

              <Button
                buttonText="library"
                buttonColor="bg-purple-600"
                buttonAction={() => router.push("/library")}
              />
            </div>
          )}
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default IndividualEulogiaDisplayPage;
