import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from './Button';
import Spinner from './Spinner';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import WritingGameComponent from './WritingGameComponent';
import AnkyDementorsAbi from '../lib/ankyDementorsAbi.json'; // Assuming you have the ABI
import { useUser } from '../context/UserContext';

const AnkyDementorPage = ({ setLifeBarLength, lifeBarLength }) => {
  const { getAccessToken, authenticated, user } = usePrivy();
  const [response, setResponse] = useState(null); // Response from API
  const [time, setTime] = useState(0);
  const [text, setText] = useState('');
  const [areYouSure, setAreYouSure] = useState(false);
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [provider, setProvider] = useState(null);
  const [ankyDementorId, setAnkyDementorId] = useState(null);
  const [ankyDementorCreated, setAnkyDementorCreated] = useState(false);
  const [userOwnsDementor, setUserOwnsDementor] = useState(false);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const { setUserAppInformation } = useUser();
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
      console.log('sending this thing.');
      const authToken = await getAccessToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/tell-me-who-you-are`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            finishText,
            userDid: user.id.split('did:privy:')[1],
          }),
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

        const newDementor = {
          dementorId: tokenId.toString(),
          currentPage: 0,
          introCID: firstPageCid,
          pages: [
            {
              promptCID: firstPageCid,
              userWritingCID: '',
              creationTimestamp: new Date().getTime(),
              writingTimestamp: 0,
            },
          ],
        };

        setUserAppInformation(x => {
          setUserData('userDementors', [newDementor]);

          return {
            ...x,
            userDementors: [newDementor],
          };
        });
      }

      console.log('after the response of creating the anky dementor notebook');
      setAnkyDementorCreated(true);
      setLoadWritingGame(false);
    } catch (error) {
      console.error('Failed to write to dementor:', error);
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
      <div className='text-white mt-2'>
        <p className='mb-2'>you already own a dementor!</p>
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
        minimumWritingTime={3}
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
        <div className='py-2 mt-8'>
          <p className='mb-2'>
            wow, congratulations. your anky dementor is ready.
          </p>
          <p className='mb-2'>
            with what you just wrote, a new writing container was created.
          </p>
          <p className='mb-2'>
            inside it, there are 8 prompts. each one of them designed to take
            you deeper into the process of self inquiry.
          </p>
          <p className='mb-2'>
            treat coming here as the most important meditation practice of your
            life.
          </p>
          <p className='mb-2'>
            this is for those who really want to get to the bottom of their
            relationship with themselves.
          </p>
          <div className='w-96 mx-auto'>
            <Link href={`/dementor/${ankyDementorId}`} passHref>
              <Button
                buttonText='go to my anky dementor'
                buttonColor='bg-purple-600'
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className='my-2'>
          <p>welcome to the most important practice of your life.</p>
          <p>are you ready?</p>
          <p>write as if there was no tomorrow.</p>
          <p>your target is 180 seconds.</p>
          <p>just write.</p>
          <p>whatever comes.</p>
          <div className='w-96 mx-auto my-2 flex justify-around'>
            {areYouSure ? (
              <Button
                buttonAction={writeOnNotebook}
                buttonText='breathe deep and lets go'
                buttonColor='bg-green-600'
              />
            ) : (
              <Button
                buttonAction={() => setAreYouSure(true)}
                buttonText='im ready'
                buttonColor='bg-green-400'
              />
            )}
            <Link href='/library' passHref>
              <Button buttonText='library' buttonColor='bg-purple-600' />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnkyDementorPage;
