import React from 'react';
import Link from 'next/link';

const JournalCard = ({ journal }) => {
  console.log('in here', journal);

  let timestamp;
  if (journal.entries && journal.entries.length > 0) {
    timestamp = journal?.entries[journal?.entries?.length - 1].timestamp;
  }

  console.log('the timestamp is: ', timestamp);
  return (
    <Link href={`/journal/${journal.journalId}`}>
      <div className='py-2 px-4 m-2 rounded-xl text-left flex flex-col bg-green-600 hover:bg-green-700 text-black'>
        <h2 className='text-2xl'>{journal.title}</h2>
        <p className='-my-1'>{journal.entries?.length || 0} pages written.</p>
        {timestamp && (
          <p className='my-0'>
            last update: {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
};

export default JournalCard;
