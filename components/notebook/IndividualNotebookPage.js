import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { WebIrys } from '@irys/sdk';

import Button from '../Button';
import Link from 'next/link';
import { getContainerInfoFromIrys } from '../../lib/irys';
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

const IndividualNotebookPage = ({
  setLifeBarLength,
  lifeBarLength,
  notebookData,
}) => {
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
  const [openPages, setOpenPages] = useState([]);
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [writingForDisplay, setWritingForDisplay] = useState(null);
  const [copyNotebookLinkText, setCopyNotebookLinkText] =
    useState('copy notebook link');
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [whoIsWriting, setWhoIsWriting] = useState('');
  const [failed, setFailed] = useState(false);
  const { wallets } = useWallets();
  const { setUserAppInformation, userAppInformation } = useUser();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function fetchNotebook() {
      try {
        if (!thisWallet) return;
        console.log('FETCHING THIS NOTEBOOK ');
        const notebookID = router.query.id;
        if (notebookID === undefined || !notebookID) {
          return setFailed(true);
        }
        const thisNotebookInUser = userAppInformation.userNotebooks.filter(
          x => x.notebookId == notebookID
        )[0];
        console.log('this notebook in user', thisNotebookInUser);
        let fetchedProvider = await thisWallet.getEthersProvider();
        setProvider(fetchedProvider);
        console.log('the provider is: ', fetchedProvider);

        const fetchedPages = await getContainerInfoFromIrys(
          'notebook',
          router.query.id,
          thisWallet.address,
          process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT
        );
        console.log('OUT HERE, THE FETCHED PAGES ARE: ', fetchedPages);

        setNotebookPages(fetchedPages);
        setLoading(false);
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
    if (pagesWritten >= notebookData.metadata.prompts.length) {
      alert('All prompts have been written!');
      return;
    }
    const nextPrompt = notebookData.metadata.prompts[pagesWritten];
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

  const togglePage = i => {
    if (openPages.includes(i)) {
      setOpenPages(prevPages => prevPages.filter(page => page !== i));
    } else {
      setOpenPages(prevPages => [...prevPages, i]);
    }
  };

  const copyNotebookLink = async () => {
    await navigator.clipboard.writeText(
      `https://anky.lat/notebook/${router.query.id}`
    );
    setCopyNotebookLinkText('link copied');
  };

  const updateNotebookWithPage = async finishText => {
    try {
      const getWebIrys = async () => {
        // Ethers5 provider
        // await window.ethereum.enable();
        if (!thisWallet) return;
        // const provider = new providers.Web3Provider(window.ethereum);
        console.log('thiiiiis wallet is: ', thisWallet);
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
      let previousPageCid = 0;
      if (notebookPages.length > 0) {
        previousPageCid = notebookPages[notebookPages.length - 1].cid;
      }
      const tags = [
        { name: 'Content-Type', value: 'text/plain' },
        { name: 'application-id', value: 'Anky Dementors' },
        { name: 'container-type', value: 'notebook' },
        { name: 'container-id', value: router.query.id.toString() },
        { name: 'page-number', value: notebookPages.length.toString() },
        {
          name: 'smart-contract-address',
          value: process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
        },
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
        let newNotebookPage = {
          text: finishText,
          pageIndex: notebookPages.length,
          written: true,
          cid: receipt.id,
        };
        setNotebookPages(x => [...x, newNotebookPage]);
        setUserAppInformation(x => {
          // Find the specific journal index by its id
          const notebookIndex = x.userNotebooks.findIndex(
            j => j.notebookId == router.query.id
          );

          // If the journal is found
          if (notebookIndex !== -1) {
            console.log('the notebook index is: ', notebookIndex);
            const updatedNotebook = {
              ...notebookData,
              pages: [...notebookPages, newNotebookPage],
            };

            let updatedUserNotebooks = [
              ...x.userNotebooks.slice(0, notebookIndex),
              updatedNotebook,
              ...x.userNotebooks.slice(notebookIndex + 1),
            ];
            console.log(
              'the updated user notebooks are: ',
              updatedUserNotebooks
            );

            return {
              ...x,
              userNotebooks: updatedUserNotebooks,
            };
          }

          setUserData('userNotebooks', updatedUserNotebooks);

          // Return the original state if the journal isn't found (for safety)
          return x;
        });

        setLoadWritingGame(false);
        setLifeBarLength(0);
      } catch (error) {
        console.error('Failed to write to notebook:', error);
      }
    } catch (error) {
      console.error('Failed to write to notebook down here:', error);
    }
  };

  if (!router.isReady || loading)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading</p>
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
    <div className='text-white md:w-3/5 mx-auto p-4'>
      <h2 className='text-4xl my-2'>{notebookData.metadata.title}</h2>{' '}
      <small className='italic'>{notebookData.metadata.description}</small>
      <div className='text-left my-4 '>
        {notebookData.metadata.prompts.map((x, i) => {
          return (
            <div key={i}>
              <p
                className={`${
                  notebookPages[i] &&
                  (notebookPages[i].pageContent || notebookPages[i].text) &&
                  'line-through cursor-pointer hover:text-amber-500'
                }`}
                onClick={() => {
                  if (
                    notebookPages[i] &&
                    (notebookPages[i].pageContent || notebookPages[i].text)
                  ) {
                    togglePage(i);
                  }
                }} // Use the new togglePage function
              >
                {i + 1}. {x}
              </p>
              {openPages.includes(i) && notebookPages[i] && (
                <div className='my-2 text-white p-2 bg-purple-600 rounded-xl'>
                  {notebookPages[i].text || notebookPages[i].pageContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className='w-48 mx-auto mb-4'>
        {openPages.length > 1 && (
          <Button
            buttonText='close all pages'
            buttonColor='bg-green-600'
            buttonAction={() => setOpenPages([])}
          />
        )}
      </div>
      <div className='flex justify-center'>
        {notebookPages.length === notebookData.metadata.prompts.length ? (
          <div>
            <p>Congratulations, you finished writing this notebook</p>
            <p className='mb-4'>Time to create another one.</p>
            <div className='flex justify-center space-x-2'>
              <Link href='/notebooks/new' passHref>
                <Button
                  buttonText={`create notebook`}
                  buttonColor='bg-green-600 w-48 mx-auto'
                />
              </Link>
              <Link href='/library' passHref>
                <Button
                  buttonText={`library`}
                  buttonColor='bg-purple-600 mx-auto mb-3'
                />
              </Link>
            </div>
          </div>
        ) : (
          <div className='flex space-x-2'>
            <Button
              buttonText={`answer prompt #${notebookPages.length + 1}`}
              buttonColor='bg-green-500 mx-2 mb-3'
              buttonAction={writeOnNotebook}
            />
            <Link href='/library' passHref>
              <Button
                buttonText={`library`}
                buttonColor='bg-purple-600 mx-2 mb-3'
              />
            </Link>

            <Button
              buttonText={copyNotebookLinkText}
              buttonAction={copyNotebookLink}
              buttonColor='bg-cyan-600 mx-2 mb-3'
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualNotebookPage;
