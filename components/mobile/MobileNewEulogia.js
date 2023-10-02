import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../../lib/backend';
import Button from '../Button';
import Link from 'next/link';
import eulogiaABI from '../../lib/eulogiaABI.json';
import Spinner from '../Spinner';
import SuccessfulEulogiaTemplate from '../eulogias/SuccessfulEulogiaTemplate';

const PRICE_FACTOR = 0.0001;

const MobileNewEulogia = ({ userAnky }) => {
  const { login } = usePrivy();
  const [loadingEulogiaCreation, setLoadingEulogiaCreation] = useState(false);
  const [eulogiaCreationError, setEulogiaCreationError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdEulogiaId, setCreatedEulogiaId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pages, setPages] = useState(24);
  const [loading, setLoading] = useState(true);
  const [fileError, setFileError] = useState('');
  const [price, setPrice] = useState((24 * PRICE_FACTOR).toFixed(4));
  const [maxMsgs, setMaxMsgs] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userWallet, setUserWallet] = useState(null);

  const { wallets } = useWallets();
  console.log('the wallets are: ', wallets);

  const thisWallet = wallets[0];

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 888);
  }, []);

  const imageChange = (event, f) => {
    const file = event.target.files[0];
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

    if (file) {
      if (file.size > maxSizeInBytes) {
        setFileError('File size exceeds 10MB limit.');
        return; // exit out of the function
      }
      f(file);
      setFileError(''); // Clear the error if any
    }
  };

  async function finalSubmit() {
    setLoadingEulogiaCreation(true);

    try {
      console.log('the user anky is after: ', thisWallet);
      let provider = await thisWallet.getEthersProvider();
      let signer = await provider.getSigner();

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('coverImage', coverImage);
      formData.append('maxPages', pages);
      // formData.append('backgroundImage', backgroundImage);

      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/eulogia`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );
      console.log(
        'The server response after publishing the metadata is: ',
        serverResponse
      );
      const metadataCID = await serverResponse.json();
      console.log('The metadata uri 2 is: ', metadataCID);

      console.log('the user wallet is: ', thisWallet);

      if (thisWallet && signer) {
        // The thing here is that I'm trying to send this transaction from the wallet of the user, not from the erc6551 token.

        const eulogiaContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
          eulogiaABI,
          signer
        );

        const userEnteredPriceInWei = ethers.utils.parseEther(price.toString());
        // You may need to set appropriate values for metadataURI, password, and maxMsgs
        const metadataURI = metadataCID.metadataCID;
        const maxMsgs = pages; // Update with actual max messages

        // Call the contract's method and send the transaction
        const transactionResponse = await eulogiaContract.createEulogia(
          metadataCID.cid,
          maxMsgs,
          {
            gasLimit: 1000000000,
          }
        );

        const transactionReceipt = await transactionResponse.wait(); // Wait for the transaction to be mined
        console.log(
          'Eulogia template created successfully',
          transactionResponse
        );
        const eulogiaCreatedEvent = eulogiaContract.filters.EulogiaCreated();
        const event = transactionReceipt.events?.find(
          e => e.event === 'EulogiaCreated'
        ); // Find the event in the logs
        if (event) {
          const eulogiaId = event.args[0]; // Based on the order in your emit statement
          console.log('Eulogia ID:', eulogiaId.toNumber());
          setCreatedEulogiaId(eulogiaId.toNumber());
          setSuccess(true);
          setLoadingEulogiaCreation(false);
        } else {
          setEulogiaCreationError(true);
        }
      } else {
        console.error('Wallet not connected or not authenticated with Privy');
      }
    } catch (error) {
      setEulogiaCreationError(true);
      console.error('There was an error creating the eulogia:', error);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsModalOpen(true); // Simply open the modal on initial submit
  }

  function renderModal() {
    return (
      isModalOpen && (
        <div className='fixed top-0 left-0 bg-black  w-full h-full flex items-center justify-center z-50'>
          <div className='bg-purple-200 overflow-y-scroll text-black rounded relative p-6 w-2/3 h-2/3'>
            {success ? (
              <>
                <p>Congratulations!</p>
                <SuccessfulEulogiaTemplate
                  eulogia={{ createdEulogiaId, title, pages }}
                />
              </>
            ) : (
              <>
                {loadingEulogiaCreation ? (
                  <>
                    {!eulogiaCreationError ? (
                      <div>
                        <p>The eulogia is being created...</p>
                        <Spinner />
                      </div>
                    ) : (
                      <div>
                        <p>There was an error creating the eulogia</p>
                        <div className='mx-auto w-48 mt-4'>
                          <Button
                            buttonColor='bg-purple-500'
                            buttonText='Try again'
                            buttonAction={() => {
                              setEulogiaCreationError(false);
                              setIsModalOpen(false);
                              setLoadingEulogiaCreation(false);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className='text-sm'>
                      You are about to create an eulogia notebook:
                    </h3>
                    <p className='text-3xl my-1'>{title}</p>
                    <p className='italic mb-2'>{description}</p>
                    <p>*************</p>
                    <div>
                      {pages} pages for {pages} friends to write
                    </div>

                    <div className='flex flex-col space-y-2 left-0 right-0 bottom-5 absolute'>
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

  if (loading) {
    return (
      <div className='text-white'>
        <Spinner />
        <p>loading...</p>
      </div>
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
        <form className='text-black w-full flex flex-col p-6 px-8 rounded  space-y-2'>
          <h2 className='text-gray-400 text-2xl'>Create Eulogia</h2>
          <p className='mt-0'>An eulogia is a community written notebook.</p>
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
            <p className='text-left text-sm text-gray-500 mt-1'>
              Prompt (this will be displayed to those who come and write)
            </p>
            <input
              type='text'
              className='border p-2 w-full rounded text-gray-500'
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className='flex flex-col items-start'>
            <p className='text-left text-sm text-gray-500 my-1'>
              Number of Pages
            </p>
            <input
              type='number'
              min={0}
              className='border p-2 w-36 rounded text-gray-500'
              value={pages}
              onChange={e => {
                setPages(e.target.value);
                setPrice((0.0001 * e.target.value).toFixed(2));
              }}
            />
          </div>

          <div>
            <p className='text-left text-sm text-gray-500 my-1'>
              Upload Cover Image (this will be the cover of this eulogia
              notebook)
            </p>
            <input
              type='file'
              accept='image/*'
              className='border p-2 w-full rounded text-gray-500'
              onChange={e => imageChange(e, setCoverImage)}
            />
          </div>

          {/* <div>
            <p className='text-left text-sm text-gray-500 my-1'>
              Upload Background Image (this one will be used as the background
              when people come and write)
            </p>
            <input
              type='file'
              accept='image/*'
              className='border p-2 w-full rounded text-gray-500'
              onChange={e => imageChange(e, setBackgroundImage)}
            />
          </div> */}
          {fileError && <div className='text-red-500 mt-2'>{fileError}</div>}
          <div className='flex flex-row'>
            <button
              className='bg-green-500 hover:bg-green-700 mx-2 text-white font-bold py-2 px-4 rounded w-full mt-4'
              onClick={handleSubmit}
            >
              submit
            </button>
            <Link
              href='/library'
              className='bg-red-500 text-center hover:bg-red-700 mx-2 text-white font-bold py-2 px-4 rounded w-full mt-4'
            >
              library
            </Link>
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
};

export default MobileNewEulogia;
