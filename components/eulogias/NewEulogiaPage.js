import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../../lib/backend';
import Button from '../Button';
import eulogiaABI from '../../lib/eulogiaABI.json';
import Spinner from '../Spinner';
import SampleButton from '../SampleButton';
import SuccessfulNotebookTemplate from '../SuccessfulNotebookTemplate';

const NewEulogiaPage = ({ userAnky }) => {
  const { login } = usePrivy();
  const [loadingNotebookCreation, setLoadingNotebookCreation] = useState(false);
  const [templateCreationError, setTemplateCreationError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [maxMsgs, setMaxMsgs] = useState(null);
  const [usePassword, setUsePassword] = useState(false);
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userWallet, setUserWallet] = useState(null);

  const { wallets } = useWallets();
  console.log('the wallets are: ', wallets);

  const thisWallet = wallets[0];

  const imageChange = event => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  async function finalSubmit() {
    setLoadingNotebookCreation(true);

    try {
      console.log('the user anky is after: ', thisWallet);
      let provider = await thisWallet.getEthersProvider();
      let signer = await provider.getSigner();

      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/eulogia`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title,
            description: description,
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

        const eulogiaContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_EULOGIA_CONTRACT_ADDRESS,
          eulogiaABI,
          signer
        );

        const userEnteredPriceInWei = ethers.utils.parseEther(price.toString());
        // You may need to set appropriate values for metadataURI, password, and maxMsgs
        const metadataURI = metadataCID.metadataCID;
        const password = 'somePassword'; // Update with actual password
        const maxMsgs = 10; // Update with actual max messages

        // Call the contract's method and send the transaction
        console.log('before the create template', metadataCID);
        const transactionResponse = await eulogiaContract.createEulogia(
          metadataURI,
          password,
          maxMsgs,
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

  const setExampleNotebook = notebook => {
    setTitle(notebook.title);
    setDescription(notebook.description);
    setPrice(notebook.price);
    setPrompts(notebook.prompts);
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
                    <p className='bg-purple-500 p-2 rounded-xl border border-black w-fit mx-auto'>
                      <strong>Minting Price:</strong> {price} ETH | Supply:{' '}
                      {supply}
                    </p>
                    <p className='mt-2'>
                      The people that mint this notebook will be invited to
                      write on it, answering each one of the prompts that you
                      created.
                    </p>
                    <p className='mt-2'>
                      What they will write in there will be forever stored on
                      the blockchain.
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
    <div className='my-4 md:w-2/3 text-gray-200 flex items-center justify-center'>
      {userAnky?.wallet?.address ? (
        <form className='bg-black w-full flex flex-col p-6 px-8 rounded shadow-md space-y-2'>
          <h2 className='text-gray-200 text-2xl'>Create Eulogia</h2>
          <p className='mt-0'>
            An eulogia is a community written notebook that you and your friends
            can write in.
          </p>
          <p className='mt-0'>
            What will be written in there is going to be stored forever on the
            blockchain.
          </p>
          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>Title</p>
            <input
              className='border p-2 w-full rounded text-gray-500'
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>Description</p>
            <textarea
              className='border p-2 w-full rounded text-gray-500'
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={usePassword}
              onChange={() => setUsePassword(!usePassword)}
            />
            <label className='text-gray-500'>
              Use password? (the people you invite will need it to write here)
            </label>
          </div>

          {usePassword && (
            <div className=''>
              <p className='text-left text-sm text-gray-500 mt-1'>
                Password (if you forget it you wont be able to write anymore)
              </p>
              <input
                className='border p-2 w-full rounded text-gray-500'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          )}

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>Upload Image</p>
            <input
              type='file'
              className='border p-2 w-full rounded text-gray-500'
              onChange={imageChange}
            />
          </div>

          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4'
            onClick={handleSubmit}
          >
            Submit
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
};

export default NewEulogiaPage;
