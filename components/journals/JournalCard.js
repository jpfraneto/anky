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
  return (
    // ChANGE THIS
    <Link href={`/journal/${journal.journalId}`}>
      <div className='p-2 m-2 rounded-xl bg-green-600 hover:bg-green-700 text-black'>
        <h2 className='text-2xl'>Journal #{journal.journalId}</h2>
        <p>
          {journal.entries.length} / {transformJournalType(journal.journalType)}{' '}
          (pages written)
        </p>
      </div>
    </Link>
  );
};

export default JournalCard;
