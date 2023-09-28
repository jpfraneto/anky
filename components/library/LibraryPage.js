import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { ethers } from 'ethers';
import Link from 'next/link';
import NotebookCard from '../NotebookCard';
import EulogiaCard from '../eulogias/EulogiaCard';
import JournalCard from '../journals/JournalCard';
import Button from '../Button';
import Spinner from '../Spinner';
import {
  fetchUserEulogias,
  fetchUserNotebooks,
  fetchUserJournals,
} from '../../lib/notebooks';
import { useRouter } from 'next/router';

const LibraryPage = ({ notebooksProp, eulogiasProp, journalsProp }) => {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState(notebooksProp);
  const [journals, setJournals] = useState(journalsProp);
  const [eulogias, setEulogias] = useState(eulogiasProp);
  const { userAppInformation } = useUser();

  return (
    <div className='text-white py-4'>
      <h2 className='text-3xl mb-4'>your journals</h2>
      <div className='my-2 flex flex-wrap bg-green-300 rounded-xl p-4'>
        {journals &&
          journals.map((x, i) => {
            return <JournalCard journal={x} key={i} />;
          })}
      </div>
      <div className='flex space-x-2'>
        <Button
          buttonAction={() => router.push('/journal/new')}
          buttonText='new journal'
          buttonColor='bg-purple-600'
        />
      </div>
      <h2 className='text-3xl my-4'>your notebooks</h2>
      <div className='my-2 bg-purple-300 rounded-xl p-4 flex flex-wrap'>
        {notebooks &&
          notebooks.map((x, i) => {
            console.log('HEIFHAKSJHCA', x);
            return <NotebookCard notebook={x} key={i} />;
          })}
      </div>

      <div className='flex space-x-2 justify-center'>
        <Link href='/notebooks' passHref>
          <Button buttonText='find notebooks' buttonColor='bg-purple-600' />
        </Link>
        <Link href='/templates/new' passHref>
          <Button
            buttonText='new notebook template'
            buttonColor='bg-green-600'
          />
        </Link>
      </div>

      <h2 className='text-3xl my-4'>your eulogias</h2>
      <div className='my-2 bg-orange-300 rounded-xl p-4 flex flex-wrap'>
        {eulogias &&
          eulogias.map((x, i) => {
            return <EulogiaCard eulogia={x} key={i} />;
          })}
      </div>
      <div className='flex space-x-2 justify-center'>
        <Link href='/eulogias/new' passHref>
          <Button buttonText='add eulogia' buttonColor='bg-orange-600' />
        </Link>
      </div>
      <p className='mt-4'>yes. everything in here is YOURS.</p>
      <p>your anky is taking care of it. forever.</p>
    </div>
  );
};

export default LibraryPage;
