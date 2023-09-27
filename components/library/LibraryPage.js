import React, { useState, useEffect } from 'react';
import { usePWA } from '../../context/pwaContext';
import { ethers } from 'ethers';
import notebooksABI from '../../lib/notebookABI.json';
import eulogiasABI from '../../lib/eulogiaABI.json';
import templatesABI from '../../lib/templatesABI.json';
import journalsABI from '../../lib/journalsABI.json';
import NotebookCard from '../NotebookCard';
import EulogiaCard from '../eulogias/EulogiaCard';
import JournalCard from '../journals/JournalCard';
import Button from '../Button';
import Spinner from '../Spinner';
import {
  processFetchedNotebook,
  processFetchedTemplate,
  fetchAllEntriesContent,
  formatUserJournals,
  processFetchedEulogia,
} from '../../lib/notebooks';
import { useRouter } from 'next/router';

const LibraryPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notebooks, setNotebooks] = useState(null);
  const [journals, setJournals] = useState(null);
  const [eulogias, setEulogias] = useState(null);
  const { userAppInformation } = usePWA();

  async function fetchUserJournals(signer) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
      journalsABI,
      signer
    );

    const userJournals = await contract.getUserJournals();
    console.log('the raw journal tokens are: ', userJournals);

    const userJournalsPromises = userJournals.map(tokenId =>
      contract.getJournal(ethers.utils.formatUnits(tokenId, 0))
    );

    const rawDetailedJournals = await Promise.all(userJournalsPromises);
    console.log('the raw detailed journals', rawDetailedJournals);
    const formattedJournals = formatUserJournals(rawDetailedJournals);
    const journalsWithContent = await fetchAllEntriesContent(formattedJournals);

    setJournals(journalsWithContent);
  }

  async function fetchUserNotebooks(signer) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
      notebooksABI,
      signer
    );
    console.log('the contract is: ', contract);
    console.log('the wallet is: ', userAppInformation.tbaAddress);

    const notebookIds = await contract.getOwnedNotebooks(
      userAppInformation.tbaAddress
    );
    console.log('the user notebook IDs are : ', notebookIds);

    // Convert BigNumbers to usable array of numbers
    const notebookIdsArray = notebookIds.map(id => id.toNumber());
    console.log('here', notebookIdsArray);
    // Create an instance for templates contract (assuming it's the same ABI and signer)
    const templatesContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS, // Assuming templates are fetched from the Eulogias contract
      templatesABI,
      signer
    );

    // Fetch full notebook object for each notebook ID
    const notebookObjects = [];
    for (const notebookId of notebookIdsArray) {
      console.log('BEFORE HERE');
      const rawNotebookObject = await contract.getFullNotebook(notebookId);
      const before = ethers.utils.formatUnits(rawNotebookObject.templateId, 0);
      console.log('the before is: ', before);
      const rawTemplate = await templatesContract.getTemplate(before);
      const processedTemplate = await processFetchedTemplate(rawTemplate);

      const processedNotebook = await processFetchedNotebook(rawNotebookObject);

      // Combine template data with notebook data
      const combinedNotebookData = {
        ...processedNotebook,
        template: processedTemplate,
      };

      notebookObjects.push(combinedNotebookData);
    }

    setNotebooks(notebookObjects);
  }

  async function fetchUserEulogias(signer) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
      eulogiasABI,
      signer
    );
    console.log('contact', contract);
    const userEulogias = await contract.getUserEulogias();
    const eulogiaDataArray = [];
    for (let i = 0; i < userEulogias.length; i++) {
      const eulogiaId = ethers.utils.formatUnits(userEulogias[i], 0);

      const eulogiaData = await contract.getEulogia(eulogiaId);
      const processedEulogia = await processFetchedEulogia(eulogiaData);
      processedEulogia.eulogiaId = Number(eulogiaId);
      eulogiaDataArray.push(processedEulogia);
    }

    console.log('All Eulogia data:', eulogiaDataArray);
    setEulogias(eulogiaDataArray);
  }

  useEffect(() => {
    console.log('the user app information is :', userAppInformation);
    const setup = async () => {
      if (userAppInformation.wallet && userAppInformation.tbaAddress) {
        const provider = await userAppInformation.wallet?.getEthersProvider();
        console.log('HERE ', userAppInformation.tbaAddress, provider);
        const signer = await provider.getSigner();
        if (userAppInformation.wallet) {
          await fetchUserJournals(signer);
          console.log('the journals were fetched');
          await fetchUserNotebooks(signer);
          console.log('the notebooks were fetched');
          await fetchUserEulogias(signer);
          console.log('the eulogias were fetched');

          setLoading(false);
        }
      }
    };
    setup();
  }, [userAppInformation]);

  if (loading)
    return (
      <div className='text-white'>
        <Spinner />
        <p>loading...</p>
      </div>
    );

  return (
    <div className='text-white'>
      <h2 className='text-3xl my-4'>journals</h2>
      <div className='my-2 bg-green-300 rounded-xl p-4'>
        {journals &&
          journals.map((x, i) => {
            return <JournalCard journal={x} key={i} />;
          })}
      </div>
      <h2 className='text-3xl my-4'>notebooks</h2>
      <div className='my-2 bg-purple-300 rounded-xl p-4'>
        {notebooks &&
          notebooks.map((x, i) => {
            return <NotebookCard notebook={x} key={i} />;
          })}
      </div>

      <div className='flex space-x-2'>
        <Button
          buttonAction={() => router.push('/notebooks')}
          buttonText='find notebooks'
          buttonColor='bg-purple-600'
        />
        <Button
          buttonAction={() => router.push('/templates/new')}
          buttonText='new notebook template'
          buttonColor='bg-green-600'
        />
      </div>

      <h2 className='text-3xl my-4'>eulogias</h2>
      <div className='my-2 bg-orange-300 rounded-xl p-4'>
        {eulogias &&
          eulogias.map((x, i) => {
            return <EulogiaCard eulogia={x} key={i} />;
          })}
      </div>
      <div className='flex space-x-2'>
        <Button
          buttonAction={() => router.push('/eulogias/new')}
          buttonText='add eulogia'
          buttonColor='bg-orange-600'
        />
      </div>
    </div>
  );
};

export default LibraryPage;
