import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../lib/backend';
import Button from './Button';
import templatesContractABI from '../lib/templatesABI.json';
import Spinner from './Spinner';
import SampleButton from './SampleButton';
import SuccessfulNotebookTemplate from './SuccessfulNotebookTemplate';
import { useRouter } from 'next/router';

const EXAMPLE_NOTEBOOKS = [
  {
    title: 'Journey of Self',
    description:
      'Delve deep into your soul, discover the intricacies of your essence, and pen down the whims of your spirit.',
    price: 0.001,
    prompts: [
      "What does 'self' mean to you?",
      'Recall a time when you felt most alive.',
      'Describe a moment of self-discovery.',
      'What are your core values?',
    ],
  },
  {
    title: 'Dreams & Aspirations',
    description:
      'Capture your loftiest dreams, aspirations, and hopes for the future. Carve a path of intention and drive.',
    price: 0.0015,
    prompts: [
      "What's a dream you've never told anyone?",
      'Where do you see yourself in 10 years?',
      'What steps can you take today towards your dream?',
      'Who or what inspires you the most?',
    ],
  },
  {
    title: 'Childhood Nostalgia',
    description:
      'Revisit the days of unbridled joy, curious wonder, and innocent adventures. Embrace the child within you.',
    price: 0.0012,
    prompts: [
      "What's your fondest childhood memory?",
      'Which toy or game was your favorite?',
      'Describe a typical day in your childhood.',
      'Who was your childhood hero?',
    ],
  },
  {
    title: "Nature's Whispers",
    description:
      'Nature speaks in hushed tones and mighty roars. Capture its essence, beauty, and lessons it imparts.',
    price: 0.0014,
    prompts: [
      'Describe your favorite place in nature.',
      'How does nature inspire you?',
      'Write about a time you felt one with nature.',
      'What lessons has nature taught you?',
    ],
  },
  {
    title: 'Love & Relationships',
    description:
      'Dive into the complexities of human connections. Explore the love you give, receive, and everything in between.',
    price: 0.002,
    prompts: [
      'Describe your first crush.',
      'What does love mean to you?',
      'Write a letter to someone you miss.',
      'What qualities do you value in a partner?',
    ],
  },
  {
    title: 'Mystical Musings',
    description:
      'Venture into the world of the unknown. Explore magic, fantasies, and the mysteries that beckon your spirit.',
    price: 0.0017,
    prompts: [
      'If you had a magical power, what would it be?',
      'Describe a dream that felt too real.',
      "Write about a mystical place you'd like to visit.",
      'Which mythological creature do you resonate with?',
    ],
  },
  {
    title: 'Galactic Explorations',
    description:
      'Embark on a cosmic journey. Traverse galaxies, meet aliens, and unravel the secrets of the universe.',
    price: 0.0018,
    prompts: [
      'If you could visit any planet, which would it be?',
      "Write a message you'd send to extraterrestrial life.",
      'Describe the Earth from a spaceship.',
      'What mysteries of the universe do you want answers to?',
    ],
  },
  {
    title: 'Culinary Chronicles',
    description:
      'Embark on a gastronomic journey. Relish flavors, explore recipes, and pen down your foodie adventures.',
    price: 0.0016,
    prompts: [
      'Describe your favorite meal.',
      'Which cuisine do you want to explore?',
      'Write about a memorable meal shared with loved ones.',
      'If you were a dish, what would you be?',
    ],
  },
  {
    title: 'Musical Memories',
    description:
      "Dance to life's rhythm. Chronicle your favorite tunes, concerts, and the melodies that move your soul.",
    price: 0.0013,
    prompts: [
      "What's the first song that made you cry?",
      'Describe a concert that changed your life.',
      'Which song lyrics resonate with your current feelings?',
      'If your life was a song, what would its title be?',
    ],
  },
  {
    title: 'Historical Hues',
    description:
      'Time travel through history. Chronicle tales of yesteryears, epochs gone by, and moments that shaped the world.',
    price: 0.0015,
    prompts: [
      'If you could meet any historical figure, who would it be?',
      'Describe a past era you wish you lived in.',
      'Write about an unsung hero of history.',
      'Which historical event do you wish you witnessed?',
    ],
  },
];

