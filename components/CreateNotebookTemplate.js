import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../lib/backend';
import templatesContractABI from '../lib/templatesABI.json';

function CreateNotebookTemplate({ userAnky }) {
  const { login } = usePrivy();
  const [loadingNotebookCreation, setLoadingNotebookCreation] = useState(false);
  const [title, setTitle] = useState('the process of being');
  const [description, setDescription] = useState('96 days of exploration');
  const [numPages, setNumPages] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
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
    event.preventDefault();
    const TEMPLATES_CONTRACT_ADDRESS =
      '0xc52698D6C745C516FAba2115f1B453E14e5503a1';

    try {
      console.log('the user anky is after: ', thisWallet);
      let provider = await thisWallet.getEthersProvider();
      let signer = await provider.getSigner();
      console.log('in here, the provider and signer are', provider, signer);
      // const metadataURI = await uploadImageToBackend();
      const metadataURI =
        'https://arweave.net/1qOQOByDpkeiEtI77LyfZAvuln4dzwW12YQxqgSNQwQ';
      console.log('the metadata uri is: ', metadataURI);
      console.log('the user wallet is: ', thisWallet);

      if (thisWallet && signer) {
        // The thing here is that I'm trying to send this transaction from the wallet of the user, not from the erc6551 token.

        const templatesContract = new ethers.Contract(
          TEMPLATES_CONTRACT_ADDRESS,
          templatesContractABI,
          signer
        );

        const userEnteredPriceInWei = ethers.utils.parseEther(price.toString());
        // Call the contract's method and send the transaction
        const transactionResponse = await templatesContract.createTemplate(
          userEnteredPriceInWei,
          [
            'Describe the moment you found out you were going to be a mother.',
            "What are some challenges and joys you've faced as a mother?",
            'How has motherhood changed your perspective on life?',
            'Write a letter to your child, sharing hopes, dreams, and guidance.',
          ],
          metadataURI,
          supply,
          {
            gasLimit: 1000000000,
          }
        );

        console.log('Transaction hash:', transactionResponse.hash);
        await transactionResponse.wait(); // Wait for the transaction to be mined
        console.log('Notebook template created successfully');
        setLoadingNotebookCreation(false);
      } else {
        console.error('Wallet not connected or not authenticated with Privy');
      }
    } catch (error) {
      console.error('There was an error creating the notebook:', error);
    }
    setIsModalOpen(false); // Close the modal at the end
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert('submit!');
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
        <p className='absolute -left-6 top-0 mt-2 ml-2'>{index + 1}.</p>
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

  async function uploadImageToBackend() {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post('/your-backend-endpoint', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.arweaveLink; // Assuming the backend returns the link under this key
  }

  function renderModal() {
    return (
      isModalOpen && (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center z-50'>
          <div className='bg-white rounded p-6 w-2/3'>
            <h3>Review your Notebook Template</h3>
            <p>
              <strong>Title:</strong> {title}
            </p>
            <p>
              <strong>Description:</strong> {description}
            </p>
            <ul>
              {prompts.map((prompt, idx) => (
                <li key={idx}>{prompt}</li>
              ))}
            </ul>
            <p>
              <strong>Price:</strong> {price} ETH
            </p>
            <p>
              <strong>Supply:</strong> {supply}
            </p>
            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt='Notebook cover'
                className='mt-4 mb-4'
              />
            )}
            <div className='flex justify-between'>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button onClick={finalSubmit}>Confirm and Create</button>
            </div>
          </div>
        </div>
      )
    );
  }

  if (!userAnky?.wallet)
    return (
      <p
        className='text-white hover:text-purple-300 cursor-pointer'
        onClick={login}
      >
        please login first
      </p>
    );

  return (
    <div className='my-4 md:w-2/3 text-gray-600 flex items-center justify-center'>
      {userAnky?.wallet?.address ? (
        <form
          className='bg-white w-full p-6  px-8 rounded shadow-md space-y-4'
          onSubmit={handleSubmit}
        >
          <h2 className='text-black text-xl'>New Notebook Template</h2>

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>Title</p>

            <input
              className='border p-2 w-full rounded'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>Description</p>

            <textarea
              className='border p-2 w-full rounded'
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <p className='text-left text-sm text-gray-500 mt-1 mb-0'>
            Notebook Prompts
          </p>

          <div className='space-y-2 mt-0'>{renderPrompts()}</div>

          <button
            type='button'
            className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mt-2'
            onClick={handleAddPrompt}
          >
            Add Prompt
          </button>

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>
              Price (in eth - how much will a user pay for minting an instance
              of this notebook?)
            </p>
            <input
              className='border p-2 w-full rounded'
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
              className='border p-2 w-full rounded'
              type='number'
              value={supply}
              onChange={e => setSupply(e.target.value)}
              required
            />
          </div>
          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>
              Notebook Cover
            </p>
            <input
              type='file'
              accept='image/*'
              onChange={e => setImageFile(e.target.files[0])}
              className='border p-2 w-full rounded'
              required
            />
          </div>

          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4'
            type='submit'
          >
            {loadingNotebookCreation
              ? 'Loading...'
              : 'Create Notebook Template'}
          </button>
        </form>
      ) : (
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={login}
        >
          Login with Privy
        </button>
      )}
    </div>
  );
}

export default CreateNotebookTemplate;
