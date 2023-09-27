import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const EulogiaCard = ({ eulogia }) => {
  console.log('the eulogia inside the card is: ', eulogia);
  return (
    <Link href={`/eulogias/${eulogia.eulogiaId}`} passHref>
      <div className='text-black flex flex-col space-y-2 w-fit p-2 bg-orange-500 rounded-xl hover:bg-orange-600 cursor-pointer'>
        <div className='w-36 h-36 rounded-xl overflow-hidden relative'>
          <Image
            src={eulogia.metadata.coverImageUrl}
            fill
            alt='Eulogia Cover Image'
          />
        </div>
        <div>
          <h2>{eulogia.metadata.title}</h2>
        </div>
      </div>
    </Link>
  );
};

export default EulogiaCard;
