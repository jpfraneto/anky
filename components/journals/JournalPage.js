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

const JournalPage = ({ userAppInformation }) => {
  const router = useRouter();
  const [activeProvider, setActiveProvider] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setJournals(userAppInformation.userJournals);
  }, []);

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
