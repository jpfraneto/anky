import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { setUserData } from '../../lib/idbHelper';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../../lib/backend';
import Button from '../Button';
import { useUser } from '../../context/UserContext';
import Link from 'next/link';
import eulogiaABI from '../../lib/eulogiaABI.json';
import Spinner from '../Spinner';
import SampleButton from '../SampleButton';
import SuccessfulEulogiaTemplate from './SuccessfulEulogiaTemplate';

const PRICE_FACTOR = 0.0001;

const NewEulogiaPage = ({ wallet }) => {
  const { login, getAccessToken } = usePrivy();
  const [loadingEulogiaCreation, setLoadingEulogiaCreation] = useState(false);
  const [eulogiaCreationError, setEulogiaCreationError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdEulogiaId, setCreatedEulogiaId] = useState(null);
  const [title, setTitle] = useState('the monument game');
  const [description, setDescription] = useState('what do you see?');
  const [pages, setPages] = useState(24);
  const [loading, setLoading] = useState(true);
  const [fileError, setFileError] = useState('');
  const [price, setPrice] = useState((24 * PRICE_FACTOR).toFixed(4));
  const [maxMsgs, setMaxMsgs] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userWallet, setUserWallet] = useState(null);

  const { setUserAppInformation } = useUser();

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
      const authToken = await getAccessToken();
      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/eulogia`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
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
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const newID = array[0];
        // The thing here is that I'm trying to send this transaction from the wallet of the user, not from the erc6551 token.

        const eulogiaContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
          eulogiaABI,
          signer
        );

        const userEnteredPriceInWei = ethers.utils.parseEther(price.toString());
        // You may need to set appropriate values for metadataURI, password, and maxMsgs
        const maxMsgs = pages; // Update with actual max messages

        // Call the contract's method and send the transaction
        const transactionResponse = await eulogiaContract.createEulogia(
          metadataCID.cid,
          maxMsgs,
          newID
        );

        const transactionReceipt = await transactionResponse.wait(); // Wait for the transaction to be mined
        console.log('Eulogia created successfully', transactionResponse);
        const eulogiaCreatedEvent = eulogiaContract.filters.EulogiaCreated();
        const event = transactionReceipt.events?.find(
          e => e.event === 'EulogiaCreated'
        ); // Find the event in the logs
        if (event) {
          const rawEulogiaId = event.args[0]; // Based on the order in your emit statement
          const eulogiaId = ethers.utils.formatUnits(rawEulogiaId, 0);
          console.log('Eulogia ID:', eulogiaId);

          setCreatedEulogiaId(eulogiaId);
          setSuccess(true);
          setLoadingEulogiaCreation(false);

          console.log('the eulgoia that was created is: ');
          setUserAppInformation(x => {
            console.log(
              'the x in the user app information before adding a new eulogia is: ',
              x
            );

            const newEulogia = {
              eulogiaID: eulogiaId,
              maxMessages: maxMsgs,
              messageCount: 0,

              metadata: {
                backgroundImageCid: metadataCID.backgroundImageCid,
                backgroundImageUrl: `https://ipfs.io/ipfs/${metadataCID.backgroundImageCid}`,
                coverImageCid: metadataCID.coverImageCid,
                coverImageUrl: `https://ipfs.io/ipfs/${metadataCID.coverImageCid}`,
                description: description,
                title: title,
                maxPages: maxMsgs,
              },
              messages: [], // Initialize with an empty array as no messages have been added yet.
            };

            setUserData('userEulogias', [...x.userEulogias, newEulogia]);

            return {
              ...x,
              userEulogias: [...x.userEulogias, newEulogia],
            };
          });
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
        <div className='fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50'>
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
                    <p className='text-3xl my-1'> {title}</p>
                    <p className='italic mb-2'>{description}</p>
                    <p>*************</p>
                    <div>
                      {pages} pages for {pages} friends to write
                    </div>

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

  if (loading) {
    return (
      <div className='text-white'>
        <Spinner />
        <p>loading...</p>
      </div>
    );
  }

  if (!wallet)
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
      {wallet && wallet?.address ? (
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
            <p className='text-left text-sm text-gray-500 mt-1'>
              Title (max 50 chars)
            </p>
            <input
              className='border p-2 w-full rounded text-gray-500'
              type='text'
              maxlength='50'
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <p className='text-left text-sm text-gray-500 mt-1'>
              Prompt (this will be displayed to those who come and write) - max
              280 characters
            </p>
            <input
              type='text'
              maxlength='280'
              className='border p-2 w-full rounded text-gray-500'
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className='flex flex-col items-start'>
            <p className='text-left text-sm text-gray-500 my-1'>
              Number of Pages (max 100)
            </p>
            <input
              type='number'
              min={0}
              max={100}
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
              Submit
            </button>
            <Link
              href='/library'
              className='bg-red-500 hover:bg-red-700 mx-2 text-white font-bold py-2 px-4 rounded w-full mt-4'
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

export default NewEulogiaPage;
