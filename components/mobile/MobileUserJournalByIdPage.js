import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Inter } from 'next/font/google';

var options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

const inter = Inter({ subsets: ['latin'], weight: ['200', '400'] });

const MobileUserJournalByIdPage = ({ userAnky }) => {
  const [thisJournal, setThisJournal] = useState(null);
  const [expanded, setExpanded] = useState(null); // add this line

  const router = useRouter();

  console.log('the ournals are: 0, ', userAnky.userJournals, router.query);

  useEffect(() => {
    if (!userAnky.userJournals) return;
    const thisJournalArray = userAnky.userJournals.filter(
      x => x.journalId === router.query.id
    );
    setThisJournal(thisJournalArray[0]);
  }, [router, userAnky.userJournals]);

  if (!thisJournal) return <p>loading!</p>;

  const toggleExpand = index => {
    // add this function
    setExpanded(expanded === index ? null : index);
  };
  return (
    <div className={`${inter.className} w-full p-4 pb-24`}>
      <div className='bg-lime-400 w-5/6 mx-auto h-16 rounded-2xl mt-4 flex items-center text-center active:bg-lime-500'>
        <p className='text-center  w-full text-xl'>{`journal #${
          thisJournal.journalId
        } - ${thisJournal.entries.length}/${
          thisJournal.pagesLeft + thisJournal.entries.length
        } pages`}</p>
      </div>
      {thisJournal.entries.map((journalEntry, i) => {
        return (
          <div
            key={i}
            onClick={() => toggleExpand(i)}
            className={`bg-lime-300 w-full p-2 mx-auto mt-4 pb-12 flex flex-col relative items-center rounded-2xl transition-all duration-300 ${
              expanded === i ? 'h-auto' : 'h-24'
            } active:bg-lime-400`}
          >
            {journalEntry.content ? (
              expanded === i ? (
                <p className='w-full'>{journalEntry.content}</p>
              ) : (
                <p className='w-full'>{journalEntry.content.slice(0, 50)}...</p>
              )
            ) : null}
            <p className='absolute bottom-1 text-gray-500 text-xs right-1'>
              {new Date(journalEntry.timestamp * 1000).toLocaleDateString(
                'en-US',
                options
              )}
            </p>
          </div>
        );
      })}
      <div
        onClick={() => router.back()}
        className='bg-red-400 w-4/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'
      >
        <p className='text-white text-3xl text-center w-9/12 mx-auto'>back</p>
      </div>
    </div>
  );
};

export default MobileUserJournalByIdPage;
