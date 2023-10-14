import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from './Button';
import Spinner from './Spinner';
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
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function setup() {
      if (!thisWallet) return;
      return setLoading(false);
      let fetchedProvider = await thisWallet.getEthersProvider();
      setProvider(fetchedProvider);
      let signer = await fetchedProvider.getSigner();

      const ankyDementorsContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
        AnkyDementorsAbi,
        signer
      );

      const userDementor = ankyDementorsContract.doesUserOwnAnkyDementor();
      if (!userDementor) {
        alert('the user doesnt own an anky dementor');
      } else {
        alert('you already own one of these!');
      }
      setLoading(false);
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
      //   let signer = await provider.getSigner();

      //   const ankyDementorsContract = new ethers.Contract(
      //     process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
      //     AnkyDementorsAbi,
      //     signer
      //   );
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
      const { cid } = await response.json();
      console.log('in here, the cid is: ', cid);
      let signer = await provider.getSigner();
      const ankyDementorsContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
        AnkyDementorsAbi,
        signer
      );

      const tx = await ankyDementorsContract.createAnkyDementorNotebook(cid);
      await tx.wait();
      console.log('after the response of creating the anky dementor notebook');

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
      <p>ARE YOU READY???</p>
      <Button
        buttonAction={writeOnNotebook}
        buttonText='LFG'
        buttonColor='bg-purple-600'
      />
    </div>
  );
};

export default AnkyDementorPage;
