import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import AnkyEulogiasAbi from '../../lib/eulogiaABI.json';
import { useRouter } from 'next/router';
import { processFetchedEulogia } from '../../lib/notebooks.js';
import { ethers } from 'ethers';
import Button from '../Button';
import WritingGameComponent from '../WritingGameComponent';

const IndividualEulogiaDisplayPage = ({ setLifeBarLength, lifeBarLength }) => {
  const router = useRouter();
  const [eulogia, setEulogia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
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

        let fetchedProvider = await thisWallet.getEthersProvider();
        setProvider(fetchedProvider);
        let signer = await fetchedProvider.getSigner();

        const eulogiasContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
          AnkyEulogiasAbi,
          signer
        );

        console.log(router);
        const eulogiaID = router.query.id;
        const thisEulogia = await eulogiasContract.getEulogia(eulogiaID);
        const formattedEulogia = await processFetchedEulogia(thisEulogia);
        formattedEulogia.eulogiaID = eulogiaID;

        if (formattedEulogia) {
          setEulogia(formattedEulogia);
          setLoading(false);
          const allMessages = await eulogiasContract.getAllMessages(eulogiaID);
          console.log('all the messages are: ', allMessages);
          setMessages(allMessages);

          const userMessage = allMessages.find(
            msg => msg.writer === thisWallet.address
          );
          setUserHasWritten(Boolean(userMessage));
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

  const onFinish = async () => {
    try {
      // Step 1: Send the text to the backend to be stored on Arweave.
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/eulogia/writing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text }),
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
        'aloja',
        cid,
        whoIsWriting
      ); // Replace "YourPasswordHere" and "UserAliasOrName" appropriately.
      await tx.wait();

      alert('Your writing has been successfully added to the eulogia.');
      setUserHasWritten(true); // Update the state to reflect the user has written.
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
    console.log('the writing game parameters are :', writingGameParameters);
    setLoadWritingGame(true);
  };

  if (loading) return <p>loading...</p>;

  console.log('The eulogia is: ', eulogia);

  if (loadWritingGame)
    return (
      <div className='relative w-screen h-screen'>
        <WritingGameComponent
          {...writingGameProps}
          text={text}
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
      <h2 className='text-4xl my-2'>{eulogia.metadata.title}</h2>
      <p className='italic text-2xl mb-4'>{eulogia.metadata.description}</p>
      {wallets.length === 0 ? (
        <p>Please log in to interact with this eulogia.</p>
      ) : userHasWritten ? (
        <div>
          <p>You have already written in this eulogia.</p>
          <Button
            buttonText='Mint Eulogia'
            buttonColor='bg-purple-500 w-48 mx-auto'
            buttonAction={mintEulogia}
          />
          {messages.map((msg, index) => (
            <div key={index}>
              <h3>Message by: {msg.whoWroteIt}</h3>
              <p>{msg.cid}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p>You have been invited to write in this eulogia.</p>
          <p>What you will write here will stay forever associated with it.</p>
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
  );
};

export default IndividualEulogiaDisplayPage;
