import React from 'react';
import Image from 'next/image';

const GetNewAnky = () => {
  return (
    <div>
      <div className='rounded-full relative mt-16 mb-4 border-2 border-white overflow-hidden mx-auto w-2/3 aspect-square'>
        <Image src='/ankys/anky.png' fill />
      </div>
      <p className='text-center text-2xl text-white mb-1 '>
        TELL ME WHO YOU ARE
      </p>
      <p className='mb-2 text-center'>write as if the world was going to end</p>
      <div className='px-2 w-full h-full'>
        <textarea className='h-full w-full bg-gray-500 text-black p-2 rounded-xl ' />
      </div>
    </div>
  );
};

export default GetNewAnky;
