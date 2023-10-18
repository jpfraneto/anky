import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../Button';
import Link from 'next/link';
import { useUser } from '../../context/UserContext';
import {
  processFetchedTemplate,
  fetchArweaveContent,
} from '../../lib/notebooks.js';
import templatesContractABI from '../../lib/templatesABI.json';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { setUserData } from '../../lib/idbHelper';
import Image from 'next/image';
import WritingGameComponent from '../WritingGameComponent';
import Spinner from '../Spinner';
import AnkyNotebooksAbi from '../../lib/notebookABI.json'; // Assuming you have the ABI

const IndividualNotebookPage = ({ setLifeBarLength, lifeBarLength }) => {
  const router = useRouter();
  const [notebook, setNotebook] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessToken } = usePrivy();
  const [time, setTime] = useState(0);
  const [text, setText] = useState('');
  const [uploadingWriting, setUploadingWriting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [notebookTemplate, setNotebookTemplate] = useState(null);
  const [notebookPages, setNotebookPages] = useState([]);
  const [chosenPrompt, setChosenPrompt] = useState('');
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [writingForDisplay, setWritingForDisplay] = useState(null);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [whoIsWriting, setWhoIsWriting] = useState('');
  const [failed, setFailed] = useState(false);
  const { wallets } = useWallets();
  const { setUserAppInformation } = useUser();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function fetchNotebook() {
      try {
        if (!thisWallet) return;
        const notebookID = router.query.id;
        if (notebookID === undefined || !notebookID) {
          console.log('IN EHREEEE');
          return setFailed(true);
        }
        let fetchedProvider = await thisWallet.getEthersProvider();
        setProvider(fetchedProvider);
        console.log('the provider is: ', fetchedProvider);
        let signer = await fetchedProvider.getSigner();
        const notebooksContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
          AnkyNotebooksAbi,
          signer
        );
        console.log('this notebook id is: ');
        console.log('the notebooks contract is: ', notebooksContract);
        const thisNotebook = await notebooksContract.getFullNotebook(
          Number(notebookID)
        );
        console.log('this notebook is: ', thisNotebook);
        const fetchedPages = await fetchArweaveContent(thisNotebook.userPages);
        setNotebookPages(fetchedPages);
        console.log('the notebook is: ', thisNotebook);
        const templatesContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS,
          templatesContractABI,
          signer
        );
        const templateId = ethers.utils.formatUnits(thisNotebook.templateId, 0);
        const thisTemplate = await templatesContract.getTemplate(templateId);
        const formattedTemplate = await processFetchedTemplate(thisTemplate);
        console.log('the formatted template is: ', formattedTemplate);
        if (thisNotebook && formattedTemplate) {
          setNotebook(thisNotebook);
          setNotebookTemplate(formattedTemplate);
          setLoading(false);
        } else {
          throw Error('No notebook found');
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchNotebook();
  }, [thisWallet]);

  const writeOnNotebook = async () => {
    console.log('in here, the notebook pages are: ', notebookPages);
    const pagesWritten = notebookPages.length;
    console.log('the pages written are:', pagesWritten);
    if (pagesWritten >= notebookTemplate.metadata.prompts.length) {
      alert('All prompts have been written!');
      return;
    }
    const nextPrompt = notebookTemplate.metadata.prompts[pagesWritten];
    setChosenPrompt(nextPrompt);
    const writingGameParameters = {
      notebookType: 'notebook',
      targetTime: 480,
      notebookTypeId: notebook.notebookID,
      backgroundImage: null, // You can modify this if you have an image.
      prompt: nextPrompt, // You need to fetch and set the correct prompt.
      musicUrl: 'https://www.youtube.com/watch?v=HcKBDY64UN8',
      onFinish: updateNotebookWithPage,
    };

    setWritingGameProps(writingGameParameters);
    setLoadWritingGame(true);
  };

  const updateNotebookWithPage = async finishText => {
    try {
      const authToken = await getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/upload-writing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text: finishText }),
        }
      );

      const { cid } = await response.json();
      console.log('in here, the cid is: ', cid);
      let signer = await provider.getSigner();
      const notebooksContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
        AnkyNotebooksAbi,
        signer
      );
      console.log('the notebooks contract is: ', notebooksContract);
      console.log('the pages number is: ', notebookPages);
      const pageNumber = notebookPages.length;
      console.log('the page number is :0', pageNumber);
      console.log('the notebook is: ', notebook);
      console.log('the provider is: ', provider);
      const notebookId = router.query.id;
      console.log('the notebook id is: ', notebookId);
      const tx = await notebooksContract.writeNotebookPage(
        notebookId,
        pageNumber,
        cid,
        true
      );
      await tx.wait();
      console.log('after the response of writing in the notebook');
      console.log('the notebook pages are: ', notebookPages);

      setUserAppInformation(x => {
        // Find the specific journal index by its id
        const notebookIndex = x.userNotebooks.findIndex(
          j => j.notebookId == notebookId
        );

        // If the journal is found
        if (notebookIndex !== -1) {
          console.log('the notebook index is: ', notebookIndex);
          const updatedNotebook = {
            ...x.userNotebooks[notebookIndex],
            userPages: [
              ...x.userNotebooks[notebookIndex].userPages,
              {
                text: finishText,
                pageIndex: notebookPages.length,
                written: true,
              },
            ],
          };

          const updatedUserNotebooks = [
            ...x.userNotebooks.slice(0, notebookIndex),
            updatedNotebook,
            ...x.userNotebooks.slice(notebookIndex + 1),
          ];
          console.log('the updated user notebooks are: ', updatedUserNotebooks);
          setUserData('userNotebooks', updatedUserNotebooks);

          setNotebookPages(x => [
            ...x,
            {
              text: finishText,
              pageIndex: notebookPages.length,
              written: true,
            },
          ]);

          return {
            ...x,
            userNotebooks: updatedUserNotebooks,
          };
        }

        // Return the original state if the journal isn't found (for safety)
        return x;
      });

      setLoadWritingGame(false);
    } catch (error) {
      console.error('Failed to write to notebook:', error);
    }
  };

  if (!router.isReady || loading)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading...</p>
      </div>
    );

  if (failed) {
    return (
      <div className='pt-8 text-white'>
        <p>that notebook doesn&apos;t exist</p>
        <p>create it here:</p>
        <Button
          buttonAction={() => router.push('/templates/new')}
          buttonText='new notebook template'
          buttonColor='bg-green-600'
        />
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
      <h2 className='text-4xl my-2'>{notebookTemplate.metadata.title}</h2>{' '}
      <small className='italic'>{notebookTemplate.metadata.description}</small>
      <div className='text-left my-4 '>
        {notebookTemplate.metadata.prompts.map((x, i) => {
          return (
            <div key={i}>
              <p
                className={`${
                  notebookPages[i] &&
                  notebookPages[i].pageIndex &&
                  'line-through cursor-pointer hover:text-amber-500'
                }`}
                onClick={() => {
                  if (writingForDisplay?.pageIndex === i + 1) {
                    setWritingForDisplay(null);
                  } else {
                    setWritingForDisplay({
                      ...notebookPages[i],
                      pageIndex: i + 1,
                    });
                  }
                }}
              >
                {i + 1}. {x}
              </p>
              {writingForDisplay && writingForDisplay.pageIndex === i + 1 && (
                <div className='my-2 text-white p-2 bg-purple-600 rounded-xl'>
                  {writingForDisplay.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {notebookPages.length === notebookTemplate.metadata.prompts.length ? (
        <div>
          <p>Congratulations, you finished writing this notebook</p>
          <p className='mb-4'>Time to mint another one!</p>
          <Link href='/templates' passHref>
            <Button
              buttonText={`Browse notebooks`}
              buttonColor='bg-purple-500 w-48 mx-auto'
            />
          </Link>
        </div>
      ) : (
        <div className='flex'>
          <Button
            buttonText={`Answer prompt #${notebookPages.length + 1}`}
            buttonColor='bg-purple-500 w-48 mx-auto mb-3'
            buttonAction={writeOnNotebook}
          />
          <Button
            buttonAction={() => router.back()}
            buttonText={`Go Back`}
            buttonColor='bg-red-600 w-48 mx-auto mb-3'
          />
        </div>
      )}
    </div>
  );
};

export default IndividualNotebookPage;
