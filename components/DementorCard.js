import React from 'react';
import Link from 'next/link';

const DementorCard = ({ dementor }) => {
  console.log('in here', dementor);

  let timestamp;
  if (dementor.pages && dementor.pages.length > 0) {
    timestamp = dementor?.pages[dementor?.pages?.length - 1].timestamp;
  }

  console.log('the timestamp is: ', timestamp);
  return (
    <Link href={`/dementor/${dementor.dementorId}`}>
      <div className='py-2 px-4 m-2 rounded-xl text-left flex flex-col bg-red-600 hover:bg-red-700 text-black'>
        <h2 className='text-2xl'>#{dementor.dementorId}</h2>
        <p className='-my-1'>{dementor.pages.length} pages written.</p>
        {timestamp && (
          <p className='my-0'>
            last update: {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
};

export default DementorCard;
