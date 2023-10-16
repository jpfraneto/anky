import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from './Button';
import Spinner from './Spinner';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import WritingGameComponent from './WritingGameComponent';
import AnkyDementorsAbi from '../lib/ankyDementorsAbi.json'; // Assuming you have the ABI

const AnkyDementorPage = ({ setLifeBarLength, lifeBarLength }) => {
  const [response, setResponse] = useState(null); // Response from API
  const [time, setTime] = useState(0);
  const [text, setText] = useState('');
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [provider, setProvider] = useState(null);
  const [ankyDementorId, setAnkyDementorId] = useState(null);
  const [ankyDementorCreated, setAnkyDementorCreated] = useState(false);
  const [userOwnsDementor, setUserOwnsDementor] = useState(false);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function setup() {
      if (!thisWallet) return;
      console.log('INSIDE THE SETUP ');
      let fetchedProvider = await thisWallet.getEthersProvider();
      setProvider(fetchedProvider);

      let signer = await fetchedProvider.getSigner();

      const ankyDementorsContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
        AnkyDementorsAbi,
        signer
      );
      try {
        const [ownsDementor, dementorIndex] =
          await ankyDementorsContract.doesUserOwnAnkyDementor();
        if (!ownsDementor) {
          alert('the user doesnt own an anky dementor');
        } else {
          setUserOwnsDementor(true);
          setAnkyDementorId(dementorIndex);
        }
        setLoading(false);
      } catch (error) {
        console.log('there was an error here: ', error);
        setUserOwnsDementor(false);
        setLoading(false);
      }
    }
    setup();
  }, [thisWallet]);

  const submitWriting = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/tell-me-who-you-are`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        }
      );

      const responseData = await response.json();
      console.log('the response data is: ', responseData);

      setResponse(responseData); // Set parsed data directly to state
      setLoading(false);
    } catch (error) {
      console.error('Failed to submit writing:', error);
      setLoading(false);
    }
  };

  const writeOnNotebook = async () => {
    const writingGameParameters = {
      notebookType: 'anky-dementor',
      targetTime: 180,
      backgroundImage: null, // You can modify this if you have an image.
      prompt: 'tell me who you are', // You need to fetch and set the correct prompt.
      musicUrl: 'https://www.youtube.com/watch?v=HcKBDY64UN8',
      onFinish: createFirstUserAnkyDementor,
    };

    setWritingGameProps(writingGameParameters);
    setLoadWritingGame(true);
  };

  const createFirstUserAnkyDementor = async finishText => {
    try {
      console.log('inside the update notebook with page function');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/tell-me-who-you-are`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ finishText }),
        }
      );
      const { firstPageCid } = await response.json();
      console.log('in here, the cid is: ', firstPageCid);

      let signer = await provider.getSigner();
      const ankyDementorsContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
        AnkyDementorsAbi,
        signer
      );
      console.log(
        'right before creating the dementor notebook',
        ankyDementorsContract
      );
      const tx = await ankyDementorsContract.createAnkyDementorNotebook(
        firstPageCid
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find(
        e => e.event === 'DementorNotebookCreated'
      );

      if (event) {
        // Extract the tokenId from the event and set it to state
        const tokenId = event.args.tokenId;
        setAnkyDementorId(tokenId.toString());
      }
      console.log('after the response of creating the anky dementor notebook');
      setAnkyDementorCreated(true);
      setLoadWritingGame(false);
    } catch (error) {
      console.error('Failed to write to notebook:', error);
    }
  };

  if (loading)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading...</p>
      </div>
    );

  if (userOwnsDementor) {
    return (
      <div className='text-white'>
        <p>you already own a dementor!</p>
        <div>
          <Link href={`/dementor/${ankyDementorId}`} passHref>
            <Button
              buttonText='go to my anky dementor'
              buttonColor='bg-purple-600'
            />
          </Link>
        </div>
      </div>
    );
  }

  if (loadWritingGame)
    return (
      <WritingGameComponent
        {...writingGameProps}
        text={text}
        setLifeBarLength={setLifeBarLength}
        lifeBarLength={lifeBarLength}
        setText={setText}
        time={time}
        setTime={setTime}
        cancel={() => setLoadWritingGame(false)}
      />
    );
  return (
    <div className='text-white md:w-3/5 mx-auto'>
      {ankyDementorCreated ? (
        <div>
          <p>holy shit, your anky dementor was created.</p>
          <p>you can check its first page here:</p>
          <Link href={`/dementor/${ankyDementorId}`} passHref>
            <Button
              buttonText='go to my anky dementor'
              buttonColor='bg-purple-600'
            />
          </Link>
        </div>
      ) : (
        <div>
          <p>ARE YOU READY???</p>
          <Button
            buttonAction={writeOnNotebook}
            buttonText='LFG'
            buttonColor='bg-purple-600'
          />
        </div>
      )}
    </div>
  );
};

export default AnkyDementorPage;
