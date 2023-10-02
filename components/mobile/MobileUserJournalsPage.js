import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const MobileUserJournalsPage = ({ userAnky }) => {
  const router = useRouter();
  return (
    <div className='w-full p-4'>
      {userAnky.userJournals.map((journal, i) => {
        return (
          <Link key={i} href={`/m/user/journals/${journal.journalId}`} passHref>
            <div className='bg-lime-400 w-5/6 mx-auto h-16 rounded-2xl mt-4 flex items-center text-center active:bg-lime-500'>
              <p className='text-center  w-full text-xl'>{`journal #${
                journal.journalId
              } - ${journal.entries.length}/${
                journal.pagesLeft + journal.entries.length
              } pages`}</p>
            </div>
          </Link>
        );
      })}
      <Link href='/m/journals/new' passHref>
        <div className='bg-lime-600 w-5/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'>
          <p className='text-white text-3xl text-center w-9/12 mx-auto'>
            buy journal
          </p>
        </div>
      </Link>

      <div
        onClick={() => router.back()}
        className='bg-red-400 w-4/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'
      >
        <p className='text-white text-3xl text-center w-9/12 mx-auto'>back</p>
      </div>
    </div>
  );
};

export default MobileUserJournalsPage;
