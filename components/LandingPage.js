import React, { useState } from 'react';
import Button from './Button';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';

function LandingPage() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();
  const [startJourney, setStartJourney] = useState(false);
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
      <div className='p-8 bg-white'>
        <h2 className='text-3xl font-semibold mb-6'>The Notebooks System</h2>
        <p className='mb-4'>
          Mint notebooks with unique prompts and start your writing journey.
          Write down your thoughts, stories, and more.
        </p>
        <p className='mb-4'>
          Engage with our community by creating eulogias and writing together.
          Share, discuss, and grow together.
        </p>
      </div>

      {/* Backend System Section */}
      <div className='p-8 bg-gray-200'>
        <h2 className='text-3xl font-semibold mb-6'>
          Behind the Scenes: Meet Anky
        </h2>
        <p className='mb-4'>
          Anky is the keeper of all notebooks and eulogias. By joining our
          platform, you receive exclusive access to these treasured collections.
        </p>
        <p>
          Experience the magic of our backend system and dive deep into a world
          of creativity and innovation.
        </p>
      </div>
    </div>
  );
}

export default LandingPage;
