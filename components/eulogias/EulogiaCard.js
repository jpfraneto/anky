import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const EulogiaCard = ({ eulogia }) => {
  console.log('the eulogia inside the card is: ', eulogia);
  let timestamp;
  if (eulogia.messages && eulogia.messages.length > 0) {
    timestamp = eulogia?.messages[eulogia?.messages?.length - 1].timestamp;
  }
  return (
    <Link href={`/eulogias/${eulogia.eulogiaId}`} passHref>
      <div className='text-black flex m-2 w-full text-left justify-between p-2 bg-orange-500 rounded-xl hover:bg-orange-600 cursor-pointer'>
        <div>
          <h2 className='text-2xl'>{eulogia.metadata.title}</h2>
          <p className='-my-1'>
            {eulogia.messageCount} / {eulogia.maxMessages} pages written
          </p>
          {timestamp && (
            <p className='my-0'>
              last update: {new Date(timestamp * 1000).toLocaleString()}
            </p>
          )}
        </div>
        <div className='w-16 h-16 rounded-xl overflow-hidden ml-auto relative'>
          <Image
            src={eulogia.metadata.coverImageUrl}
            fill
            alt='Eulogia Cover Image'
          />
        </div>
      </div>
    </Link>
  );
};

export default EulogiaCard;
