import React, { useState, useEffect } from 'react';
import { usePWA } from '../../context/pwaContext';
import { ethers } from 'ethers';
import notebooksABI from '../../lib/notebookABI.json';
import eulogiasABI from '../../lib/eulogiaABI.json';
import journalsABI from '../../lib/journalsABI.json';
import Spinner from '../Spinner';
import {
  processFetchedNotebook,
  processFetchedTemplate,
} from '../../lib/notebooks';

const DashboardPage = () => {
  const [notebooks, setNotebooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState(null);
  const { userAppInformation } = usePWA();

  async function fetchUserJournals(signer) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
      journalsABI,
      signer
    );

    const userJournals = await contract.getUserJournals(
      userAppInformation.tbaAddress
    );
    console.log('the journals are: ', journals);
    setJournals(userJournals); // Process data if necessary
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

    // Create an instance for templates contract (assuming it's the same ABI and signer)
    const templatesContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS, // Assuming templates are fetched from the Eulogias contract
      eulogiasABI,
      signer
    );

    // Fetch full notebook object for each notebook ID
    const notebookObjects = [];
    for (const notebookId of notebookIdsArray) {
      const rawNotebookObject = await contract.getFullNotebook(notebookId);

      // Fetch and process the template data using the templateId from the notebook
      const rawTemplate = await templatesContract.getTemplateById(
        rawNotebookObject.templateId
      );
      const processedTemplate = await processFetchedTemplate(rawTemplate);

      const processedNotebook = await processFetchedNotebook(rawNotebookObject);

      // Combine template data with notebook data
      const combinedNotebookData = {
        ...processedNotebook,
        template: processedTemplate,
      };

      console.log('the combined notebooks is: 0', combinedNotebookData);

      notebookObjects.push(combinedNotebookData);
    }

    // Now, notebookObjects will be an array of the full notebook objects you need, each containing its corresponding template data
    console.log('The notebooks are: ', notebookObjects);
    setNotebooks(notebookObjects);
  }

  async function fetchUserEulogias(signer) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
      eulogiasABI,
      signer
    );

    const userEulogias = await contract.getUserEulogias(
      userAppInformation.tbaAddress
    );
    setEulogias(userEulogias); // Process data if necessary
  }

  useEffect(() => {
    console.log('the user app information is :', userAppInformation);
    const setup = async () => {
      if (userAppInformation.wallet && userAppInformation.tbaAddress) {
        const provider = await userAppInformation.wallet?.getEthersProvider();
        const signer = await provider.getSigner();
        if (userAppInformation.wallet) {
          await fetchUserJournals(signer);
          await fetchUserNotebooks(signer);
          setLoading(false);
          // fetchUserEulogias(signer);
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

  return <div>DashboardPage</div>;
};

export default DashboardPage;
