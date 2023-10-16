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
  const [loadingSavingNewPage, setLoadingSavingNewPage] = useState(false);
  const [loadingDementor, setLoadingDementor] = useState(true);
  const [dementorsContract, setDementorsContract] = useState(null);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [mintingNotebook, setMintingNotebook] = useState(false);
  const [userIsReadyToWrite, setUserIsReadyToWrite] = useState(false);
  const wallets = useWallets();

  const { id } = router.query;
  useEffect(() => {
    // setDementorData(dummyDementorData);
    // setLoadingDementor(false);
    // return;
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
    setDementorsContract(ankyDementorsContract);
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
      uploadDementorPageToSmartContract: uploadDementorPageToSmartContract,
    };
    setWritingGameProps(writingGameParameters);
    setUserIsReadyToWrite(true);
  }

  async function uploadDementorPageToSmartContract(finishText, prompts) {
    console.log(
      'sending text to chatgtp, and then updating the smart contract with these new cids.'
    );
    setLoadingSavingNewPage(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/get-subsequent-page`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ finishText, prompts }),
        }
      );
      console.log('before here', response);
      const responseData = await response.json();
      console.log('the response data is: ', responseData);
      const { thisWritingCid, newPageCid } = responseData;

      // HERE I NEED TO UPDATE THE USERS DEMENTOR WITH THIS NEW CID.
      console.log('this writing cid is: ', thisWritingCid);
      console.log('this new page cid is: ', newPageCid);

      //     function writeDementorPage(uint256 dementorNotebookId, string memory userWritingCID, string memory nextPromptCID) external onlyAnkyHolder {
      // ************************** //

      console.log('the dementors contract is: ', dementorsContract);
      console.log('this dementors id is: ', id);
      if (dementorsContract) {
        const tx = await dementorsContract.writeDementorPage(
          id,
          thisWritingCid,
          newPageCid
        );
        await tx.wait();
        console.log('after the response of writing in the dementor');

        setLoadingSavingNewPage(false);

        // ************************** //
      }
    } catch (error) {
      console.error('Failed to submit writing:', error);
      setLoadingSavingNewPage(false);
    }
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
        {...writingGameProps}
        prompts={dementorData.prompts.split('%%')}
        secondsPerPrompt={4}
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
      <div className='my-2 w-48 mx-auto'>
        <Button
          buttonText='im more than ready'
          buttonAction={userIsReadyToWriteTrigger}
          buttonColor='bg-green-600'
        />
      </div>
      {/* <div>
        {dementorData.prompts.split('%%').map((x, i) => {
          return (
            <p className='text-left' key={i}>
              {i + 1}. {x}
            </p>
          );
        })}
      </div> */}
    </div>
  );
}

export default DementorById;
