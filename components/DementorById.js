import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Link from 'next/link';
import { WebIrys } from '@irys/sdk';
import { setUserData } from '../lib/idbHelper';
import Button from '../components/Button';
import { getDementorInfoFromIrys } from '../lib/irys.js';
import AnkyDementorsAbi from '../lib/ankyDementorsAbi.json'; // Assuming you have the ABI
import { useUser } from '../context/UserContext';
import { getIndividualDementorFormatted } from '../lib/notebooks.js';
import Spinner from './Spinner';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import DementorGame from './DementorGame';

const secondsPerPrompt = 10;

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
  // const [time, setTime] = useState(0);
  const [time, setTime] = useState(secondsPerPrompt);
  const { setUserAppInformation, userAppInformation } = useUser();
  const [dementorPageForDisplay, setDementorPageForDisplay] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dementorDoesntExist, setDementorDoesntExist] = useState(false);
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

  const handleKeyDown = event => {
    if (event.key === 'ArrowLeft') {
      setDementorData(prevDementorData => {
        setDementorPageForDisplay(thisPage => {
          console.log(
            'the this page is: ',
            thisPage.pageNumber,
            prevDementorData
          );
          const newPageIndex = prevDementorData.pages.findIndex(
            x => x.pageNumber == thisPage.pageNumber - 1
          );
          console.log('the new page index is: ', newPageIndex);
          console.log('th', prevDementorData.pages[newPageIndex]);
          setDementorPageAnswersForDisplay(
            prevDementorData.pages[newPageIndex]?.writings || []
          );
          setDementorPagePromptsForDisplay(
            prevDementorData.pages[newPageIndex]?.prompts || []
          );
          return prevDementorData.pages[newPageIndex] || [];
        });
        return prevDementorData;
      });
    } else if (event.key === 'ArrowRight') {
      setDementorData(prevDementorData => {
        setDementorPageForDisplay(thisPage => {
          console.log(
            'the this page is: ',
            thisPage.pageNumber,
            prevDementorData
          );
          const newPageIndex = prevDementorData.pages.findIndex(
            x => x.pageNumber == thisPage.pageNumber + 1
          );
          console.log('the new page index is: ', newPageIndex);
          console.log('th', prevDementorData.pages[newPageIndex]);
          setDementorPageAnswersForDisplay(
            prevDementorData.pages[newPageIndex]?.writings || []
          );
          setDementorPagePromptsForDisplay(
            prevDementorData.pages[newPageIndex]?.prompts || []
          );
          return prevDementorData.pages[newPageIndex] || [];
        });
        return prevDementorData;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
    try {
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
      const thisDementor = await getIndividualDementorFormatted(
        formattedDementorId,
        thisWallet
      );

      // const dementorData = await ankyDementorsContract.getDementor(
      //   formattedDementorId
      // );
      // console.log('the dementor data is: ', dementorData);
      // const processedDementor = await processFetchedDementor(
      //   dementorData,
      //   formattedDementorId,
      //   thisWallet
      // );
      // const newProcessedDementor = await getDementorInfoFromIrys(
      //   processedDementor,
      //   'dementor',
      //   router.query.id,
      //   thisWallet.address
      // );

      // console.log('the NEW processed dementor is: ', newProcessedDementor);

      setDementorData(thisDementor);
      setLoadingDementor(false);
    } catch (error) {
      console.log('there was an errror', error);
      setLoadingDementor(false);
      setDementorDoesntExist(true);
    }
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
    setLoadingSavingNewPage(true);
    try {
      let previousPageCid;
      if (dementorData.pages.length > 0) {
        previousPageCid =
          dementorData.pages[dementorData.pages.length - 1].cid ||
          dementorData.pages[dementorData.pages.length - 1].promptsCid;
      }
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

      async function uploadTheWritingForThisPage(
        webIrys,
        finishText,
        previousCid
      ) {
        const tags = [
          { name: 'Content-Type', value: 'text/plain' },
          { name: 'application-id', value: 'Anky Dementors' },
          { name: 'container-type', value: 'dementor' },
          { name: 'container-id', value: router.query.id.toString() },
          {
            name: 'page-number',
            value: (dementorData.pages.length - 1).toString(),
          },
          { name: 'dementor-answer', value: 'true' },
          {
            name: 'previous-cid',
            value: previousCid || '',
          },
          {
            name: 'smart-contract',
            value: process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
          },
        ];
        console.log('the first tags are: ', tags);
        try {
          const receipt = await webIrys.upload(finishText, { tags });
          console.log(
            'the writing was uploaded, and the receipt is: ',
            receipt
          );
          console.log(
            `Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`
          );
          return {
            thisWritingCid: receipt.id,
            pageWritingTimestamp: receipt.timestamp,
          };
        } catch (error) {
          console.log('there was an error uploading the writing to irys');
          console.log(error);
        }
      }

      async function getNewAnkyPrompts(finishText, prompts) {
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
        console.log('the response data from anky is: ', responseData);
        return responseData.newPrompts;
      }

      async function uploadTheNewPromptsToNewPage(
        webIrys,
        newPromptsString,
        previousAnswersCid
      ) {
        const tags = [
          { name: 'Content-Type', value: 'text/plain' },
          { name: 'application-id', value: 'Anky Dementors' },
          { name: 'container-type', value: 'dementor' },
          { name: 'container-id', value: router.query.id.toString() },
          { name: 'page-number', value: dementorData.pages.length.toString() },
          { name: 'dementor-prompts', value: 'true' },
          {
            name: 'previous-cid',
            value: previousAnswersCid,
          },
          {
            name: 'smart-contract',
            value: process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
          },
        ];
        console.log('the second tags are: ', tags);
        console.log(
          'the prompts that are going to be uploaded now are: ',
          newPromptsString
        );
        if (newPromptsString && newPromptsString.length == 0) {
          newPromptsString = '1. Lorem ipsum%% 2. aloja%%3. vamo compare';
        }
        try {
          console.log('the new prompts are: ', newPromptsString);
          const receipt = await webIrys.upload(newPromptsString.toString(), {
            tags,
          });
          console.log(
            'the new prompts were uploaded, and the receipt is: ',
            receipt
          );
          console.log(
            `Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`
          );
          return {
            newPromptsCid: receipt.id,
            newPromptsTimestamp: receipt.timestamp,
          };
        } catch (error) {
          console.log('there was an error uploading the writing to irys');
          console.log(error);
        }
      }

      const thisPresentPage = dementorData.pages[dementorData.pages.length - 1];
      console.log('this present page is: ', thisPresentPage);

      const { thisWritingCid, pageWritingTimestamp } =
        await uploadTheWritingForThisPage(webIrys, finishText, previousPageCid);

      thisPresentPage.writingTimestamp = pageWritingTimestamp;
      thisPresentPage.writings = finishText.split('---');
      thisPresentPage.writingsCid = thisWritingCid;

      const newPrompts = await getNewAnkyPrompts(finishText, prompts);
      console.log('after here, the new prompts are: ', newPrompts);
      const newPage = {
        prompts: newPrompts.split('%%'),
      };

      const { newPromptsCid, newPromptsTimestamp } =
        await uploadTheNewPromptsToNewPage(webIrys, newPrompts, thisWritingCid);

      newPage.promptsTimestamp = newPromptsTimestamp;
      newPage.promptsCid = newPromptsCid;

      try {
        // update the local state
        setUserAppInformation(x => {
          // Find the specific journal index by its id
          const dementorIndexHere = x.userDementors.findIndex(
            j => j.dementorId == router.query.id
          );

          const updatedDementor = {
            ...dementorData,
            pages: dementorData.pages,
          };

          updatedDementor.pages[dementorData.pages.length - 1] =
            thisPresentPage;
          updatedDementor.pages[dementorData.pages.length] = newPage;

          setDementorData(updatedDementor);
          let updatedUserDementors;
          if (dementorIndexHere != -1) {
            updatedUserDementors = [
              ...x.userDementors.slice(0, dementorIndexHere),
              updatedDementor,
              ...x.userDementors.slice(dementorIndexHere + 1),
            ];
          } else {
            updatedUserDementors = [...x.userDementors, updatedDementor];
          }

          setUserData('userDementors', updatedUserDementors);

          return {
            ...x,
            userDementors: updatedUserDementors,
          };
        });
        setLifeBarLength(0);
        setLoadWritingGame(false);
      } catch (error) {}
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
            <p className='absolute top-1  cursor-pointer left-2 text-gray-800'>
              {dementorPageForDisplay.pageNumber + 1}
            </p>
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
                    {prompt}
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

  if (dementorDoesntExist)
    return (
      <div className='my-8'>
        <p className='text-white mb-4'>this dementor doesnt exist</p>
        <Link href='/library' passHref>
          <Button buttonText='library' buttonColor='bg-green-600' />
        </Link>
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
        secondsPerPrompt={secondsPerPrompt}
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
      <button onClick={() => console.log(dementorData)}>cnsole</button>
      <div className='flex space-x-2'>
        {dementorData.pages.map((x, i) => {
          return (
            <p
              className={`p-3 w-8  mb-3 flex items-center justify-center hover:opacity-70 cursor-pointer h-8 rounded-full ${
                dementorData.currentPage == i
                  ? 'bg-purple-400'
                  : 'bg-purple-600'
              }`}
              key={i}
              onClick={() => {
                if (dementorData.pages.length == i + 1) {
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
