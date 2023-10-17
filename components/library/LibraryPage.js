import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { ethers } from 'ethers';
import Link from 'next/link';
import Image from 'next/image';
import NotebookCard from '../NotebookCard';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import EulogiaCard from '../eulogias/EulogiaCard';
import JournalCard from '../journals/JournalCard';
import Button from '../Button';
import Spinner from '../Spinner';

import { useRouter } from 'next/router';

const LibraryPage = ({}) => {
  const router = useRouter();
  const { userAppInformation, appLoading } = useUser();

  const [notebooks, setNotebooks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [dementors, setDementors] = useState([]);
  const [eulogias, setEulogias] = useState([]);
  const [activeTab, setActiveTab] = useState('journals');
  const wallets = useWallets();
  const { authenticated } = usePrivy();

  useEffect(() => {
    console.log('the user journals are: ', userAppInformation.userJournals);
    setJournals(userAppInformation.userJournals || []);
    console.log('the user notebooks are: ', userAppInformation.userNotebooks);
    setNotebooks(userAppInformation.userNotebooks || []);
    console.log('the user eulogias are: ', userAppInformation.userEulogias);
    setEulogias(userAppInformation.userEulogias || []);
    console.log('the user dementors are: ', userAppInformation.userDementors);
    setEulogias(userAppInformation.userDementors || []);
  }, [appLoading, userAppInformation]);

  if (appLoading) {
    return (
      <div>
        <Spinner />
        <p>loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className='text-white text-2xl mt-2'>library</h2>
      <div className='text-white py-4 flex w-screen px-4'>
        <div className='w-2/5 aspect-square p-2 text-white flex flex-col items-center'>
          <div className='relative w-3/5 aspect-square rounded-xl overflow-hidden'>
            <Image fill src={`/ankys/elmasmejor.png`} />
          </div>
          <p className='mt-2'>welcome back,</p>
          <p className='mt-2'>are you ready to keep writing?</p>
          <button onClick={() => console.log(userAppInformation, eulogias)}>
            sacl
          </button>
        </div>
        <div className='w-3/5 '>
          <div className='flex w-full mb-4 h-12'>
            <button
              className={`px-4 w-1/4 py-2 ${
                activeTab === 'journals' ? 'bg-green-600' : 'bg-green-300'
              }`}
              onClick={() => setActiveTab('journals')}
            >
              Journals
            </button>
            <button
              className={`px-4 w-1/4 py-2 ${
                activeTab === 'notebooks' ? 'bg-purple-600' : 'bg-purple-300'
              }`}
              onClick={() => setActiveTab('notebooks')}
            >
              Notebooks
            </button>
            <button
              className={`px-4 w-1/4 py-2 ${
                activeTab === 'eulogias' ? 'bg-orange-600' : 'bg-orange-300'
              }`}
              onClick={() => setActiveTab('eulogias')}
            >
              Eulogias
            </button>
            <button
              className={`px-4 w-1/4 py-2 ${
                activeTab === 'dementor' ? 'bg-red-600' : 'bg-red-300'
              }`}
              onClick={() => setActiveTab('dementor')}
            >
              Dementor
            </button>
          </div>

          {activeTab === 'journals' && (
            <>
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
                  buttonColor='bg-green-600'
                />
              </div>
            </>
          )}

          {activeTab === 'notebooks' && (
            <>
              <div className='my-2 bg-purple-300 rounded-xl p-4 flex flex-wrap'>
                {notebooks.length > 0 ? (
                  notebooks.map((x, i) => {
                    return <NotebookCard notebook={x} key={i} />;
                  })
                ) : (
                  <p className='text-black'>you dont have notebooks yet</p>
                )}
              </div>
              <div className='flex space-x-2 justify-center'>
                <Link href='/templates/new' passHref>
                  <Button
                    buttonText='new notebook template'
                    buttonColor='bg-purple-600'
                  />
                </Link>
              </div>
            </>
          )}

          {activeTab === 'eulogias' && (
            <>
              <div className='my-2 bg-orange-300 rounded-xl p-4 flex flex-wrap'>
                {eulogias.length > 0 ? (
                  eulogias.map((x, i) => {
                    console.log('the eulogia is: ', eulogia);
                    return <EulogiaCard eulogia={x} key={i} />;
                  })
                ) : (
                  <p className='text-black'>you dont have eulogias yet</p>
                )}
              </div>
              <div className='flex space-x-2 justify-center'>
                <Link href='/eulogias/new' passHref>
                  <Button
                    buttonText='add eulogia'
                    buttonColor='bg-orange-600'
                  />
                </Link>
              </div>
            </>
          )}

          {activeTab === 'dementor' && (
            <>
              <div className='my-2 bg-red-300 rounded-xl p-4 flex flex-wrap'>
                {dementors.length > 0 ? (
                  dementors.map((x, i) => {
                    return <DementorCard dementor={x} key={i} />;
                  })
                ) : (
                  <p className='text-black'>you dont have a dementor yet</p>
                )}
              </div>
              <div className='flex space-x-2 justify-center'>
                <Link href='/dementor' passHref>
                  <Button buttonText='add dementor' buttonColor='bg-red-600' />
                </Link>
              </div>
            </>
          )}
          {/* <div className='w-3/5 p-4 bg-gray-800'>
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
          <div className='flex my-2 space-x-2 justify-center'>
            <Link href='/dementor' passHref>
              <Button buttonText='dementor' buttonColor='bg-red-600' />
            </Link>
          </div>
        </div> */}
        </div>{' '}
      </div>
    </div>
  );
};

export default LibraryPage;
