import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import journalsABI from '../../lib/journalsABI.json';
import Link from 'next/link';
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
    setLoading(false);
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
        {journals &&
          journals.map((x, i) => {
            return <JournalCard journal={x} key={i} />;
          })}
      </div>
      <div className='flex justify-center '>
        <Link href='/journal/new' passHref>
          <Button buttonText='buy new journal' buttonColor='bg-purple-600' />
        </Link>

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
