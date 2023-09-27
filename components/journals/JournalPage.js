import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import journalsABI from '../../lib/journalsABI.json';
import { usePWA } from '../../context/pwaContext';
import Button from '../Button';
import {
  fetchAllEntriesContent,
  formatUserJournals,
} from '../../lib/notebooks';
import JournalCard from './JournalCard';
import Spinner from '../Spinner';
import { useRouter } from 'next/router';

const JournalPage = ({ userAnky }) => {
  const router = useRouter();
  const [activeProvider, setActiveProvider] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userAppInformation } = usePWA();

  useEffect(() => {
    const setup = async () => {
      if (userAppInformation.wallet && userAppInformation.tbaAddress) {
        const provider = await userAppInformation.wallet?.getEthersProvider();
        console.log('the provider is: ', provider);
        const signer = await provider.getSigner();
        console.log('the signer is: ', signer);
        await fetchUserJournals(signer);
        setLoading(false);
      }
    };
    setup();
  }, [userAppInformation]);

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
    const formattedJournals = formatUserJournals(rawDetailedJournals);
    const journalsWithContent = await fetchAllEntriesContent(formattedJournals);

    setJournals(journalsWithContent);
  }

  if (loading)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading...</p>
      </div>
    );

  return (
    <div className='text-white'>
      <button onClick={() => console.log(journals)}>journals</button>
      <div className='my-4 flex '>
        {journals.map((x, i) => {
          return <JournalCard journal={x} key={i} />;
        })}
      </div>
      <div className='flex justify-center space-x-2'>
        <Button
          buttonText='buy new journal'
          buttonColor='bg-purple-600'
          buttonAction={() =>
            alert('this will allow the user to mint another journal')
          }
        />
        <Button
          buttonText='back'
          buttonColor='bg-red-600'
          buttonAction={() => router.push('/library')}
        />
      </div>
    </div>
  );
};

export default JournalPage;
