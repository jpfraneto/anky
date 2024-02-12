import { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { uploadToIrys } from "../lib/irys";
import Link from "next/link";
import { useContractRead } from "wagmi";
import { createTBA } from "../lib/backend";
import Button from "./Button";
import SampleButton from "./SampleButton";
import { setUserData } from "../lib/idbHelper";
import notebookABI from "../lib/notebookABI.json";
import Spinner from "./Spinner";
import SuccessfulNotebook from "./SuccessfulNotebook";
import { useRouter } from "next/router";
import { useUser } from "../context/UserContext";

const EXAMPLE_NOTEBOOKS = [
  {
    title: "Journey of Self",
    description:
      "Delve deep into your soul, discover the intricacies of your essence, and pen down the whims of your spirit.",
    price: 0.001,
    prompts: [
      "What does 'self' mean to you?",
      "Recall a time when you felt most alive.",
      "Describe a moment of self-discovery.",
      "What are your core values?",
    ],
  },
  {
    title: "Dreams & Aspirations",
    description:
      "Capture your loftiest dreams, aspirations, and hopes for the future. Carve a path of intention and drive.",
    price: 0.0015,
    prompts: [
      "What's a dream you've never told anyone?",
      "Where do you see yourself in 10 years?",
      "What steps can you take today towards your dream?",
      "Who or what inspires you the most?",
    ],
  },
  {
    title: "Childhood Nostalgia",
    description:
      "Revisit the days of unbridled joy, curious wonder, and innocent adventures. Embrace the child within you.",
    price: 0.0012,
    prompts: [
      "What's your fondest childhood memory?",
      "Which toy or game was your favorite?",
      "Describe a typical day in your childhood.",
      "Who was your childhood hero?",
    ],
  },
  {
    title: "Nature's Whispers",
    description:
      "Nature speaks in hushed tones and mighty roars. Capture its essence, beauty, and lessons it imparts.",
    price: 0.0014,
    prompts: [
      "Describe your favorite place in nature.",
      "How does nature inspire you?",
      "Write about a time you felt one with nature.",
      "What lessons has nature taught you?",
    ],
  },
  {
    title: "Love & Relationships",
    description:
      "Dive into the complexities of human connections. Explore the love you give, receive, and everything in between.",
    price: 0.002,
    prompts: [
      "Describe your first crush.",
      "What does love mean to you?",
      "Write a letter to someone you miss.",
      "What qualities do you value in a partner?",
    ],
  },
  {
    title: "Mystical Musings",
    description:
      "Venture into the world of the unknown. Explore magic, fantasies, and the mysteries that beckon your spirit.",
    price: 0.0017,
    prompts: [
      "If you had a magical power, what would it be?",
      "Describe a dream that felt too real.",
      "Write about a mystical place you'd like to visit.",
      "Which mythological creature do you resonate with?",
    ],
  },
  {
    title: "Galactic Explorations",
    description:
      "Embark on a cosmic journey. Traverse galaxies, meet aliens, and unravel the secrets of the universe.",
    price: 0.0018,
    prompts: [
      "If you could visit any planet, which would it be?",
      "Write a message you'd send to extraterrestrial life.",
      "Describe the Earth from a spaceship.",
      "What mysteries of the universe do you want answers to?",
    ],
  },
  {
    title: "Culinary Chronicles",
    description:
      "Embark on a gastronomic journey. Relish flavors, explore recipes, and pen down your foodie adventures.",
    price: 0.0016,
    prompts: [
      "Describe your favorite meal.",
      "Which cuisine do you want to explore?",
      "Write about a memorable meal shared with loved ones.",
      "If you were a dish, what would you be?",
    ],
  },
  {
    title: "Musical Memories",
    description:
      "Dance to life's rhythm. Chronicle your favorite tunes, concerts, and the melodies that move your soul.",
    price: 0.0013,
    prompts: [
      "What's the first song that made you cry?",
      "Describe a concert that changed your life.",
      "Which song lyrics resonate with your current feelings?",
      "If your life was a song, what would its title be?",
    ],
  },
  {
    title: "Historical Hues",
    description:
      "Time travel through history. Chronicle tales of yesteryears, epochs gone by, and moments that shaped the world.",
    price: 0.0015,
    prompts: [
      "If you could meet any historical figure, who would it be?",
      "Describe a past era you wish you lived in.",
      "Write about an unsung hero of history.",
      "Which historical event do you wish you witnessed?",
    ],
  },
];

function NewNotebookPage({}) {
  const { login, authenticated, getAccessToken } = usePrivy();
  const router = useRouter();
  const [loadingNotebookCreation, setLoadingNotebookCreation] = useState(false);
  const [notebookCreationError, setNotebookCreationError] = useState(false);
  const [notebookCreationErrorMessage, setNotebookCreationErrorMessage] =
    useState("");
  const [success, setSuccess] = useState(false);
  const [handlePromptsError, setHandlePromptsError] = useState(false);
  const [title, setTitle] = useState("the process of being");
  const [description, setDescription] = useState("96 days of exploration");
  const [numPages, setNumPages] = useState(4);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [createdNotebook, setCreatedNotebook] = useState(null);
  const [bulkImportString, setBulkImportString] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [imageFile, setImageFile] = useState(null);
  const [prompts, setPrompts] = useState([
    "Describe the moment you found out you were going to be a mother.",
    "What are some challenges and joys you've faced as a mother?",
    "How has motherhood changed your perspective on life?",
    "Write a letter to your child, sharing hopes, dreams, and guidance.",
  ]);
  const [userWallet, setUserWallet] = useState(null);
  const [price, setPrice] = useState(0.001);
  const [supply, setSupply] = useState(88);
  const { setUserAppInformation } = useUser();

  const { wallets } = useWallets();
  console.log("the wallets are: ", wallets);

  const thisWallet = wallets[0];
  console.log("this wallet is: ", thisWallet);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isModalOpen]);

  async function finalSubmit() {
    setLoadingNotebookCreation(true);

    try {
      console.log("not the user anky but this wallet: ", thisWallet);
      let provider = await thisWallet.getEthersProvider();
      let signer = await provider.getSigner();

      const notebookMetadata = {
        prompts: prompts,
        title: title,
        description: description,
        originalSupply: supply,
        originalPrice: price,
      };

      // where is the information about the notebook that is important to store? i don't remember what it was. what is was. what it was.

      const notebookInformationCID = await uploadToIrys(
        thisWallet,
        JSON.stringify(notebookMetadata)
      );

      if (thisWallet && signer) {
        // The thing here is that I'm trying to send this transaction from the wallet of the user, not from the erc6551 token.

        const notebooksContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
          notebookABI,
          signer
        );
        console.log("the notebooks contract is: ", notebooksContract);
        const userEnteredPriceInWei = ethers.utils.parseEther(price.toString());
        // Call the contract's method and send the transaction
        const transactionResponse = await notebooksContract.createNotebook(
          notebookInformationCID,
          supply,
          userEnteredPriceInWei
        );

        console.log("the transaction response is: ", transactionResponse);

        const transactionReceipt = await transactionResponse.wait(); // Wait for the transaction to be mined
        console.log("Notebook created successfully", transactionResponse);
        //         emit NotebookCreated(newNotebookId, usersAnkyAddress, metadataCID);

        const event = transactionReceipt.events?.find(
          (e) => e.event === "NotebookCreated"
        ); // Find the event in the logs

        if (event) {
          let notebookId = event.args[0]; // Based on the order in your emit statement
          console.log("THE NOTEBOOK ID IS: ", notebookId);
          notebookId = ethers.utils.formatUnits(notebookId, 0);
          let newUserNotebooks;
          let newNotebook = {
            notebookId: notebookId,
            creator: thisWallet.address,
            metadata: {
              description: description,
              price: price,
              prompts: prompts,
              supply: supply,
              title: title,
            },
            numberOfPrompts: prompts.length,
            price: price,
            supply: supply,
          };
          setUserAppInformation((x) => {
            console.log(
              "the x in the user app information before adding a new template is: ",
              x
            );

            if (!x.userNotebooks) {
              newUserNotebooks = [newNotebook];
            } else {
              newUserNotebooks = [...x.userNotebooks, newNotebook];
            }
            setUserData("userNotebooks", newUserNotebooks);
            return { ...x, userNotebooks: newUserNotebooks };
          });
          setCreatedNotebook(newNotebook);
          setSuccess(true);
          setLoadingNotebookCreation(false);
        } else {
          setNotebookCreationError(true);
        }
      } else {
        console.error("Wallet not connected or not authenticated with Privy");
      }
    } catch (error) {
      console.log("IN HERE, THERE WAS AN ERROR", error);
      let errorMessage = "";

      // Try extracting the revert reason
      const revertIndicator = "execution reverted:";
      if (error && error.message && error.message.includes(revertIndicator)) {
        console.log("the message is: ", error.message);
        const revertReasonStart =
          error.message.indexOf(revertIndicator) + revertIndicator.length;
        const revertReason = error.message.slice(revertReasonStart).trim();

        errorMessage += ` ${revertReason}`;
      } else {
        errorMessage += ` ${error.message}`;
      }

      setNotebookCreationErrorMessage(errorMessage);
      setNotebookCreationError(true);
      console.error("HEREEEE", errorMessage);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (price < 0) return alert("Add a valid price"); // What does valid mean?
    if (supply <= 0)
      return alert("Please add a valid amount of notebooks to mint");
    setIsModalOpen(true);
  }

  const handleAddPrompt = () => {
    setNumPages(numPages + 1);
    setPrompts([...prompts, ""]);
  };

  const handleRemovePrompt = (index) => {
    setNumPages(numPages - 1);
    const newPrompts = [...prompts];
    newPrompts.splice(index, 1);
    setPrompts(newPrompts);
  };

  const handlePromptChange = (index, value) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const renderPrompts = () => {
    if (prompts.length === 0) {
      return (
        <p className="mr-auto text-red-400 text-left">
          please add the first prompt to this notebook.
        </p>
      );
    }
    return prompts.map((prompt, index) => (
      <div key={index} className="relative mt-0">
        <p className="absolute -left-9 top-0 mt-2 ml-2">{index + 1}.</p>
        <input
          className="border p-2 w-full mr-auto rounded"
          value={prompt}
          onChange={(e) => handlePromptChange(index, e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-0 top-0 mt-2 mr-2 text-red-500 hover:text-red-700"
          onClick={() => handleRemovePrompt(index)}
        >
          Remove
        </button>
      </div>
    ));
  };

  const setExampleNotebook = (notebook) => {
    setTitle(notebook.title);
    setDescription(notebook.description);
    setPrice(notebook.price);
    setPrompts(notebook.prompts);
  };

  const handleBulkImport = () => {
    if (
      bulkImportString.length > 0 &&
      bulkImportString.includes("%%") &&
      bulkImportString.split("%%").length > 0
    ) {
      const importedPrompts = bulkImportString.split("%%").map((s) => s.trim());
      setPrompts([...importedPrompts]);
      setNumPages(importedPrompts.length);
      setBulkImportString("");
    } else {
      setHandlePromptsError(true);
    }
  };

  function renderModal() {
    return (
      isModalOpen && (
        <div className="fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50">
          <div className="bg-purple-300 overflow-y-scroll text-black rounded relative p-6 w-4/5 md:w-2/3 h-4/5 md:h-2/3">
            {success ? (
              <SuccessfulNotebook notebook={createdNotebook} />
            ) : (
              <>
                {loadingNotebookCreation ? (
                  <>
                    {!notebookCreationError ? (
                      <div>
                        <p>this notebook is being created...</p>
                        <p>you will -probably- need to confirm two things:</p>
                        <p>one for uploading the metadata to irys</p>
                        <p>
                          another one for creating the notebook as an erc1155
                          nft
                        </p>
                        <Spinner />
                      </div>
                    ) : (
                      <div>
                        <p>{notebookCreationErrorMessage}</p>
                        <div className="mx-auto w-48 mt-4">
                          <Button
                            buttonColor="bg-purple-500"
                            buttonText="Try again"
                            buttonAction={() => {
                              setNotebookCreationError(false);
                              setIsModalOpen(false);
                              setLoadingNotebookCreation(false);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-sm mb-2">
                      you are about to create a notebook:
                    </h3>
                    <p className="text-3xl my-1"> {title}</p>
                    <p className="italic">{description}</p>
                    <div className="text-left mt-4 mb-4">
                      <p className="text-gray-800">Prompts:</p>
                      <ol>
                        {prompts.map((prompt, idx) => (
                          <li key={idx}>
                            {idx + 1}. {prompt}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <p>
                      people will be able to buy this notebook and write inside
                      it.
                    </p>
                    <p className="bg-purple-500 p-2 rounded-xl border border-black w-fit mx-auto">
                      supply: {supply} | <strong>price:</strong> {price} eth |{" "}
                      <strong>
                        {price * process.env.NEXT_PUBLIC_ETHEREUM_PRICE} usd
                      </strong>
                    </p>

                    <p className="mt-2">
                      what they will write in there will be forever.
                    </p>
                    <div className="flex left-0 mt-2">
                      <Button
                        buttonAction={finalSubmit}
                        buttonColor="bg-green-600"
                        buttonText="create"
                      />
                      <Button
                        buttonAction={() => setIsModalOpen(false)}
                        buttonColor="bg-red-600"
                        buttonText="cancel"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )
    );
  }

  if (!authenticated)
    return (
      <p
        className="text-white hover:text-purple-300 cursor-pointer"
        onClick={login}
      >
        please login first
      </p>
    );
  return (
    <div className="my-4 md:w-2/3 mx-auto text-gray-200 flex items-center justify-center">
      <form
        className="bg-black w-full flex flex-col p-2 md:p-6 rounded shadow-md space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-gray-200 text-2xl">create new notebook</h2>

        <div className="my-4 md:w-full text-gray-800 flex flex-col items-center justify-center">
          <h3 className="text-gray-500">EXAMPLES</h3>
          <div className=" flex flex-wrap justify-start">
            {EXAMPLE_NOTEBOOKS.map((notebook, idx) => (
              <SampleButton
                key={idx}
                notebook={notebook}
                setExampleNotebook={setExampleNotebook}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-left text-sm text-gray-500 mt-1">
            title - a line about what you want to bring to the writer through
            this notebook (max 50 characters)
          </p>

          <input
            className="border p-2 w-full rounded text-gray-500"
            value={title}
            maxlength="50"
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <p className="text-left text-sm text-gray-500 mt-1">
            description - what is this notebook about? (max 560 characters)
          </p>

          <textarea
            className="border p-2 w-full h-48 rounded text-gray-500"
            value={description}
            maxlength="560"
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <p className="text-left text-sm text-gray-500 mt-1 mb-0">
          notebook prompts (what is the journey that you want to take the writer
          into?)
        </p>

        <div className="space-y-2 mt-0 text-gray-500">{renderPrompts()}</div>

        <div className="flex mr-auto">
          <button
            type="button"
            className="bg-blue-500  hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit mt-2 mr-2"
            onClick={handleAddPrompt}
          >
            add prompt
          </button>
          <button
            type="button"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-fit mt-2 mr-auto"
            onClick={() => {
              if (confirm("do you want to delete all the prompts?")) {
                setPrompts([]);
              }
            }}
          >
            clear prompts
          </button>
        </div>

        <p
          className="text-left text-sm text-gray-500 my-0"
          onClick={() => setShowBulkImport((x) => !x)}
        >
          bulk import
        </p>
        {showBulkImport && (
          <div>
            <textarea
              className="border p-2 w-full h-48 rounded text-gray-500"
              placeholder="Enter each question separated by %%"
              value={bulkImportString}
              onChange={(e) => {
                setHandlePromptsError(false);
                setBulkImportString(e.target.value);
              }}
            />
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded  w-fit mt-2 mr-auto"
              onClick={handleBulkImport}
            >
              import All Questions
            </button>
            {handlePromptsError && (
              <p className="mr-auto text-red-400 text-left">
                please add a long string with each question separated by this
                %%.
              </p>
            )}
          </div>
        )}

        <div>
          <p className="text-left text-sm text-gray-500 mt-1">
            price (in eth - how much will a user pay for minting an instance of
            this notebook? - you will get 10% of each transaction)
          </p>
          <small className="text-left my-0 text-red-200">
            this is about{" "}
            {Math.floor(price * process.env.NEXT_PUBLIC_ETHEREUM_PRICE)} usd per
            notebook.
          </small>
          <input
            className="border p-2 w-full rounded text-gray-500"
            type="number"
            step={0.001}
            value={price}
            min={0}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <p className="text-left text-sm text-gray-500 mt-1">
            supply (max notebooks that will be available for mint)
          </p>
          <input
            className="border p-2 w-full rounded text-gray-500"
            type="number"
            value={supply}
            min={0}
            max={100}
            onChange={(e) => setSupply(e.target.value)}
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-fit mt-4"
            type="submit"
          >
            {loadingNotebookCreation ? "loading..." : "create notebook"}
          </button>
          <Link
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-fit mt-4"
            href="/library"
          >
            back to library
          </Link>
        </div>
      </form>
      {renderModal()}
    </div>
  );
}

export default NewNotebookPage;
