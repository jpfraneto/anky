import React from 'react';
import Link from 'next/link';

const DementorCard = ({ dementor }) => {
  var options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  };

  let timestamp;
  if (dementor.pages && dementor.pages.length > 0) {
    timestamp = dementor?.pages[dementor?.pages?.length - 1].timestamp;
  }

  return (
    <Link href={`/dementor/${dementor.dementorId}`}>
      <div className='py-2 px-4 m-2 rounded-xl text-left flex flex-col bg-red-600 hover:bg-red-700 text-black'>
        <h2 className='text-2xl'>
          {dementor.dementorId} · {dementor.title}
        </h2>
        <p className='-my-1'>{dementor.pages.length} pages written.</p>
        {timestamp && (
          <p className='my-0'>
            last update:{' '}
            {new Date(timestamp).toLocaleDateString('en-US', options)}
          </p>
        )}
      </div>
    </Link>
  );
};

export default DementorCard;
