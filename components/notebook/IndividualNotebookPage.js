import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../Button';
import {
  processFetchedTemplate,
  fetchArweaveContent,
} from '../../lib/notebooks.js';
import templatesContractABI from '../../lib/templatesABI.json';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';

import WritingGameComponent from '../WritingGameComponent';
import Spinner from '../Spinner';
import AnkyNotebooksAbi from '../../lib/notebookABI.json'; // Assuming you have the ABI

const IndividualNotebookPage = ({ setLifeBarLength, lifeBarLength }) => {
  const router = useRouter();
  const [notebook, setNotebook] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function fetchNotebook() {
      try {
        if (!thisWallet) return;
        const notebookID = router.query.id;

        let fetchedProvider = await thisWallet.getEthersProvider();
        setProvider(fetchedProvider);
        let signer = await fetchedProvider.getSigner();
        const notebooksContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
          AnkyNotebooksAbi,
          signer
        );
        console.log('this notebook id is: ', notebookID);
        const thisNotebook = await notebooksContract.getFullNotebook(
          notebookID
        );
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
      console.log('inside the update notebook with page function');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/upload-writing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      console.log('the notebooks contract is: ', notebook);
      console.log('the pages number is: ', notebookPages);
      const pageNumber = notebookPages.length + 1;
      console.log('the page number is :0', pageNumber);
      console.log('the notebook is: ', notebook);
      const notebookID = router.query.id;
      console.log('the notebook id is: ', notebookID);
      const tx = await notebooksContract.writePage(notebookID, pageNumber, cid);
      await tx.wait();
      console.log('after the response of writing in the notebook');
      console.log('the notebook pages are: ', notebookPages);
      if (notebookPages.length === 0) {
        setNotebookPages([
          {
            text: finishText,
            pageIndex: notebookPages.length,
            written: true,
          },
        ]);
      } else {
        setNotebookPages(x => [
          ...x,
          {
            text: finishText,
            pageIndex: notebookPages.length,
            written: true,
          },
        ]);
      }
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
    <div className='text-white'>
      <h2 className='text-4xl my-2'>{notebookTemplate.metadata.title}</h2>{' '}
      <small className='italic'>{notebookTemplate.metadata.description}</small>
      <div className='text-left my-4'>
        {notebookTemplate.metadata.prompts.map((x, i) => {
          return (
            <div key={i}>
              <p
                className={`${
                  notebookPages[i] &&
                  notebookPages[i].pageIndex &&
                  'line-through'
                }`}
                onClick={() => {
                  if (writingForDisplay?.index === i + 1) {
                    setWritingForDisplay({}); // Empty it if it's the same index
                  } else {
                    setWritingForDisplay(notebookPages[i]);
                  }
                }}
              >
                {i + 1}. {x}
              </p>
              {writingForDisplay?.pageIndex === i + 1 && (
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
          <Button
            buttonText={`Browse notebooks`}
            buttonColor='bg-purple-500 w-48 mx-auto'
            buttonAction={() => router.push('/templates')}
          />
        </div>
      ) : (
        <div className='flex'>
          <Button
            buttonText={`Answer prompt #${notebookPages.length + 1}`}
            buttonColor='bg-purple-500 w-48 mx-auto mb-3'
            buttonAction={writeOnNotebook}
          />
          <Button
            buttonText={`Go Back`}
            buttonColor='bg-red-600 w-48 mx-auto mb-3'
            buttonAction={() => router.push('/templates')}
          />
        </div>
      )}
    </div>
  );
};

export default IndividualNotebookPage;
