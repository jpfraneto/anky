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
    if (id) fetchTemplateData(id);
  }, [id]);

  async function fetchTemplateData(templateId) {
    if (!userAnky) return;
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
    if (!userAnky) return alert('You need to login first');
    let provider = await userAnky.wallet.getEthersProvider();
    let signer = await provider.getSigner();

    const notebooksContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
      notebookContractABI,
      signer
    );
    // Define parameters for the mint function. Replace with actual values where needed.
    const amount = 1; // Adjust based on user input or your application's requirements.
    const priceInWei = ethers.utils.parseEther(templateData.price);
    console.log('the notebooks contract is: ', notebooksContract);
    const transactionParameters = [
      userAnky.wallet.address,
      Number(id),
      amount,
      { value: priceInWei },
    ];

    console.log(transactionParameters);
    const transaction = await notebooksContract.mintNotebook(
      transactionParameters
    );
    const transactionResponse = await transaction.wait();
    console.log('the transcation response is: ', transactionResponse);

    console.log('Mint successful!');
    // Here, you can also implement any post-mint logic you want. For instance, navigating the user to another page, etc.
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
