import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import AnkyEulogiasAbi from '../../lib/eulogiaABI.json';
import { useRouter } from 'next/router';
import { processFetchedEulogia } from '../../lib/notebooks.js';
import { ethers } from 'ethers';
import Button from '../Button';
import Image from 'next/image';
import Spinner from '../Spinner';
import WritingGameComponentMobile from '../WritingGameComponentMobile';

var options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

const IndividualEulogiaDisplayPageMobile = ({
  setLifeBarLength,
  lifeBarLength,
}) => {
  const { login, authenticated, loading } = usePrivy();
  const router = useRouter();
  const [eulogia, setEulogia] = useState(null);
  const [thisEulogia, setThisEulogia] = useState(null);
  const [expanded, setExpanded] = useState(null); // add this line
  const [pageLoading, setPageLoading] = useState(true);
  const [eulogiaLoading, setEulogiaLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
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

  useEffect(() => {
    async function fetchEulogia() {
      try {
        console.log('IN HERE', eulogia, router, authenticated);
        if (eulogia) return;
        console.log('after this one');
        if (!router.query) return;
        console.log('after the second one');
        if (!authenticated && !loading) {
          console.log('inside here');
          const serverResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/eulogia/${router.query.id}`
          );
          const data = await serverResponse.json();
          data.eulogia.eulogiaId = router.query.id;
          setEulogia(data.eulogia);
          setMessages(data.eulogia.messages);
          setPageLoading(false);
        } else {
          if (!thisWallet) return;
          console.log('in hereeeee', thisWallet);
          let fetchedProvider = await thisWallet.getEthersProvider();
          console.log('THE FETCHED PROVIDER IS: ', fetchedProvider);
          setProvider(fetchedProvider);
          let signer = await fetchedProvider.getSigner();

          const eulogiasContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
            AnkyEulogiasAbi,
            signer
          );
          console.log('the router query is: ', router.query.id);
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
            console.log('right before the set eulogia', formattedEulogia);
            setEulogia(formattedEulogia);

            setMessages(formattedEulogia.messages);

            const userMessage = formattedEulogia.messages.find(
              msg => msg.writer === thisWallet.address
            );
            setUserHasWritten(Boolean(userMessage));
            setEulogiaLoading(false);
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
    let signer = await provider.getSigner();
    const eulogiasContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
      AnkyEulogiasAbi,
      signer
    );
    await eulogiasContract.mintEulogiaToAnky(eulogia.eulogiaID);
    alert('Eulogia minted successfully!');
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
      let signer;
      console.log('IN HERE, THE PROVIDER IS: ', provider);
      if (!provider) {
        const newProvider = await thisWallet.getEthersProvider();
        signer = await newProvider.getSigner();
      } else {
        signer = await provider.getSigner();
      }
      console.log('THE SIGNER IS: ', signer);
      // Step 2: Send the CID to the smart contract.

      const eulogiasContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
        AnkyEulogiasAbi,
        signer
      );
      console.log('the eulogia is: ', eulogia);

      const eulogiaNumber =
        Number(eulogia.eulogiaID) || Number(router.query.id);
      console.log('the eulogia number is: ', eulogiaNumber);
      console.log('the eulogias contract is: ', eulogiasContract);
      const tx = await eulogiasContract.addMessage(
        eulogiaNumber,
        cid,
        whoIsWriting
      );
      await tx.wait();
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
      console.error('Failed to write to eulogia:', error);
      alert('Failed to write to eulogia. Please try again.');
    }
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

  const toggleExpand = index => {
    // add this function
    setExpanded(expanded === index ? null : index);
  };

  if (pageLoading)
    return (
      <div>
        <Spinner />
        <p className='text-black'>loading...</p>
      </div>
    );

  if (!eulogia)
    return (
      <div className='text-black'>
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
        <WritingGameComponentMobile
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
    <div className='text-black w-screen'>
      <div className='flex flex-col '>
        <div className='p-4 text-center'>
          <h2 className='text-2xl my-2 '>{eulogia.metadata.title}</h2>
          <p className='italic text-2xl'>{eulogia.metadata.description}</p>
          <div className='mb-4'>
            {messages.length} writing(s) of {eulogia.maxMessages}
          </div>
          <div className='mx-auto flex overflow-hidden rounded-xl justify-center'>
            <Image
              src={eulogia.metadata.coverImageUrl}
              width={333}
              height={333}
              alt='Eulogia Cover Image'
            />
          </div>
        </div>
        <div className='p-4 h-full overflow-y-scroll'>
          {wallets.length === 0 ? (
            <div>
              <p>Please login to write on this eulogia.</p>
              <div className='w-2/4 mx-auto mt-2'>
                <Button
                  buttonAction={login}
                  buttonText='login'
                  buttonColor='bg-purple-400'
                />
              </div>
            </div>
          ) : userHasWritten ? (
            <div>
              <p className='mt-2'>You already wrote here.</p>
              <div className='w-full mx-auto'>
                {messages.map((msg, i) => {
                  console.log('the msg is: ', msg);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleExpand(i)}
                      className={`${
                        msg ? 'bg-amber-300' : 'bg-amber-200'
                      } w-full p-2 mx-auto mt-4 pb-12 flex flex-col relative items-start rounded-2xl transition-all duration-300 ${
                        expanded === i ? 'h-auto' : `${msg ? 'h-32' : 'h-8'}`
                      } active:bg-amber-400`}
                    >
                      {msg ? (
                        expanded === i ? (
                          <p className='w-full'>{msg.content}</p>
                        ) : (
                          <p className='w-full'>
                            {msg.content.slice(0, 50)}...
                          </p>
                        )
                      ) : (
                        <div className='w-full h-full bg-amber-200' />
                      )}
                      {msg && (
                        <p className='absolute bottom-1 text-gray-500 text-xs right-1'>
                          {new Date(msg.timestamp * 1000).toLocaleDateString(
                            'en-US',
                            options
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className='my-2 h-full'>
              <p className='my-2'>
                You have been invited to write in this eulogia.
              </p>
              <p className='my-2'>
                What you will write here will stay forever associated with it.
              </p>
              <input
                type='text'
                className='my-2 p-2 w-full rounded-xl border border-black text-black'
                placeholder='how do you want to sign?'
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
      {userHasWritten && (
        <div className='w-screen px-3'>
          <div className='flex'>
            <Button
              buttonText={linkCopied ? `copied` : `share eulogia link`}
              buttonColor='bg-purple-600 mb-2'
              buttonAction={copyEulogiaLink}
            />
          </div>

          <p className='text-center mb-3'>
            anyone with the link will be able to write here
          </p>
        </div>
      )}
    </div>
  );
};

export default IndividualEulogiaDisplayPageMobile;
