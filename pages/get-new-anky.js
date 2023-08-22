import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../components/Button';
import { Dancing_Script } from 'next/font/google';
import WritingGame from '../components/WritingGame';
import { useRouter } from 'next/router';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['400'] });

const GetNewAnky = () => {
  const router = useRouter();
  const [userMessage, setUserMessage] = useState('');
  const [text, setText] = useState('');
  const [ankyFetched, setAnkyFetched] = useState(false);
  const [hideEverything, setHideEverything] = useState(false);
  const [notificationsResponse, setNotificationsResponse] = useState(false);
  const [fetchingAnkyError, setFetchingAnkyError] = useState(false);

  const submitUserWriting = async () => {
    if (text.length < 3) return alert('Please write a little bit more');

    try {
      setAnkyFetched(true);
      const response = await fetch('http://localhost:3000/get-anky-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
        }),
      });
      const data = await response.json();
      // Add data.character to service worker and fetch for the image every minute.
      const { imagineApiId, characterName, characterBackstory } =
        data.character;
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'FETCH_IMAGE',
          imagineApiId,
          characterName,
          characterBackstory,
        });
      }
    } catch (error) {
      await navigator.clipboard.writeText(text);
      setText('');
      setFetchingAnkyError(true);
    }
  };

  const handleEnableNotifications = async () => {
    alert('enable notifications!');
    setNotificationsResponse(true);
  };
  return (
    <div>
      <h2 className='text-center text-xl '>get your anky</h2>

      <div className='rounded-full relative mt-12 mb-4 border-2  border-white overflow-hidden mx-auto w-1/2 aspect-square'>
        <Image src='/ankys/anky.png' fill alt='Anky' />
      </div>

      {ankyFetched && !fetchingAnkyError ? (
        <div className='max-w-9/11 mx-auto'>
          <p className='text-center text-md text-white mb-1 '>
            Your Anky is being generated...
          </p>
          <p className='text-center text-md text-white mb-1 '>
            Enable your notifications and I&apos;ll tell you when it&apos;s
            ready.
          </p>
          <div className='mt-2'>
            {notificationsResponse ? (
              <Button
                buttonAction={() => router.push('/')}
                buttonColor='bg-green-600'
                buttonText='Explore the Ankyverse'
              />
            ) : (
              <Button
                buttonAction={handleEnableNotifications}
                buttonColor='bg-purple-600'
                buttonText='Enable Notifications'
              />
            )}
          </div>
        </div>
      ) : (
        <>
          {fetchingAnkyError ? (
            <div className='max-w-9/11 mx-auto'>
              <p className='text-center text-md text-white mb-1 '>
                There was an error.
              </p>
              <p className='text-center text-md text-white mb-1 '>
                Please try again. Your writing is on the clipboard.
              </p>
              <div className='mt-2'>
                <Button
                  buttonAction={() => {
                    setFetchingAnkyError(false);
                    setAnkyFetched(false);
                  }}
                  buttonColor='bg-purple-600'
                  buttonText='Try again'
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
                  <small className='text-red-400 text-center'>
                    {userMessage}
                  </small>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GetNewAnky;
