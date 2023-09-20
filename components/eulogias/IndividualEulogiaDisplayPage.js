import React, { useState, useEffect } from 'react';
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
  const router = useRouter();
  const [eulogia, setEulogia] = useState(null);
  const [loading, setLoading] = useState(true);
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
        if (thisEulogia.metadataURI === '') return setLoading(false);
        const formattedEulogia = await processFetchedEulogia(thisEulogia);
        formattedEulogia.eulogiaID = eulogiaID;

        formattedEulogia.metadata.backgroundImageUrl = `https://ipfs.io/ipfs/${formattedEulogia.metadata.backgroundImageCid}`;
        formattedEulogia.metadata.coverImageUrl = `https://ipfs.io/ipfs/${formattedEulogia.metadata.coverImageCid}`;

        const response = await fetch(
          formattedEulogia.metadata.backgroundImageUrl
        );
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setPreloadedBackground(imageUrl);

        if (formattedEulogia) {
          console.log('the formatted eulogia is: ', formattedEulogia);
          setEulogia(formattedEulogia);
          setLoading(false);
          const allMessages = await eulogiasContract.getAllMessages(eulogiaID);
          console.log('all the messages are: ', allMessages);
          const formattedMessages = allMessages.map(messageArray => ({
            writer: messageArray[0],
            whoWroteIt: messageArray[1],
            cid: messageArray[2],
            timestamp: ethers.utils.formatUnits(messageArray[3], 0),
          }));
          console.log('the formatted messages are: ', formattedMessages);
          // Initiate fetching of content for each message from Arweave
          const contentPromises = formattedMessages.map(msg =>
            getContentFromArweave(msg.cid)
          );
          const contents = await Promise.all(contentPromises);

          // Augment the messages with the content fetched
          formattedMessages.forEach((msg, index) => {
            msg.text = contents[index];
          });

          setMessages(formattedMessages);

          const userMessage = formattedMessages.find(
            msg => msg.writer === thisWallet.address
          );
          setUserHasWritten(Boolean(userMessage));
          setLoading(false);
        } else {
          throw Error('No eulogia');
        }
      } catch (error) {
        console.log(error);
        console.log('There was an error.');
      }
    }
    fetchEulogia();
  }, [thisWallet]);

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
          body: JSON.stringify({ text: finishText }),
        }
      );

      const { cid } = await response.json();
      let signer = await provider.getSigner();
      // Step 2: Send the CID to the smart contract.
      const eulogiasContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
        AnkyEulogiasAbi,
        signer
      );

      console.log('the eulogias contract is: ', eulogiasContract);

      const tx = await eulogiasContract.addMessage(
        eulogia.eulogiaID,
        cid,
        whoIsWriting
      );
      await tx.wait();

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
      onFinish,
    };
    setWritingGameProps(writingGameParameters);
    setLoadWritingGame(true);
  };

  const copyEulogiaLink = async () => {
    console.log('the router is: ', router);
    await navigator.clipboard.writeText(
      `https://www.anky.lat/${router.asPath}`
    );
    setLinkCopied(true);
  };

  if (loading)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading...</p>
      </div>
    );

  console.log('The eulogia is: ', eulogia);
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
      <div className='flex '>
        <div className='p-2'>
          <h2 className='text-4xl my-2'>{eulogia.metadata.title}</h2>
          <p className='italic text-2xl mb-2'>{eulogia.metadata.description}</p>
          <div className='mb-4'>
            {eulogia.messageCount} writing of {eulogia.maxMessages}
          </div>
          <div className='mx-auto flex overflow-hidden rounded-xl justify-center'>
            <Image
              src={eulogia.metadata.coverImageUrl}
              width={356}
              height={555}
              alt='Eulogia Cover Image'
            />
          </div>
        </div>
        <div className='p-2 h-full overflow-y-scroll my-2'>
          {wallets.length === 0 ? (
            <p>Please log in to interact with this eulogia.</p>
          ) : userHasWritten ? (
            <div>
              <p className='mt-4'>You already wrote here:</p>
              <div className='w-96 mx-auto'>
                {messages.map((msg, index) => (
                  <div
                    className='p-2 w-96 mx-auto bg-purple-200 m-2 rounded-xl text-black'
                    key={index}
                  >
                    <p>{msg.text}</p>

                    <h3 className='ml-auto text-right italic'>
                      {msg.whoWroteIt}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='my-4 h-full'>
              <p>You have been invited to write in this eulogia.</p>
              <p>
                What you will write here will stay forever associated with it.
              </p>
              <p>Are you ready?</p>
              <input
                type='text'
                className='my-2 p-2 w-full rounded-xl text-black'
                placeholder='your signature'
                onChange={e => setWhoIsWriting(e.target.value)}
              />
              <Button
                buttonText={`Write and sign as ${whoIsWriting}`}
                buttonColor='bg-purple-500 w-48 mx-auto'
                buttonAction={writeOnEulogia}
              />
            </div>
          )}
        </div>
      </div>
      <div className='w-64 mx-auto'>
        <Button
          buttonText={linkCopied ? `copied` : `share eulogia link`}
          buttonColor='bg-purple-600 mb-2'
          buttonAction={copyEulogiaLink}
        />
        <p>anyone with the link will be able to write</p>
      </div>
    </div>
  );
};

export default IndividualEulogiaDisplayPage;
