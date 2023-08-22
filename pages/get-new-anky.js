import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../components/Button';
import { Dancing_Script } from 'next/font/google';
import WritingGame from '../components/WritingGame';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['400'] });

const GetNewAnky = () => {
  const [userMessage, setUserMessage] = useState('');
  const [text, setText] = useState('');
  const [ankyFetched, setAnkyFetched] = useState(false);
  const [hideEverything, setHideEverything] = useState(false);
  const submitUserWriting = async () => {
    if (text.length < 300) return alert('Please write a little bit more');
    alert(
      'I invented a machine that creates Ankys. Are you still doubting how valuable the NFTs of the Anky Genesis collection will be in a world on which every human being owns one? Dont say that I didnt tell you'
    );
    setAnkyFetched(true);
    return;
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
  const handleEnableNotifications = async () => {
    alert('enable notifications!');
  };
  return (
    <div>
      <h2 className='text-center text-xl '>get your anky</h2>

      <div className='rounded-full relative mt-12 mb-4 border-2  border-white overflow-hidden mx-auto w-1/2 aspect-square'>
        <Image src='/ankys/anky.png' fill />
      </div>
      {ankyFetched ? (
        <div className='max-w-9/11 mx-auto'>
          <p className='text-center text-md text-white mb-1 '>
            Your Anky is being generated...
          </p>
          <p className='text-center text-md text-white mb-1 '>
            Enable your notifications and I&apos;ll tell you when it&apos;s
            ready.
          </p>
          <div className='mt-2'>
            <Button
              buttonAction={handleEnableNotifications}
              buttonColor='bg-purple-600'
              buttonText='Enable Notifications'
            />
          </div>
        </div>
      ) : (
        <div className='px-2'>
          <p className='text-center text-2xl text-white mb-1 '>
            TELL ME WHO YOU ARE
          </p>
          <p className='mb-2 text-sm text-center'>
            I will create an Anky for you based on what you wrote.
          </p>
          <WritingGame
            text={text}
            setText={setText}
            onSubmit={submitUserWriting}
            prompt='Tell me who you are'
            btnOneText='Get My Anky'
            btnTwoText='Discard'
          />
          {userMessage && (
            <div className='flex justify-center'>
              <small className='text-red-400 text-center'>{userMessage}</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GetNewAnky;
