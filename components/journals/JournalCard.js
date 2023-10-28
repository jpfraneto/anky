import React from 'react';
import Link from 'next/link';

const JournalCard = ({ journal }) => {
  console.log('in here', journal);
  function transformJournalType(index) {
    switch (index) {
      case 0:
        return 8;
      case 1:
        return 16;
      case 2:
        return 32;
    }
  }
  let timestamp;
  if (journal.entries && journal.entries.length > 0) {
    timestamp = journal?.entries[journal?.entries?.length - 1].timestamp;
  }

  console.log('the timestamp is: ', timestamp);
  return (
    // ChANGE THIS
    <Link href={`/journal/${journal.journalId}`}>
      <div className='py-2 px-4 m-2 rounded-xl text-left flex flex-col bg-green-600 hover:bg-green-700 text-black'>
        <h2 className='text-2xl'>#{journal.journalId}</h2>
        <p className='-my-1'>
          {journal.entries.length} / {transformJournalType(journal.journalType)}
        </p>
        {timestamp && (
          <p className='my-0'>
            last update: {new Date(timestamp * 1000).toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
};

export default JournalCard;
