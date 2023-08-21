import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../components/Button';
import { Dancing_Script } from 'next/font/google';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['400'] });

const GetNewAnky = () => {
  const [userWriting, setUserWriting] = useState('');
  const [hideEverything, setHideEverything] = useState(false);
  const submitUserWriting = async () => {
    if (userWriting.length < 300)
      return alert('Please write a little bit more about you.');
    const response = await fetch('/api/getNewAnky', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userWriting: userWriting,
      }),
    });
    const data = await response.json();
    const jsonResponse = await data.json();
    console.log(userWriting);
  };
  return (
    <div>
      <div className='rounded-full relative mt-12 mb-4 border-2 border-white overflow-hidden mx-auto w-2/3 aspect-square'>
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
          className={`${dancingScript.className} text-2xl h-full w-full bg-black text-white p-2 rounded-xl`}
        />
      </div>
      {userWriting && (
        <Button
          buttonAction={submitUserWriting}
          buttonText='Get my Anky'
          buttonColor='bg-green-700'
        />
      )}
    </div>
  );
};

export default GetNewAnky;
