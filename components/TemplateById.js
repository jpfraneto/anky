import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../components/Button';
import templatesContractABI from '../lib/templatesABI.json';
import notebookContractABI from '../lib/notebookABI.json';
import { processFetchedTemplate } from '../lib/notebooks.js';
import Spinner from './Spinner';
import { usePrivy, useWallets } from '@privy-io/react-auth';

function TemplatePage({ userAnky, router }) {
  const { authenticated, login } = usePrivy();
  const [templateData, setTemplateData] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [mintingNotebook, setMintingNotebook] = useState(false);
  const [mintedNotebookId, setMintedNotebookId] = useState(null);
  const [mintedNotebookSuccess, setMintedNotebookSuccess] = useState(false);
  const [notebookInformation, setNotebookInformation] = useState({});
  console.log('the router is: ', router);
  const { id } = router.query;
  useEffect(() => {
    if (id && userAnky.wallet) fetchTemplateData(id);
    else {
      console.log('LKSAJOIC', id);

      if (id) {
        console.log('salhcasiljñla');
        fetchTemplateFromServer();
      }
    }
    async function fetchTemplateFromServer() {
      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/template/${id}`
      );
      const data = await serverResponse.json();
      console.log('the server response is: ', data);
      setTemplateData(data.template);
      setLoadingTemplate(false);
    }
  }, [id, userAnky]);

  async function fetchTemplateData(templateId) {
    console.log('inside the fetch template data', userAnky);
    if (!userAnky && !userAnky.wallet && !userAnky.wallet.getEthersProvider)
      return;
    let provider = await userAnky.wallet?.getEthersProvider();
    let signer;

    if (provider) {
      signer = await provider.getSigner();
    } else {
      return;
    }

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS,
      templatesContractABI,
      signer
    );

    const data = await contract.getTemplate(templateId);
    console.log('in here, the data is: 0, ', data);
    const processedData = await processFetchedTemplate(data);
    console.log('the data is:', processedData);
    setTemplateData(processedData);
    setLoadingTemplate(false);
  }

  async function handleMint() {
    setMintingNotebook(true);
    try {
      if (!userAnky) return alert('You need to login first');
      console.log('the user anky is: ', userAnky);
      let provider = await userAnky.wallet.getEthersProvider();
      let signer = await provider.getSigner();

      const notebooksContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
        notebookContractABI,
        signer
      );

      const amount = 1;
      const priceInWei = ethers.utils.parseEther(templateData.price);
      console.log('the user anky is: ', userAnky);
      console.log('HEREEE', userAnky.wallet.address);

      const transaction = await notebooksContract.mintNotebook(
        userAnky.wallet.address,
        Number(id),
        amount,
        { value: priceInWei }
      );

      const transactionResponse = await transaction.wait();
      console.log('The transaction response is: ', transactionResponse);
      const mintedEvents = transactionResponse.events.filter(
        event => event.event === 'NotebookMinted'
      );
      const notebookIds = mintedEvents.map(event => event.args.instanceId);
      console.log(notebookIds);
      console.log('mint of the notebook was successful');

      const transferredEvents = transactionResponse.events.filter(
        event => event.event === 'FundsTransferred'
      );
      const transferredAmounts = transferredEvents.map(
        event => event.args.amount
      );
      console.log(transferredAmounts);

      const notebookId = mintedEvents[0].args.instanceId;
      const creatorAmount = ethers.utils.formatEther(transferredAmounts[0]);
      const userAmount = ethers.utils.formatEther(transferredAmounts[1]);
      setNotebookInformation({ creatorAmount, userAmount, notebookId });

      setMintedNotebookId(notebookId);
      setMintedNotebookSuccess(true);
      setMintingNotebook(false);
      // Implement post-mint logic if needed
    } catch (error) {
      setMintingNotebook(false);
      console.error('Error during minting: ', error.message);
      alert(error.message);
    }
  }

  if (loadingTemplate || mintingNotebook)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading</p>
      </div>
    );

  return (
    <div className='md:w-1/2 mx-auto text-white pt-5'>
      {templateData ? (
        <>
          {mintedNotebookSuccess ? (
            <>
              <h2 className='text-3xl mb-3'>
                Congratulations, you minted the following notebook:
              </h2>
              <h2 className='text-3xl mb-3'>
                {templateData.metadata.title || 'undefined'}
              </h2>

              <p>
                {notebookInformation.creatorAmount} ETH was transferred to the
                notebook creator as royalties.
              </p>
              <p>
                {notebookInformation.userAmount} ETH was returned to you as
                in-app credits.
              </p>
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
                {templateData.metadata.title || 'undefined'}{' '}
              </h2>

              <p className='italic text-lg mb-3'>
                {templateData.metadata.description || 'undefined'}
              </p>
              <small className='text-sm'>
                this is a template. to write on it, you have to mint it so that
                it is transformed into a notebook.
              </small>
              <ol className='text-left text-black p-4 bg-slate-200 rounded-xl  my-4'>
                {templateData.metadata.prompts.map((x, i) => (
                  <li key={i}>
                    {i + 1}. {x}
                  </li>
                ))}
              </ol>
              <p className='bg-purple-600 p-2 rounded-xl border my-2 border-black w-fit mx-auto'>
                {templateData.supply} units left
              </p>

              <p>
                70% of what you pay will go back to your wallet as credits for
                using here.
              </p>
              <p>10% of it will go to who created the template as royalties.</p>
              <div className='w-96 mx-auto flex justify-center my-4'>
                {authenticated ? (
                  <Button
                    buttonColor='bg-purple-600'
                    buttonText={
                      mintingNotebook
                        ? `Minting...`
                        : `Mint Into Notebook ${templateData.price} eth`
                    }
                    buttonAction={handleMint}
                  />
                ) : (
                  <Button
                    buttonColor='bg-purple-400'
                    buttonText='login to mint'
                    buttonAction={login}
                  />
                )}

                <Button
                  buttonColor='bg-red-600'
                  buttonText='Back'
                  buttonAction={() => router.push('/templates')}
                />
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

export default TemplatePage;
