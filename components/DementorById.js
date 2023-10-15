import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../components/Button';
import AnkyDementorsAbi from '../lib/ankyDementorsAbi.json'; // Assuming you have the ABI
import { useUser } from '../context/UserContext';
import { processFetchedDementor } from '../lib/notebooks.js';
import Spinner from './Spinner';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import DementorGame from './DementorGame';

const dummyDementorData = {
  title: 'The Eternal Exploration',
  description:
    'This chapter explores the continuous journey of self-exploration, embracing the beauty of each moment and the willingness to transform.',
  prompts:
    'What does it mean to live in the present moment?%%What is the gift of this moment?%%How does self-inquiry lead to transformation?%%What is the beauty of becoming the present moment?%%How does the willingness to explore shape our experiences?%%What is the importance of the practice and repetition in self-exploration?%%How does the perception of words and experiences evolve over time?%%Why is the quest for self-knowledge essential for authentic connection?',
};

function DementorById({
  userAnky,
  router,
  alchemy,
  setLifeBarLength,
  lifeBarLength,
}) {
  const { authenticated, login } = usePrivy();
  const [dementorData, setDementorData] = useState(null);
  const [text, setText] = useState('');
  const [time, setTime] = useState(0);
  const [loadingDementor, setLoadingDementor] = useState(true);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [mintingNotebook, setMintingNotebook] = useState(false);
  const [userIsReadyToWrite, setUserIsReadyToWrite] = useState(false);

  console.log('the router is: ', router);
  const { id } = router.query;
  useEffect(() => {
    setDementorData(dummyDementorData);
    setLoadingDementor(false);
    return;
    if (id && userAnky.wallet) fetchDementorData(id);
  }, [id, userAnky]);

  async function fetchDementorData(dementorId) {
    console.log('inside the fetch dementor data', userAnky);
    if (!userAnky && !userAnky.wallet && !userAnky.wallet.getEthersProvider)
      return;
    let provider = await userAnky.wallet?.getEthersProvider();
    let signer;

    if (provider) {
      signer = await provider.getSigner();
    } else {
      return;
    }
    console.log('before calling the anky dementors contract', provider);
    const ankyDementorsContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
      AnkyDementorsAbi,
      signer
    );
    console.log('the dementor id', dementorId);
    const data = await ankyDementorsContract.getCurrentPage(dementorId);
    console.log(
      'in here, the data of the page that comes in the dementor is, ',
      data
    );
    const processedData = await processFetchedDementor(data);
    console.log('the data is:', processedData);
    setDementorData(processedData);
    setLoadingDementor(false);
  }

  async function userIsReadyToWriteTrigger() {
    const writingGameParameters = {
      notebookType: 'dementor',
      backgroundImage: null, // You can modify this if you have an image.
      onFinish: uploadDementorPageToSmartContract,
    };
    setWritingGameProps(writingGameParameters);
    setUserIsReadyToWrite(true);
  }

  async function uploadDementorPageToSmartContract() {
    // EDIT THIS FUNCTION
  }

  if (loadingDementor)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading</p>
      </div>
    );

  if (userIsReadyToWrite) {
    return (
      <DementorGame
        prompts={dementorData.prompts.split('%%')}
        secondsPerPrompt={180}
        {...writingGameProps}
        text={text}
        setLifeBarLength={setLifeBarLength}
        lifeBarLength={lifeBarLength}
        setText={setText}
        time={time}
        setTime={setTime}
        cancel={() => setUserIsReadyToWrite(false)}
      />
    );
  }

  return (
    <div className='md:w-1/2 p-2 mx-auto w-screen text-black md:text-white pt-5'>
      <h2 className='text-3xl'>{dementorData.title}</h2>
      <p className='italic'>{dementorData.description}</p>
      <Button
        buttonText='im more than ready'
        buttonAction={userIsReadyToWriteTrigger}
        buttonColor='bg-green-600'
      />
    </div>
  );
}

export default DementorById;
