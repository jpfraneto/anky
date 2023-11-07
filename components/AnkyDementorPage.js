import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from './Button';
import Spinner from './Spinner';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import WritingGameComponent from './WritingGameComponent';
import AnkyDementorsAbi from '../lib/ankyDementorsAbi.json';
import { setUserData } from '../lib/idbHelper';
import { useUser } from '../context/UserContext';

const AnkyDementorPage = ({ setLifeBarLength, lifeBarLength }) => {
  const { getAccessToken, authenticated, user } = usePrivy();
  const [time, setTime] = useState(0);
  const [text, setText] = useState('');
  const [areYouSure, setAreYouSure] = useState(false);
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [ankyDementorId, setAnkyDementorId] = useState(null);
  const [ankyResponseIsReady, setAnkyResponseIsReady] = useState(false);
  const [ankyDementorCreated, setAnkyDementorCreated] = useState(false);
  const [userOwnsDementor, setUserOwnsDementor] = useState(false);
  const [responseFromAnkyReady, setResponseFromAnkyReady] = useState(false);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const { userAppInformation, setUserAppInformation } = useUser();
  const router = useRouter();
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  const writeOnNotebook = async () => {
    const writingGameParameters = {
      notebookType: 'anky-dementor',
      targetTime: 180,
      backgroundImage: null, // You can modify this if you have an image.
      prompt: 'tell me who you are', // You need to fetch and set the correct prompt.
      musicUrl: 'https://www.youtube.com/watch?v=HcKBDY64UN8',
      onFinish: createAnkyDementor,
    };

    setWritingGameProps(writingGameParameters);
    setLoadWritingGame(true);
  };

  const createAnkyDementor = async finishText => {
    try {
      const authToken = await getAccessToken();
      const provider = await thisWallet.getEthersProvider();

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
      setResponseFromAnkyReady(true);
      const { firstPageCid } = await response.json();
      setAnkyResponseIsReady(true);
      console.log('in here, the cid is: ', firstPageCid);

      let signer = await provider.getSigner();
      const ankyDementorsContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
        AnkyDementorsAbi,
        signer
      );
      console.log('the anky dementors contract is: ', ankyDementorsContract);

      const tx = await ankyDementorsContract.mintDementor(
        thisWallet.address,
        firstPageCid
      );
      const receipt = await tx.wait();
      console.log('the receipt is: ', receipt);
      const event = receipt.events?.find(e => e.event === 'DementorCreated');

      if (event) {
        console.log('the event is', event);
        // Extract the tokenId from the event and set it to state
        const newDementorId = event.args.dementorId;
        console.log('the new dementor id is: ', newDementorId);
        setAnkyDementorId(newDementorId.toString());

        const newDementor = {
          dementorId: newDementorId.toString(),
          currentPage: 0,
          firstPageCid: firstPageCid,
          pages: [
            {
              promptsCID: firstPageCid,
              userWritingCID: '',
              creationTimestamp: new Date().getTime(),
              writingTimestamp: 0,
            },
          ],
        };
        setUserAppInformation(x => {
          console.log(
            'the x in the user app information before adding a new dementor is: ',
            x
          );
          if (x.userDementors) {
            setUserData('userDementors', [...x.userDementors, newDementor]);
            return {
              ...x,
              userDementors: [...x.userDementors, newDementor],
            };
          } else {
            setUserData('userDementors', [newDementor]);
            return {
              ...x,
              userDementors: [newDementor],
            };
          }
        });
      }

      console.log('after the response of creating the anky dementor notebook');
      setAnkyDementorCreated(true);
      setLoadWritingGame(false);
    } catch (error) {
      console.error('Failed to write to dementor:', error);
    }
  };
  function messagesWhileUploading() {
    return (
      <div>
        {ankyResponseIsReady && (
          <div className=''>
            <p className='text-white mt-2'>
              anky already has your dementor notebook
            </p>
            <p className='text-white mt-2'>
              now it is going to store it on the eternal library
            </p>
          </div>
        )}
      </div>
    );
  }

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
        minimumWritingTime={3}
        setLifeBarLength={setLifeBarLength}
        messagesWhileUploading={messagesWhileUploading}
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
          <p className='mb-2'>your new dementor is ready.</p>
          <p className='mb-2'>
            with what you just wrote, a new writing container was created.
          </p>
          <p className='mb-2'>
            inside it, there are pages with prompts. each one of them designed
            to take you deeper into the process of self inquiry.
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

          <div className='w-full flex justify-center  my-2'>
            <div className='flex space-x-2 justify-center'>
              {areYouSure ? (
                <Button
                  buttonAction={writeOnNotebook}
                  buttonText='breathe deep and lets go'
                  buttonColor='bg-green-600 mx-2 '
                />
              ) : (
                <Button
                  buttonAction={() => setAreYouSure(true)}
                  buttonText='im ready'
                  buttonColor='bg-green-400 text-black mx-2'
                />
              )}
              <Link href='/library' passHref>
                <Button buttonText='library' buttonColor='bg-purple-600' />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnkyDementorPage;
