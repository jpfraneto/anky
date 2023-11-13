import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from './Button';
import Link from 'next/link';
import notebookContractABI from '../lib/notebookABI.json';
import IndividualNotebookPage from './notebook/IndividualNotebookPage';
import { setUserData } from '../lib/idbHelper';
import { useUser } from '../context/UserContext';
import { newProcessFetchedNotebook } from '../lib/notebooks.js';
import Spinner from './Spinner';
import { usePrivy, useWallets } from '@privy-io/react-auth';

function NotebookPage({ router, wallet, setLifeBarLength, lifeBarLength }) {
  const { authenticated, login, ready } = usePrivy();
  const [notebookData, setNotebookData] = useState(null);
  const [loadingNotebook, setLoadingNotebook] = useState(true);
  const [mintingNotebook, setMintingNotebook] = useState(false);
  const [doesntExist, setDoesntExist] = useState(false);
  const [mintedNotebookId, setMintedNotebookId] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [userOwnsThisNotebook, setUserOwnsThisNotebook] = useState(false);
  const [mintedNotebookSuccess, setMintedNotebookSuccess] = useState(false);
  const [notebookInformation, setNotebookInformation] = useState({});
  const { setUserAppInformation } = useUser();

  const { id } = router.query;
  useEffect(() => {
    if (!ready) return;
    console.log('ONE');
    if (id && wallet) fetchNotebookData(id);
    else {
      console.log('TWO');
      if (id && !authenticated && !wallet) {
        fetchNotebookFromServer();
      }
    }
    async function fetchNotebookFromServer() {
      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/notebook/${id}`
      );
      const data = await serverResponse.json();
      console.log('the server response is: ', data);
      setNotebookData(data.notebook);
      setLoadingNotebook(false);
    }
  }, [id, ready, wallet]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`https://anky.lat/template/${id}`);
    setLinkCopied(true);
  };

  async function fetchNotebookData(notebookId) {
    console.log('inside the fetch noteobok data');
    if (!wallet) return;
    let provider = await wallet.getEthersProvider();
    let signer;

    if (provider) {
      signer = await provider.getSigner();
    } else {
      return;
    }

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
      notebookContractABI,
      signer
    );

    const usersNotebookBalance = await contract.getUsersBalanceOfNotebook(
      notebookId
    );
    const userNotebookBalance = ethers.utils.formatUnits(
      usersNotebookBalance,
      0
    );

    console.log(
      'right before calling the smart contrwact to get the notebook',
      contract
    );
    console.log(
      'the provider that is calling is: ',
      provider,
      wallet,
      notebookId
    );

    const data = await contract.getNotebook(notebookId);
    console.log('in here, the dataof this notebook is is: 0, ', data);
    if (data.metadataCID.length < 3) return setDoesntExist(true);
    const processedData = await newProcessFetchedNotebook(data);
    console.log('the data is:', processedData);
    setNotebookData(processedData);
    if (userNotebookBalance > 0) {
      setUserOwnsThisNotebook(true);
    }
    setLoadingNotebook(false);
  }

  async function handleMint() {
    setMintingNotebook(true);
    try {
      if (!wallet) return alert('You need to login first');
      console.log('the idea is to mint the notebook now');
      let provider = await wallet.getEthersProvider();
      let signer = await provider.getSigner();

      const notebooksContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
        notebookContractABI,
        signer
      );

      const amount = 1;
      const priceInWei = ethers.utils.parseEther(notebookData.price);
      const transaction = await notebooksContract.mintNotebook(
        wallet.address,
        notebookData.notebookId,
        amount,
        { value: priceInWei }
      );

      const transactionResponse = await transaction.wait();
      console.log('The transaction response is: ', transactionResponse);
      const mintedEvents = transactionResponse.events.filter(
        event => event.event === 'NotebookMinted'
      );

      //emit NotebookMinted(notebookId, usersAnkyAddress, thisNotebook.metadataCID);
      console.log('the mintedEvents are: ', mintedEvents);
      const notebookIds = mintedEvents.map(event => event.args.notebookId);
      console.log(notebookIds);
      console.log('mint of the notebook was successful');

      const notebookId = mintedEvents[0].args.instanceId;

      setMintedNotebookId(notebookId);
      setMintedNotebookSuccess(true);
      setMintingNotebook(false);
      let newNotebooksArray;
      setUserAppInformation(x => {
        if (x.userNotebooks?.length > 0) {
          newNotebooksArray = [
            ...x.userNotebooks,
            {
              notebookId: notebookId,
              userPages: [],
              title: notebookData.title,
              description: notebookData.description,
            },
          ];
          return {
            ...x,
            userNotebooks: newNotebooksArray,
          };
        } else {
          return {
            ...x,
            userNotebooks: [
              {
                notebookId: notebookId,
                userPages: [],
                title: notebookData.title,
                description: notebookData.description,
              },
            ],
          };
        }
      });
      setUserData('userNotebooks', newNotebooksArray);
    } catch (error) {
      setMintingNotebook(false);
      console.error('Error during minting: ', error.message);
      alert(error.message);
    }
  }

  if (userOwnsThisNotebook)
    return (
      <IndividualNotebookPage
        notebookData={notebookData}
        setLifeBarLength={setLifeBarLength}
        lifeBarLength={lifeBarLength}
      />
    );

  if (loadingNotebook)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading</p>
      </div>
    );

  if (doesntExist) {
    return (
      <div className='text-white'>
        <p>this notebook doesnt exist.</p>
        <Link href='/notebooks/new' passHref>
          <Button buttonText='create it' buttonColor='bg-green-500' />
        </Link>
      </div>
    );
  }

  return (
    <div className='md:w-1/2 p-2 mx-auto w-screen text-white pt-5'>
      {notebookData ? (
        <>
          {mintedNotebookSuccess ? (
            <>
              <h2 className=' mb-3'>
                congratulations, you minted the following notebook:
              </h2>
              <h2 className='text-3xl mb-3'>
                {notebookData.metadata.title || 'undefined'}
              </h2>

              <div className='w-fit mx-auto mt-2'>
                <Button
                  buttonColor='bg-purple-600'
                  buttonText='write on it'
                  buttonAction={() =>
                    router.push(`/notebook/${mintedNotebookId}`)
                  }
                />
              </div>
            </>
          ) : (
            <>
              <h2 className='text-3xl mb-3'>
                {notebookData.metadata.title || 'undefined'}{' '}
              </h2>

              <p className='italic text-lg mb-3'>
                {notebookData.metadata.description || 'undefined'}
              </p>
              <p className='text-sm mb-2'>
                this is notebook is closed. in order to write on it, you need to
                buy it for the price that the creator determined.
              </p>
              <p className='text-sm mb-2'>
                you will mint it as an ERC1155, which you can transact on the
                open market freely.
              </p>
              <p className='text-sm'>
                but if you do that, you will lose access to what you wrote
                inside it.
              </p>
              <ol className='text-left text-black p-4 bg-slate-200 rounded-xl  my-4'>
                {notebookData.metadata.prompts.map((x, i) => (
                  <li key={i}>
                    {i + 1}. {x}
                  </li>
                ))}
              </ol>
              <div className='flex justify-center'>
                <p className='bg-green-600 p-2 text-white rounded-xl border my-2 border-black w-fit mx-2'>
                  {notebookData.supply} units left
                </p>
                <p className='bg-green-600 p-2 text-white rounded-xl border my-2 border-black w-fit mx-2'>
                  {notebookData.price} eth
                </p>
              </div>

              <div className='w-96 mx-auto  text-white flex items-start justify-center my-4'>
                {authenticated ? (
                  <div className='flex justify-center space-x-2'>
                    <Button
                      buttonColor='bg-green-600 mx-2'
                      buttonText={mintingNotebook ? `buying...` : `buy`}
                      buttonAction={handleMint}
                    />
                    <Button
                      buttonColor='bg-blue-400 mx-2'
                      buttonText={linkCopied ? `copied` : `copy link`}
                      buttonAction={copyToClipboard}
                    />
                    <Link href='/library' passHref>
                      <Button
                        buttonColor='bg-purple-600 mx-2'
                        buttonText='library'
                      />
                    </Link>
                  </div>
                ) : (
                  <div className='flex flex-col space-y-2'>
                    <Button
                      buttonColor='bg-purple-400'
                      buttonText='login to buy'
                      buttonAction={login}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default NotebookPage;
