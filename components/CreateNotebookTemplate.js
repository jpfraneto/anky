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
import SuccessfulNotebookTemplate from './SuccessfulNotebookTemplate';

function CreateNotebookTemplate({ userAnky }) {
  const { login } = usePrivy();
  const [loadingNotebookCreation, setLoadingNotebookCreation] = useState(false);
  const [templateCreationError, setTemplateCreationError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState('the process of being');
  const [description, setDescription] = useState('96 days of exploration');
  const [numPages, setNumPages] = useState(4);
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
    event.preventDefault();

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
          NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS,
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
      setTemplateCreationError(true);
      console.error('There was an error creating the notebook:', error);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
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
                        <p>The notebook is being created...</p>
                        <Spinner />
                      </div>
                    ) : (
                      <div>
                        <p>There was an error creating the notebook</p>
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
                    <h3 className=''>
                      You are about to create a notebook template:
                    </h3>
                    <p className='text-2xl'> {title}</p>
                    <p>{description}</p>
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
                      <strong>Minting Price:</strong> {price} ETH | Supply:{' '}
                      {supply}
                    </p>
                    <p className='mt-2'>
                      The people that mint this notebook will be invited to
                      write on it, answering each one of the prompts that you
                      created.
                    </p>
                    <div className='flex left-0 right-0 bottom-5 absolute'>
                      <Button
                        buttonAction={() => setIsModalOpen(false)}
                        buttonColor='bg-red-600'
                        buttonText='Cancel'
                      />
                      <Button
                        buttonAction={finalSubmit}
                        buttonColor='bg-green-600'
                        buttonText='Confirm and Create'
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
          {/* <div>
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
          </div> */}

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
      {renderModal()}
    </div>
  );
}

export default CreateNotebookTemplate;
