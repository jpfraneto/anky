import React, { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import AnkyEulogiasAbi from '../../lib/eulogiaABI.json';
import { useRouter } from 'next/router';
import { processFetchedEulogia } from '../../lib/notebooks.js';
import { ethers } from 'ethers';
import Button from '../Button';
import Image from 'next/image';
import WritingGameComponent from '../WritingGameComponent';
import Spinner from '../Spinner';

const IndividualEulogiaDisplayPage = ({ setLifeBarLength, lifeBarLength }) => {
  const { login, authenticated, loading } = usePrivy();
  const router = useRouter();
  const [eulogia, setEulogia] = useState(null);
  const [eulogiaLoading, setEulogiaLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [displayModalMessage, setDisplayModalMessage] = useState(null);
  const [preloadedBackground, setPreloadedBackground] = useState(null);
  const [whoIsWriting, setWhoIsWriting] = useState('');
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [text, setText] = useState('');
  const [provider, setProvider] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userHasWritten, setUserHasWritten] = useState(false);
  const { wallets } = useWallets();
  const thisWallet = wallets[0];

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyPress = event => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isModalOpen, closeModal]);

  useEffect(() => {
    async function fetchEulogia() {
      try {
        if (!router.query) return;
        if (!authenticated && !loading) {
          const serverResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/eulogia/${router.query.id}`
          );
          const data = await serverResponse.json();
          console.log('the server response is: ', data);
          setEulogia(data.eulogia);
          setMessages(data.eulogia.messages);
          setEulogiaLoading(false);
        } else {
          if (!thisWallet) return;
          console.log('in hereeeee', thisWallet);
          let fetchedProvider = await thisWallet.getEthersProvider();
          setProvider(fetchedProvider);
          let signer = await fetchedProvider.getSigner();

          const eulogiasContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
            AnkyEulogiasAbi,
            signer
          );

          const eulogiaID = router.query.id;
          const thisEulogia = await eulogiasContract.getEulogia(eulogiaID);
          console.log('this eulogia is: ', thisEulogia);
          if (thisEulogia.metadataURI === '') return setEulogiaLoading(false);
          const formattedEulogia = await processFetchedEulogia(thisEulogia);
          formattedEulogia.eulogiaID = eulogiaID;
          console.log('the formatted euloogia is: ', formattedEulogia);
          formattedEulogia.metadata.backgroundImageUrl = `https://ipfs.io/ipfs/${formattedEulogia.metadata.backgroundImageCid}`;
          formattedEulogia.metadata.coverImageUrl = `https://ipfs.io/ipfs/${formattedEulogia.metadata.coverImageCid}`;

          const response = await fetch(
            formattedEulogia.metadata.backgroundImageUrl
          );
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setPreloadedBackground(imageUrl);

          if (formattedEulogia) {
            setEulogia(formattedEulogia);
            setEulogiaLoading(false);

            setMessages(formattedEulogia.messages);

            const userMessage = formattedEulogia.messages.find(
              msg => msg.writer === thisWallet.address
            );
            setUserHasWritten(Boolean(userMessage));
            setLoading(false);
          } else {
            throw Error('No eulogia');
          }
        }
      } catch (error) {
        console.log(error);
        console.log('There was an error.');
      }
    }

    fetchEulogia();
  }, [loading, authenticated, thisWallet, router.query]);

  async function getContentFromArweave(cid) {
    try {
      console.log('inside the get content from arwarave', cid);
      const response = await fetch(`https://www.arweave.net/${cid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Arweave');
      }
      const textContent = await response.text();
      return textContent;
    } catch (error) {
      console.error('Error fetching content from Arweave:', error);
      return null;
    }
  }

  const mintEulogia = async () => {
    try {
      let signer = await provider.getSigner();
      const eulogiasContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
        AnkyEulogiasAbi,
        signer
      );
      await eulogiasContract.mintEulogiaToAnky(eulogia.eulogiaID);
      alert('Eulogia minted successfully!');
    } catch (error) {
      console.error('Error minting eulogia:', error);
      alert(
        'Error minting eulogia. Please check the console for more details.'
      );
    }
  };

  const onFinish = async finishText => {
    try {
      // Step 1: Send the text to the backend to be stored on Arweave.
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/eulogia/writing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text: finishText }),
        }
      );

      const { cid } = await response.json();
      console.log('time to add the writing to the smart contract:', cid);
      let signer = await provider.getSigner();
      // Step 2: Send the CID to the smart contract.
      const eulogiasContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
        AnkyEulogiasAbi,
        signer
      );

      console.log('the eulogias contract is: ', eulogiasContract);
      console.log('eulog', eulogia, cid, whoIsWriting);
      const tx = await eulogiasContract.addMessage(
        eulogia.eulogiaID,
        cid,
        whoIsWriting
      );
      await tx.wait();
      console.log('after the transaction');
      setMessages(x => [
        ...x,
        {
          writer: thisWallet.address,
          whoWroteIt: whoIsWriting,
          text: finishText,
        },
      ]);
      setUserHasWritten(true); // Update the state to reflect the user has written.
      setLoadWritingGame(false);
    } catch (error) {
      await navigator.clipboard.writeText(finishText);
      console.error('Failed to write to eulogia:', error);
      alert(
        'Failed to write to eulogia. Please try again. Your writing is on the clipboard.'
      );
    }
  };

  var options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  };

  const writeOnEulogia = async () => {
    const writingGameParameters = {
      notebookType: 'eulogia',
      targetTime: 480,
      notebookTypeId: eulogia.eulogiaID,
      backgroundImage: eulogia.metadata.backgroundImage || null,
      prompt: eulogia.metadata.description,
      musicUrl: 'https://www.youtube.com/watch?v=HcKBDY64UN8',
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
        <div className='fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50'>
          <div className='bg-purple-200 relative overflow-y-scroll text-black rounded  p-6 w-1/2 h-2/3'>
            <p
              onClick={() => setIsModalOpen(false)}
              className='absolute top-1 cursor-pointer right-2 text-red-600 hover:text-red-800'
            >
              close
            </p>

            <div className='overflow-y-scroll h-9/12'>
              {displayModalMessage && displayModalMessage.content ? (
                displayModalMessage.content.includes('\n') ? (
                  displayModalMessage.content.split('\n').map((x, i) => (
                    <p className='my-2' key={i}>
                      {x}
                    </p>
                  ))
                ) : (
                  <p className='my-2'>{displayModalMessage.content}</p>
                )
              ) : null}
            </div>

            <p className='absolute w-full right-2 bottom-1 italic  flex flex-col'>
              <span className='text-xl mb-4'>
                {' '}
                {displayModalMessage.whoWroteIt}
              </span>
              <span className='text-sm'>
                {new Date(
                  displayModalMessage.timestamp * 1000
                ).toLocaleDateString('en-US', options)}
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
        <p className='text-white'>loading...</p>
      </div>
    );

  if (!eulogia)
    return (
      <div className='text-white'>
        <p>this eulogia doesn&apos;t exist.</p>
        <p>add it by clicking this button.</p>
        <Button
          buttonAction={() => router.push('/eulogias/new')}
          buttonText='add eulogia'
          buttonColor='bg-purple-600'
        />
      </div>
    );

  if (loadWritingGame)
    return (
      <div className='relative w-screen h-screen'>
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
    <div className='text-white'>
      <div className='flex flex-col'>
        <div className='p-2'>
          <h2 className='text-4xl my-2'>{eulogia.metadata.title}</h2>
          <p className='italic text-2xl mb-2'>{eulogia.metadata.description}</p>
          <div className='mb-4'>
            {messages.length} writing(s) of {eulogia.maxMessages} spots
          </div>
          <div className='mx-auto relative w-96 h-96 flex overflow-hidden border-white border rounded-xl justify-center'>
            <Image
              src={eulogia.metadata.coverImageUrl}
              fill
              alt='Eulogia Cover Image'
            />
          </div>
        </div>
        <div className='w-full flex justify-center flex-wrap mx-auto'>
          {messages.map((msg, index) => (
            <div
              className='p-2 w-8 flex justify-center items-center cursor-pointer h-8 mx-auto bg-purple-200 hover:bg-purple-400 m-2 rounded-xl text-black'
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
        <div className='p-2 h-full overflow-y-scroll my-0'>
          {!authenticated ? (
            <div>
              <p>
                you can write if you{' '}
                <span
                  className='text-orange-300 hover:text-orange-400 active:text-yellow-300 cursor-pointer'
                  onClick={login}
                >
                  login
                </span>
                .
              </p>
            </div>
          ) : userHasWritten ? (
            <div className='w-full'>
              <p>you already wrote here...</p>
            </div>
          ) : (
            <div className='my-0 h-full'>
              <p>You have been invited to write in this eulogia.</p>
              <p>
                What you will write here will stay forever associated with it.
              </p>
              <p>Are you ready?</p>
              <input
                type='text'
                className='my-2 p-2 w-full rounded-xl text-black'
                placeholder='your signature'
                value={whoIsWriting}
                onChange={e => setWhoIsWriting(e.target.value)}
              />
              {whoIsWriting && (
                <Button
                  buttonText={`Write and sign as ${whoIsWriting}`}
                  buttonColor='bg-purple-500 w-48 mx-auto'
                  buttonAction={writeOnEulogia}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className='w-96 mx-auto'>
        <div className='flex justify-center'>
          {authenticated && (
            <Button
              buttonText='my library'
              buttonColor='bg-orange-600 mb-2'
              buttonAction={() => router.push('/library')}
            />
          )}
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default IndividualEulogiaDisplayPage;