function CreateNotebookTemplate({ userAnky }) {
  const { login, authenticated } = usePrivy();
  const router = useRouter();
  const [loadingNotebookCreation, setLoadingNotebookCreation] = useState(false);
  const [templateCreationError, setTemplateCreationError] = useState(false);
  const [templateCreationErrorMessage, setTemplateCreationErrorMessage] =
    useState('');
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState('the process of being');
  const [description, setDescription] = useState('96 days of exploration');
  const [numPages, setNumPages] = useState(4);
  const [bulkImportString, setBulkImportString] = useState('');
  const [createdTemplateId, setCreatedTemplateId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [imageFile, setImageFile] = useState(null);
  const [prompts, setPrompts] = useState([
    'Describe the moment you found out you were going to be a mother.',
    "What are some challenges and joys you've faced as a mother?",
    'How has motherhood changed your perspective on life?',
    'Write a letter to your child, sharing hopes, dreams, and guidance.',
  ]);
  const [userWallet, setUserWallet] = useState(null);
  const [price, setPrice] = useState(0.001);
  const [supply, setSupply] = useState(88);

  const { wallets } = useWallets();
  console.log('the wallets are: ', wallets);

  const thisWallet = wallets[0];

  async function finalSubmit() {
    setLoadingNotebookCreation(true);

    try {
      console.log('the user anky is after: ', thisWallet);
      let provider = await thisWallet.getEthersProvider();
      let signer = await provider.getSigner();

      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title,
            description: description,
            prompts: prompts,
            supply: supply,
            price: price,
          }),
        }
      );
      console.log(
        'The server response after creating the Anky is: ',
        serverResponse
      );
      const metadataCID = await serverResponse.json();
      console.log('The metadata uri 2 is: ', metadataCID);

      console.log('the user wallet is: ', thisWallet);

      if (thisWallet && signer) {
        // The thing here is that I'm trying to send this transaction from the wallet of the user, not from the erc6551 token.

        const templatesContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS,
          templatesContractABI,
          signer
        );

        const userEnteredPriceInWei = ethers.utils.parseEther(price.toString());
        // Call the contract's method and send the transaction
        console.log('before the create template', metadataCID);
        const transactionResponse = await templatesContract.createTemplate(
          userEnteredPriceInWei,
          metadataCID.metadataCID,
          supply,
          prompts.length,
          {
            gasLimit: 1000000000,
          }
        );

        console.log('the transaction response is: ', transactionResponse);

        const transactionReceipt = await transactionResponse.wait(); // Wait for the transaction to be mined
        console.log(
          'Notebook template created successfully',
          transactionResponse
        );
        const templateCreatedEvent =
          templatesContract.filters.TemplateCreated();
        const event = transactionReceipt.events?.find(
          e => e.event === 'TemplateCreated'
        ); // Find the event in the logs
        if (event) {
          const templateId = event.args[0]; // Based on the order in your emit statement
          console.log('Template ID:', templateId.toNumber());
          setCreatedTemplateId(templateId.toNumber());
          setSuccess(true);
          setLoadingNotebookCreation(false);
        } else {
          setTemplateCreationError(true);
        }
      } else {
        console.error('Wallet not connected or not authenticated with Privy');
      }
    } catch (error) {
      console.log('IN HERE, THERE WAS AN ERROR', error);
      let errorMessage = '';

      // Try extracting the revert reason
      const revertIndicator = 'execution reverted:';
      if (error && error.message && error.message.includes(revertIndicator)) {
        console.log('the message is: ', error.message);
        const revertReasonStart =
          error.message.indexOf(revertIndicator) + revertIndicator.length;
        const revertReason = error.message.slice(revertReasonStart).trim();

        errorMessage += ` ${revertReason}`;
      } else {
        errorMessage += ` ${error.message}`;
      }

      setTemplateCreationErrorMessage(errorMessage); // Assuming you have a state called templateCreationErrorMessage to store the full error message
      setTemplateCreationError(true);
      console.error('HEREEEE', errorMessage);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (price < 0) return alert('Add a valid price'); // What does valid mean?
    if (supply <= 0)
      return alert('Please add a valid amount of notebooks to mint');
    setIsModalOpen(true); // Simply open the modal on initial submit
  }

  const handleAddPrompt = () => {
    setNumPages(numPages + 1);
    setPrompts([...prompts, '']);
  };

  const handleRemovePrompt = index => {
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
    return prompts.map((prompt, index) => (
      <div key={index} className='relative mt-0'>
        <p className='absolute -left-9 top-0 mt-2 ml-2'>{index + 1}.</p>
        <input
          className='border p-2 w-full rounded'
          value={prompt}
          onChange={e => handlePromptChange(index, e.target.value)}
          required
        />
        <button
          type='button'
          className='absolute right-0 top-0 mt-2 mr-2 text-red-500'
          onClick={() => handleRemovePrompt(index)}
        >
          Remove
        </button>
      </div>
    ));
  };

  const setExampleNotebook = notebook => {
    setTitle(notebook.title);
    setDescription(notebook.description);
    setPrice(notebook.price);
    setPrompts(notebook.prompts);
  };

  const handleBulkImport = () => {
    const importedPrompts = bulkImportString.split(',').map(s => s.trim());
    setPrompts([...importedPrompts]);
    setNumPages(importedPrompts.length);
    setBulkImportString(''); // Clear the bulk import input
  };

  function renderModal() {
    return (
      isModalOpen && (
        <div className='fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50'>
          <div className='bg-purple-300 overflow-y-scroll text-black rounded relative p-6 w-2/3 h-2/3'>
            {success ? (
              <SuccessfulNotebookTemplate
                template={{ title, prompts, createdTemplateId }}
              />
            ) : (
              <>
                {loadingNotebookCreation ? (
                  <>
                    {!templateCreationError ? (
                      <div>
                        <p>
                          The template for this notebook is being created...
                        </p>
                        <Spinner />
                      </div>
                    ) : (
                      <div>
                        <p>{templateCreationErrorMessage}</p>
                        <div className='mx-auto w-48 mt-4'>
                          <Button
                            buttonColor='bg-purple-500'
                            buttonText='Try again'
                            buttonAction={() => {
                              setTemplateCreationError(false);
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
                    <h3 className='text-sm'>
                      You are about to create a notebook template:
                    </h3>
                    <p className='text-3xl my-1'> {title}</p>
                    <p className='italic'>{description}</p>
                    <div className='text-left mt-4 mb-4'>
                      <p className='text-gray-800'>Prompts:</p>
                      <ol>
                        {prompts.map((prompt, idx) => (
                          <li key={idx}>
                            {idx + 1}. {prompt}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <p>
                      People will be able to buy this notebook and write inside
                      it.
                    </p>
                    <p className='bg-purple-500 p-2 rounded-xl border border-black w-fit mx-auto'>
                      <strong>Price:</strong> {price} ETH | Supply: {supply}
                    </p>

                    <p className='mt-2'>
                      What they will write in there will be forever stored on
                      the blockchain.
                    </p>
                    <div className='flex left-0 mt-2'>
                      <Button
                        buttonAction={finalSubmit}
                        buttonColor='bg-green-600'
                        buttonText='Confirm and Create'
                      />
                      <Button
                        buttonAction={() => setIsModalOpen(false)}
                        buttonColor='bg-red-600'
                        buttonText='Cancel'
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

  if (!userAnky?.wallet || !authenticated)
    return (
      <p
        className='text-white hover:text-purple-300 cursor-pointer'
        onClick={login}
      >
        please login first
      </p>
    );

  return (
    <div className='my-4 md:w-2/3 text-gray-200 flex items-center justify-center'>
      {userAnky?.wallet?.address ? (
        <form
          className='bg-black w-full flex flex-col p-6  px-8 rounded shadow-md space-y-4'
          onSubmit={handleSubmit}
        >
          <h2 className='text-gray-200 text-2xl'>New Notebook Template</h2>

          <div className='my-4 md:w-full text-gray-800 flex flex-col items-center justify-center'>
            <h3 className='text-gray-500'>EXAMPLES</h3>
            <div className=' flex flex-wrap justify-start'>
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
            <p className='text-left text-sm text-gray-500 mt-1'>Title</p>

            <input
              className='border p-2 w-full rounded text-gray-500'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>Description</p>

            <textarea
              className='border p-2 w-full rounded text-gray-500'
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <p className='text-left text-sm text-gray-500 my-0'>Bulk import</p>
          <textarea
            className='border p-2 w-full rounded text-gray-500'
            placeholder='Enter questions separated by commas...'
            value={bulkImportString}
            onChange={e => setBulkImportString(e.target.value)}
          />
          <button
            type='button'
            className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-fit mt-2 mr-auto'
            onClick={handleBulkImport}
          >
            Import All Questions
          </button>

          <p className='text-left text-sm text-gray-500 mt-1 mb-0'>
            Notebook Prompts
          </p>

          <div className='space-y-2 mt-0 text-gray-500'>{renderPrompts()}</div>

          <button
            type='button'
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit mt-2 mr-auto'
            onClick={handleAddPrompt}
          >
            Add Prompt
          </button>

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>
              Price (in eth - how much will a user pay for minting an instance
              of this notebook? - you will get 10% of each transaction)
            </p>
            <input
              className='border p-2 w-full rounded text-gray-500'
              type='number'
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>
              Supply (max notebooks that will be available for mint)
            </p>
            <input
              className='border p-2 w-full rounded text-gray-500'
              type='number'
              value={supply}
              min={0}
              onChange={e => setSupply(e.target.value)}
              required
            />
          </div>
          <div className='flex space-x-2'>
            <button
              className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-fit mt-4'
              type='submit'
            >
              {loadingNotebookCreation
                ? 'loading...'
                : 'create notebook template'}
            </button>
            <button
              className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-fit mt-4'
              type='button'
              onClick={() => router.back()}
            >
              go back
            </button>
          </div>
        </form>
      ) : (
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={login}
        >
          Login with Privy
        </button>
      )}
      {renderModal()}
    </div>
  );
}

export default CreateNotebookTemplate;
