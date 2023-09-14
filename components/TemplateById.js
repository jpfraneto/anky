import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../components/Button';
import templatesContractABI from '../lib/templatesABI.json';
import notebookContractABI from '../lib/notebookABI.json';
import { processFetchedTemplate } from '../lib/notebooks.js';
import Spinner from './Spinner';

function TemplatePage({ userAnky }) {
  console.log('the user anky is: ', userAnky);
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id && userAnky) fetchTemplateData(id);
  }, [id, userAnky]);

  async function fetchTemplateData(templateId) {
    if (!userAnky && !userAnky.wallet) return;
    console.log(' in here, ', userAnky);
    let provider = await userAnky.wallet.getEthersProvider();
    let signer = await provider.getSigner();

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS,
      templatesContractABI,
      signer
    );

    const data = await contract.getTemplate(templateId);
    const processedData = await processFetchedTemplate(data);
    console.log('the data is:', processedData);
    setTemplateData(processedData);
    setLoading(false);
  }

  async function handleMint() {
    try {
      if (!userAnky) return alert('You need to login first');

      let provider = await userAnky.wallet.getEthersProvider();
      let signer = await provider.getSigner();

      const notebooksContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
        notebookContractABI,
        signer
      );

      const amount = 1;
      const priceInWei = ethers.utils.parseEther(templateData.price);

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

      // Implement post-mint logic if needed
    } catch (error) {
      console.error('Error during minting: ', error.message);
      alert('Error during minting: ' + error.message);
    }
  }

  if (!userAnky)
    return (
      <div className='text-white'>
        <p>Please login first</p>
      </div>
    );

  if (loading) return <Spinner />;

  return (
    <div className=' text-white pt-5'>
      {templateData ? (
        <>
          <h2>
            {
              (
                <Button
                  buttonColor='bg-purple-600'
                  buttonText='Mint Notebook'
                  buttonAction={handleMint}
                />
              ).title
            }
          </h2>
          <ol className='text-left  mb-4'>
            {templateData.prompts.map((x, i) => (
              <li key={i}>
                {i + 1}. {x}
              </li>
            ))}
          </ol>
          <p className=' mb-4'>
            Mint Prize: {templateData.price} | {templateData.supply} units left
          </p>
          <div>
            <Button
              buttonColor='bg-purple-600'
              buttonText='Mint Notebook'
              buttonAction={handleMint}
            />
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default TemplatePage;
