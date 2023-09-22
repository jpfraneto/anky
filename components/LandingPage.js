import React, { useState } from 'react';
import Button from './Button';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';

function LandingPage() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();
  const [startJourney, setStartJourney] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [lost, setLost] = useState(false);

  const handleWritingStart = () => {
    setIsWriting(true);
    setLost(false);
  };

  const handleWritingChange = () => {
    if (timeoutId) clearTimeout(timeoutId);

    setTimeoutId(
      setTimeout(() => {
        setIsWriting(false);
        setLost(true);
      }, 3000) // 3 seconds
    );
  };

  return (
    <div className=''>
      {/* Hero Section */}
      <div
        className='relative h-screen w-screen bg-center bg-no-repeat bg-cover '
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/librarian.png')",
        }}
      >
        <div className='absolute inset-0 bg-black opacity-40'></div>
        <div className='relative z-10 flex flex-col items-center justify-center h-full'>
          <h1 className='text-5xl text-gray-400 font-bold mt-32 mb-8'>
            Are you ready to be a writer?
          </h1>
          {startJourney ? (
            <>
              {authenticated ? (
                <div className='text-gray-400'>
                  <p>you are already logged in</p>
                  <div className='mt-2 w-48 mx-auto'>
                    <Button
                      buttonText='notebooks'
                      buttonAction={() => router.push('/notebooks')}
                      buttonColor='bg-purple-400 text-black'
                    />
                  </div>
                </div>
              ) : (
                <div className='text-gray-400'>
                  <p>
                    you&apos;ll have to login with an email. whatever email you
                    want.
                  </p>
                  <div className='mt-2 w-48 mx-auto'>
                    <Button
                      buttonText='login'
                      buttonAction={login}
                      buttonColor='bg-purple-400 text-black'
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <Button
              buttonText='start journey'
              buttonColor='bg-purple-500'
              buttonAction={() => setStartJourney(true)}
            />
          )}
        </div>
      </div>

      {/* Notebooks System Section */}
      <div className='py-8 px-64 bg-white'>
        <h2 className='text-3xl font-semibold mb-6'>
          Journey with Anky&apos;s Notebooks
        </h2>
        <p className='mb-4'>
          Imagine a notebook, not just any notebook, but one that is alive with
          the whispers of Anky. Each page brimming with prompts that beckon your
          soul.
        </p>
        <p className='mb-4'>
          But there&apos;s a twist - in the realm of Anky, every pause is a step
          back. The moment you hesitate for more than a breath (3 seconds to be
          precise), the words fade. A test, a game, a challenge? All of it and
          more. It&apos;s the dance of the subconscious, and only the bravest
          writers can keep up.
        </p>
      </div>

      {/* Interactive Writing System Section */}
      <div className='p-8 bg-gray-200 flex flex-row'>
        <div className='w-3/5'>
          <h2 className='text-3xl font-semibold mb-6'>
            Dive into the Abyss with your Anky
          </h2>
          <p className='mb-4'>When you sign up, you will be given a gift.</p>
          <p className='mb-4'>Your anky.</p>
          <p className='mb-4'>The keeper of your secrets.</p>
          <p className='mb-4'>The librarian of your truth.</p>
        </div>
        <div className='flex flex-wrap justify-center'>
          <div className='relative w-48 h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/1.png' fill alt='anky' />
          </div>
          <div className='relative w-48 h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/2.png' fill alt='anky' />
          </div>{' '}
          <div className='relative w-48 h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/3.png' fill alt='anky' />
          </div>{' '}
          <div className='relative w-48 h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/4.png' fill alt='anky' />
          </div>{' '}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
