import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Link from 'next/link';
import { WebIrys } from '@irys/sdk';
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

function DementorPage({
  userAnky,
  router,
  alchemy,
  setLifeBarLength,
  lifeBarLength,
}) {
  const { authenticated, login, getAccessToken } = usePrivy();
  const [dementorData, setDementorData] = useState(null);
  const [text, setText] = useState('');
  const [time, setTime] = useState(0);
  const [dementorPageForDisplay, setDementorPageForDisplay] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSavingNewPage, setLoadingSavingNewPage] = useState(false);
  const [loadingDementor, setLoadingDementor] = useState(true);
  const [dementorsContract, setDementorsContract] = useState(null);
  const [isUserSureThatUserIsReady, setIsUserSureThatUserIsReady] =
    useState(false);
  const [showInformation, setShowInformation] = useState(false);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [dementorWasUpdated, setDementorWasUpdated] = useState(false);
  const [mintingNotebook, setMintingNotebook] = useState(false);
  const [userIsReadyToWrite, setUserIsReadyToWrite] = useState(false);

  const [dementorPagePromptsForDisplay, setDementorPagePromptsForDisplay] =
    useState([]);
  const [dementorPageAnswersForDisplay, setDementorPageAnswersForDisplay] =
    useState([]);

  const wallets = useWallets();
  console.log('the wallets are: ', wallets);
  const thisWallet = wallets.wallets[0];

  const { id } = router.query;

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setDementorPageAnswersForDisplay([]);
    setDementorPagePromptsForDisplay([]);
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
    if (id && thisWallet) fetchDementorData(id);
  }, [id, thisWallet]);

  async function fetchDementorData(dementorId) {
    console.log('inside the fetch dementor data', userAnky);
    if (!thisWallet.address) return;
    let provider = await thisWallet?.getEthersProvider();
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
    console.log('the dementors contract is: ', ankyDementorsContract);
    console.log('the dementor id', dementorId);
    let formattedDementorId = dementorId;

    const dementorData = await ankyDementorsContract.getDementor(
      formattedDementorId
    );
    console.log('the dementor data is: ', dementorData);
    const processedDementor = await processFetchedDementor(dementorData);
    console.log('the processed dementor is: ', processedDementor);

    setDementorData(processedDementor);
    setLoadingDementor(false);
  }

  async function userIsReadyToWriteTrigger() {
    const writingGameParameters = {
      notebookType: 'dementor',
      backgroundImage: null, // You can modify this if you have an image.
      uploadDementorPage: uploadDementorPage,
    };
    setWritingGameProps(writingGameParameters);
    setUserIsReadyToWrite(true);
  }

  async function uploadDementorPage(finishText, prompts) {
    console.log(
      'sending text to chatgtp, and then updating the smart contract with these new cids.'
    );
    setLoadingSavingNewPage(true);
    try {
      const authToken = await getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/get-subsequent-page`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ finishText, prompts }),
        }
      );
      const responseData = await response.json();
      console.log('the response data is: ', responseData);
      /// now this needs to be sent to irys

      console.log('inside the update dementor with page function', finishText);
      const getWebIrys = async () => {
        // Ethers5 provider
        // await window.ethereum.enable();
        if (!thisWallet) return;
        // const provider = new providers.Web3Provider(window.ethereum);
        const provider = await thisWallet.getEthersProvider();

        const url = 'https://node2.irys.xyz';
        const token = 'ethereum';
        const rpcURL = 'https://rpc-mumbai.maticvigil.com'; // Optional parameter

        // Create a wallet object
        const wallet = { rpcUrl: rpcURL, name: 'ethersv5', provider: provider };
        // Use the wallet object
        const webIrys = new WebIrys({ url, token, wallet });
        await webIrys.ready();
        return webIrys;
      };
      const webIrys = await getWebIrys();

      console.log('JHSALCHSAKJHCAS', dementorData.pages);
      let previousPageCid;
      if (dementorData.pages.length > 0) {
        previousPageCid =
          dementorData.pages[demedementorDatantor.pages.length - 1].cid;
      }
      const tags = [
        { name: 'Content-Type', value: 'text/plain' },
        { name: 'application-id', value: 'Anky Dementors' },
        { name: 'container-type', value: 'dementor' },
        { name: 'container-id', value: router.query.id.toString() },
        { name: 'page-number', value: dementorData.pages.length.toString() },
        // how can i embed the prompts and answers mechanism in this container? that's tricky. perhaps they don't need to be inside the same page. perhaps the paging mechanism doesn't make sense here. but how can i do it? i'm not sure.
        { name: 'dementor-prompt', value: 'true' },
        { name: 'dementor-answer', value: 'false' },
        // what is the CID from the previous page? this is where the provenance plays an important role and needs to be taken care of.
        {
          name: 'previous-page',
          value: previousPageCid.toString(),
        },
      ];
      console.log('right after the tags', tags);
      try {
        const receipt = await webIrys.upload(finishText, { tags });
        console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
        let newDementorPage;
        setUserAppInformation(x => {
          // Find the specific journal index by its id
          const dementorIndex = x.userDementors.findIndex(
            j => j.dementorId == router.query.id
          );

          newDementorPage = {
            timestamp: new Date().getTime(),
            pageNumber: journal.entries.length,
            previousPageCid: previousPageCid,
            cid: receipt.id,
          };

          // If the journal is found
          if (dementorIndex !== -1) {
            const updatedDementor = {
              ...x.userDementors[dementorIndex],
              pages: [...x.userDementors[dementorIndex].pages, newDementorPage],
            };

            const updatedUserDementors = [
              ...x.userDementors.slice(0, dementorIndex),
              updatedDementor,
              ...x.userDementors.slice(dementorIndex + 1),
            ];

            setUserData('userDementors', updatedUserDementors);

            return {
              ...x,
              userDementors: updatedUserDementors,
            };
          }

          // Return the original state if the journal isn't found (for safety)
          return x;
        });

        setJournal(x => {
          return {
            ...x,
            entries: [...journal.entries, newJournalEntry],
          };
        });
        setLifeBarLength(0);
        setLoadWritingGame(false);
        console.log('after the setloadwrtinggame put into false');
      } catch (e) {
        console.log('Error uploading data ', e);
      }

      // const { thisWritingCid, newPageCid } = responseData;

      // if (!thisWritingCid || !newPageCid)
      //   throw new Error('There was an error getting the cids for this.');

      // console.log('this writing cid is: ', thisWritingCid);
      // console.log('this new page cid is: ', newPageCid);

      // console.log('the dementors contract is: ', dementorsContract);
      // console.log('this dementors id is: ', id);
      // if (dementorsContract) {
      //   const tx = await dementorsContract.writeDementorPage(
      //     id,
      //     thisWritingCid,
      //     newPageCid
      //   );
      //   await tx.wait();

      //   setLoadingSavingNewPage(false);
      //   setUserIsReadyToWrite(false);
      //   setDementorWasUpdated(true);
      // ************************** //
    } catch (error) {
      console.error('Failed to submit writing:', error);
      setLoadingSavingNewPage(false);
    }
  }

  function renderModal() {
    if (!dementorPageForDisplay || !dementorPageForDisplay.prompts) return;
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
            {dementorPagePromptsForDisplay.map((prompt, index) => {
              console.log('the prompt is. ', prompt);
              return (
                <div className='my-2 p-2 bg-slate-200 rounded-xl' key={index}>
                  <h2 className='mb-2 text-left text-xl text-yellow-800'>
                    {index}. {prompt}
                  </h2>
                  <p className='mb-2 text-sm text-left'>
                    {dementorPageAnswersForDisplay[index]}
                  </p>
                </div>
              );
            })}
            <div className='flex  mx-auto  w-96 justify-center'>
              <Button
                buttonAction={() => setIsModalOpen(false)}
                buttonColor='bg-red-600'
                buttonText='close'
              />
            </div>
          </div>
        </div>
      )
    );
  }

  if (!authenticated) {
    return (
      <div className='text-white mt-3'>
        <p>you need to login first</p>
      </div>
    );
  }

  if (loadingDementor)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading</p>
      </div>
    );

  if (dementorWasUpdated) {
    return (
      <div className='text-white my-2'>
        {/* <p>
          The dementor was updated. The new page of lunamaria&apos;s story is:
        </p> */}
        <p>
          come back tomorrow and keep the inquiry going. this is more powerful
          than what you can imagine.
        </p>
        <div className='my-2 w-36 mx-auto'>
          <Link passHref href='/library'>
            <Button buttonText='library' buttonColor='bg-purple-600' />
          </Link>
        </div>
      </div>
    );
  }

  if (userIsReadyToWrite) {
    console.log('in here, the dementor data is: ', dementorData);
    return (
      <DementorGame
        {...writingGameProps}
        prompts={dementorData.pages[dementorData.pages.length - 1].prompts}
        secondsPerPrompt={2}
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
      <button onClick={() => console.log(dementorData)}>console</button>
      <div className='flex space-x-2'>
        {dementorData.pages.map((x, i) => {
          return (
            <p
              className={`p-3 w-8 flex items-center justify-center hover:opacity-70 cursor-pointer h-8 rounded-full ${
                dementorData.currentPage == i
                  ? 'bg-purple-400'
                  : 'bg-purple-600'
              }`}
              key={i}
              onClick={() => {
                if (dementorData.currentPage == i) {
                  return alert('This is the page that comes now');
                } else {
                  setDementorPageAnswersForDisplay(
                    dementorData.pages[i].writings || []
                  );
                  setDementorPagePromptsForDisplay(
                    dementorData.pages[i].prompts
                  );
                  setDementorPageForDisplay(x);
                  setIsModalOpen(true);
                }
              }}
            >
              {i}
            </p>
          );
        })}
      </div>
      <div className='my-2 w-96 flex justify-center mx-auto'>
        {!isUserSureThatUserIsReady ? (
          <Button
            buttonText={`im ready to write page ${
              dementorData.pages.length - 1
            }`}
            buttonAction={() => setIsUserSureThatUserIsReady(true)}
            buttonColor='bg-green-700'
          />
        ) : (
          <Button
            buttonText='lets do this'
            buttonAction={userIsReadyToWriteTrigger}
            buttonColor='bg-green-600'
          />
        )}

        <Link passHref href='/library'>
          <Button buttonText='library' buttonColor='bg-purple-600' />
        </Link>
        <Button
          buttonAction={() => setShowInformation(x => !x)}
          buttonText='?'
          buttonColor='bg-transparent border border-white text-white hover:bg-purple-200 hover:text-black'
        />
      </div>
      {showInformation && (
        <div className=''>
          <p className='mt-2  '>each page in a dementor has 8 prompts.</p>
          <p className='mt-1'>each writing session lasts 24 minutes.</p>
          <p className='mt-1'>3 minutes per prompt.</p>
          <p className='mt-1'>each one a journey into yourself.</p>
          <p className='mt-1'>bringing out everything that you have inside.</p>
          <p className='mt-1'>*****</p>
          <h2 className='text-xl my-1'>instructions</h2>
          <p className='mt-1'>
            just write, doing the best you can to answer the prompt at hand.
          </p>
          <p className='mt-1'>
            when you reach the 180 second mark, the time will stop, the
            container will block, and youll have time to read the next one.
          </p>
          <p className='mt-1'>
            when you are ready, just press the space bar and continue writing.
          </p>
          <p className='mt-1'>you&apos;ll understand the mechanics fast.</p>
        </div>
      )}
      {isModalOpen && renderModal()}
    </div>
  );
}

export default DementorPage;
