import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from './Button';

const MobileNotebookCard = ({ thisNotebook, handleMint }) => {
  if (!thisNotebook) return;
  return (
    <div className='p-2 bg-blue-400 w-5/6 mx-auto aspect-square rounded-2xl mt-4 flex  flex-col items-center text-center active:bg-blue-500'>
      <div className='flex w-full h-1/2 '>
        <div className='rounded-xl overflow-hidden relative w-1/2 aspect-square'>
          <Image fill src={`/ankys/1.png`} />
        </div>
        <div className='w-1/2 p-2'>
          <p className='text-left text-xl'>{thisNotebook.metadata.title}</p>
        </div>
      </div>
      <div className='h-1/2 py-2 text-xs text-left'>
        <p>{thisNotebook.metadata.description.slice(0, 400)}...</p>
        <p>{thisNotebook.metadata.prompts.length} prompts</p>
        <p>{thisNotebook.supply} available</p>
      </div>
      <Button
        buttonText='mint'
        buttonAction={handleMint}
        buttonColor='bg-green-600'
      />
    </div>
  );
};

export default MobileNotebookCard;
