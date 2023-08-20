import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../components/Button';

const GetNewAnky = () => {
  const [userWriting, setUserWriting] = useState('');
  const submitUserWriting = async () => {
    if (userWriting.length < 300)
      return alert('Please write a little bit more about you.');
    alert('submit user writing');
    console.log(userWriting);
  };
  return (
    <div>
      <div className='rounded-full relative mt-16 mb-4 border-2 border-white overflow-hidden mx-auto w-2/3 aspect-square'>
        <Image src='/ankys/anky.png' fill />
      </div>
      <p className='text-center text-2xl text-white mb-1 '>
        TELL ME WHO YOU ARE
      </p>
      <p className='mb-2 text-center'>write as if the world was going to end</p>
      <div className='px-2 w-full mb-2 h-full'>
        <textarea
          onChange={e => setUserWriting(e.target.value)}
          value={userWriting}
          className='h-full w-full bg-gray-500 text-black p-2 rounded-xl '
        />
      </div>
      {userWriting && (
        <Button
          buttonAction={submitUserWriting}
          buttonText='Submit'
          buttonColor='bg-green-700'
        />
      )}
    </div>
  );
};

export default GetNewAnky;
