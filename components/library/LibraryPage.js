import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { ethers } from 'ethers';
import Link from 'next/link';
import Image from 'next/image';
import NotebookCard from '../NotebookCard';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import EulogiaCard from '../eulogias/EulogiaCard';
import JournalCard from '../journals/JournalCard';
import DementorCard from '../DementorCard';

import Button from '../Button';
import Spinner from '../Spinner';

import { useRouter } from 'next/router';

const LibraryPage = ({}) => {
  const router = useRouter();
  const { userAppInformation, appLoading, loadUserLibrary, loadingLibrary } =
    useUser();

  const [notebooks, setNotebooks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [dementors, setDementors] = useState([]);
  const [eulogias, setEulogias] = useState([]);
  const [activeTab, setActiveTab] = useState('journals');
  const [displayRefreshBtn, setDisplayRefreshBtn] = useState(false);
  const wallets = useWallets();
  const { authenticated } = usePrivy();

  function sortJournalsByLastUpdated(a, b) {
    if (!a.entries || !b.entries) return;
    if (a.entries.length === 0 && b.entries.length === 0) return 0;
    if (a.entries.length === 0) return 1;
    if (b.entries.length === 0) return -1;
    const timestampA = a.entries[a.entries.length - 1].timestamp;
    const timestampB = b.entries[b.entries.length - 1].timestamp;
    return timestampB - timestampA;
  }

  function sortEulogiasByLastUpdated(a, b) {
    if (!a.messages || !b.messages) return;

    if (a.messages.length === 0 && b.messages.length === 0) return 0;
    if (a.messages.length === 0) return 1;
    if (b.messages.length === 0) return -1;
    const timestampA = a.messages[a.messages.length - 1].timestamp;
    const timestampB = b.messages[b.messages.length - 1].timestamp;
    return timestampB - timestampA;
  }

  function sortDementorsByLastUpdated(a, b) {
    // if (!a.messages || !b.messages) return;
    // if (a.messages.length === 0 && b.messages.length === 0) return 0;
    // if (a.messages.length === 0) return 1;
    // if (b.messages.length === 0) return -1;
    // const timestampA = a.messages[a.messages.length - 1].timestamp;
    // const timestampB = b.messages[b.messages.length - 1].timestamp;
    // return timestampB - timestampA;
  }

  useEffect(() => {
    console.log('the user templates are: ', userAppInformation.userTemplates);
    setTemplates(userAppInformation.userTemplates);
    console.log('the user journals are: ', userAppInformation.userJournals);
    let sortedJournals;
    if (
      userAppInformation.userJournals &&
      userAppInformation.userJournals.length > 0
    ) {
      sortedJournals = userAppInformation.userJournals.sort(
        sortJournalsByLastUpdated
      );
    }
    setJournals(sortedJournals);
    console.log('the user notebooks are: ', userAppInformation.userNotebooks);
    setNotebooks(userAppInformation.userNotebooks);
    let sortedEulogias;
    if (
      userAppInformation.userEulogias &&
      userAppInformation.userEulogias.length > 0
    ) {
      sortedEulogias = userAppInformation.userEulogias.sort(
        sortEulogiasByLastUpdated
      );
    }
    console.log('the user eulogias are: ', userAppInformation.userEulogias);
    setEulogias(sortedEulogias);
    console.log('the user dementors are: ', userAppInformation.userDementors);

    let sortedDementors;
    if (
      userAppInformation.userDementors &&
      userAppInformation.userDementors.length > 0
    ) {
      // sortedDementors = userAppInformation.userDementors.sort(
      //   sortDementorsByLastUpdated
      // );
    }
    console.log('the user dementors are: ', userAppInformation.userDementors);
    setDementors(userAppInformation.userDementors);
  }, [appLoading, userAppInformation]);

  // if (appLoading) {
  //   return (
  //     <div>
  //       <Spinner />
  //       <p>loading...</p>
  //     </div>
  //   );
  // }

  return (
    <div>
      <div className='flex w-96 mx-auto relative items-center justify-center'>
        <h2 className='text-white text-2xl mt-2 '>library</h2>

        <span
          className='hover:cursor-pointer text-2xl mx-2 translate-y-1'
          onMouseEnter={() => setDisplayRefreshBtn(true)}
          onMouseLeave={() => setDisplayRefreshBtn(false)}
          onClick={() => loadUserLibrary(true)}
        >
          👽
        </span>
        {displayRefreshBtn && (
          <span className='text-red-200 text-sm absolute right-0 translate-y-1'>
            {loadingLibrary ? 'refreshing...' : 'refresh library'}
          </span>
        )}
      </div>

      <div className='text-white py-4 flex flex-col md:flex-row w-screen px-4'>
        <div className='w-full md:w-2/5 aspect-square p-2 text-white flex flex-col items-center'>
          <div className='relative w-4/5 md:w-3/5 aspect-square rounded-2xl border-2 border-white overflow-hidden'>
            <Image fill src={`/ankys/elmasmejor.png`} />
          </div>
          <p className='mt-2'>welcome back,</p>
          <p className='mt-2'>are you ready to keep writing?</p>
        </div>
        {loadingLibrary ? (
          <div>
            <Spinner />
          </div>
        ) : (
          <div className='w-full md:w-3/5 rounded-xl overflow-hidden'>
            <div className='flex w-full overflow-x-scroll md:w-full text-xs md:text-lg md:h-12 rounded-t-xl text-black'>
              <button
                className={`px-1 md:px-4 w-1/4 py-2 ${
                  activeTab === 'journals' ? 'bg-green-600' : 'bg-green-300'
                }`}
                onClick={() => setActiveTab('journals')}
              >
                Journals
              </button>

              <button
                className={`px-1 md:px-4 w-1/4 py-2 ${
                  activeTab === 'notebooks' ? 'bg-purple-600' : 'bg-purple-300'
                }`}
                onClick={() => setActiveTab('notebooks')}
              >
                Notebooks
              </button>
              <button
                className={`px-1 md:px-4 w-1/4 py-2 ${
                  activeTab === 'eulogias' ? 'bg-orange-600' : 'bg-orange-300'
                }`}
                onClick={() => {
                  setActiveTab('eulogias');
                }}
              >
                Eulogias
              </button>
              <button
                className={`px-1 md:px-4 w-1/4 py-2 ${
                  activeTab === 'dementor' ? 'bg-red-600' : 'bg-red-300'
                }`}
                onClick={() => setActiveTab('dementor')}
              >
                Dementor
              </button>
            </div>

            {activeTab === 'journals' && (
              <>
                <div className='flex flex-wrap bg-green-300 w-full flex-col rounded-b-xl p-4'>
                  {journals &&
                    journals.map((x, i) => {
                      return <JournalCard journal={x} key={i} />;
                    })}
                </div>
                <div className='flex justify-center mt-4'>
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
                <div className=' bg-purple-300 rounded-b-xl p-4 flex flex-col flex-wrap'>
                  {notebooks.length > 0 ? (
                    notebooks.map((x, i) => {
                      return <NotebookCard notebook={x} key={i} />;
                    })
                  ) : (
                    <div className='text-black w-full p-2'>
                      <p>you dont own notebooks yet</p>
                      <p>you can buy one if you get the link</p>
                      <p>or even create it yourself</p>
                      <p>one page, one prompt</p>
                      <p>to explore the journey designed by who created it</p>
                    </div>
                  )}
                </div>
                <div className='flex justify-center mt-4'>
                  <Button
                    buttonAction={() => router.push('/notebooks/new')}
                    buttonText='new template'
                    buttonColor='bg-purple-600'
                  />
                </div>
              </>
            )}

            {activeTab === 'eulogias' && (
              <>
                <div className=' bg-orange-300 rounded-b-xl p-1 md:p-4 flex flex-col flex-wrap'>
                  {eulogias && eulogias.length > 0 ? (
                    eulogias.map((x, i) => {
                      return <EulogiaCard eulogia={x} key={i} />;
                    })
                  ) : (
                    <div className='text-black w-full p-2'>
                      <p>you haven&apos;t created eulogias yet</p>
                      <p>they are community written notebooks</p>
                      <p>on which people with the link can write</p>
                      <p>what they write will stay there forever</p>
                      <p>as a memory of that point in history</p>
                    </div>
                  )}
                </div>
                <div className='flex justify-center mt-4'>
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
                <div className=' flex flex-wrap bg-red-300 w-full flex-col rounded-b-xl p-4'>
                  {dementors.length > 0 ? (
                    dementors.map((x, i) => {
                      return <DementorCard dementor={x} key={i} />;
                    })
                  ) : (
                    <div className='text-black w-full p-2'>
                      <p>you don&apos;t own a dementor yet</p>
                      <p>this is a special notebook</p>
                      <p>created by anky, as a quest into yourself</p>
                      <p>with each chapter going deeper and deeper</p>
                      <p>into the process of self inquiry</p>
                      <p>
                        treat it as the most important meditation practice of
                        your life
                      </p>
                      <p>write as if you wanted to know the truth</p>
                    </div>
                  )}
                </div>
                <div className='flex justify-center mt-4'>
                  <Link href='/dementor' passHref>
                    <Button
                      buttonText='add dementor'
                      buttonColor='bg-red-600'
                    />
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
