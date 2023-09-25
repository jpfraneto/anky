import React from 'react';
import Link from 'next/link';

const JournalCard = ({ journal }) => {
  console.log('in here', journal);

  return (
    // ChANGE THIS
    <Link href={`/journal/0`}>
      <div className='p-2 rounded-xl bg-green-600 hover:bg-green-700 text-black'>
        hello world
      </div>
    </Link>
  );
};

export default JournalCard;
