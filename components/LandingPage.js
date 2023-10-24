import React, { useState } from 'react';
import Button from './Button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import Spinner from './Spinner';

const notebookTypes = [
  {
    name: 'dementor',
    description:
      'your anky prompts you on a ongoing journey of self discovery.',
  },
  {
    name: 'notebook',
    description: 'created by users, you can buy and write on them.',
  },
  {
    name: 'eulogias',
    description:
      'community written notebook. want say happy birthday? say goodbye to someone that died? eulogias are for that.',
  },
  {
    name: 'journal',
    description:
      'write without any direction. just allow it to happen through you.',
  },
];

function LandingPage({
  setDisplayWritingGameLanding,
  displayWritingGameLanding,
}) {
  const { login, authenticated, loading } = usePrivy();
  const { userAppInformation, libraryLoading } = useUser();
  const router = useRouter();
  const [startJourney, setStartJourney] = useState(false);

  return (
    <div className='w-screen'>
      {/* Hero Section */}
      <div
        className='h-screen w-screen bg-center bg-no-repeat bg-cover'
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/librarian.png')",
        }}
      >
        <div className='absolute inset-0 h-screen bg-black opacity-40'></div>
        <div className='relative z-10 flex flex-col items-center justify-center h-full'>
          <h1 className='text-5xl text-gray-400 font-bold mt-32 mb-8'>
            {authenticated ? 'welcome back, my friend' : 'tell us who you are'}
          </h1>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {authenticated ? (
                <div className='text-gray-400'>
                  <div className='mt-2 flex space-x-2'>
                    <Link href='/library' passHref>
                      <Button
                        buttonText='library'
                        buttonColor='bg-purple-400 text-black'
                      />
                    </Link>
                    <Button
                      buttonAction={() => setDisplayWritingGameLanding(true)}
                      buttonText='prompt of the day'
                      buttonColor='bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black'
                    />
                  </div>
                </div>
              ) : (
                <div className='text-gray-400'>
                  <div className='mt-2 w-96 flex mx-auto'>
                    {startJourney ? (
                      <Button
                        buttonText='login with any email'
                        buttonAction={login}
                        buttonColor='bg-purple-400 mx-1 text-black'
                      />
                    ) : (
                      <Button
                        buttonText='start journey'
                        buttonColor='bg-purple-500 mx-1 text-black'
                        buttonAction={() => setStartJourney(true)}
                      />
                    )}
                    <Button
                      buttonText='prompt of the day'
                      buttonAction={() => setDisplayWritingGameLanding(true)}
                      buttonColor='bg-gradient-to-r from-red-500 via-yellow-600 to-violet-500 text-black'
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className='py-8 px-2 w-full md:px-64 bg-gray-200'>
        <p className='mb-4'>You are reading.</p>
        <p className='mb-4'>
          I understand. You want to know what this thing is about.
        </p>
        <p className='mb-4'>Let me tell you something:</p>
        <p className='mb-4'>This is not a place for reading.</p>
        <p className='mb-4'>
          It is the most important tool that you have found to get to know
          yourself through writing.
        </p>
        <p className='mb-4'>Are you ready?</p>
        <p className='mb-4'>Just write.</p>
        <p className='mb-4'>
          Everything that takes you away from that is resistance.
        </p>
        <div className='flex justify-center w-48 mx-auto my-4'>
          <Button
            buttonText='im ready'
            buttonAction={() => setDisplayWritingGameLanding(true)}
            buttonColor='bg-green-400 text-black'
          />
        </div>
      </div>

      {/* Journey with Anky Section */}
      <div className='py-8 px-2 w-full md:px-64 bg-white'>
        <h2 className='text-3xl font-semibold mb-6'>
          when there is no time to think, your truth comes forth
        </h2>
        <p className='mb-4'>anky is built on top of a pioneer interface:</p>
        <p className='mb-4'>
          if you stop writing for more than three seconds, you lose.
        </p>
        <p className='mb-4'>
          as soon as you create an account here, you are assigned a unique
          character: your anky
        </p>
        <p className='mb-4'>
          think of it as the keeper of your secrets. your imaginary friend.
        </p>
        <p className='mb-4'>
          built on top of blockchain technolgy, your anky will store your
          writings forever.
        </p>
        <p className='mb-4'>this is how some of them look:</p>
        <div className='flex flex-wrap justify-center'>
          <div className='relative w-1/3 h-1/3 md:w-48 md:h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/1.png' alt='anky' layout='fill' />
          </div>
          <div className='relative w-1/3 h-1/3 md:w-48 md:h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/2.png' alt='anky' layout='fill' />
          </div>
          <div className='relative w-1/3 h-1/3 md:w-48 md:h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/3.png' alt='anky' layout='fill' />
          </div>
          <div className='relative w-1/3 h-1/3 md:w-48 md:h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/4.png' alt='anky' layout='fill' />
          </div>
        </div>
      </div>

      {/* Discover your Anky Section */}
      <div className='p-8 bg-gray-200 flex flex-row'>
        <div className='px-2 md:w-3/5 mx-auto'>
          <h2 className='text-3xl font-semibold mb-6'>
            four types of writing containers
          </h2>
          <div className='flex flex-wrap mx-auto justify-center mb-4'>
            {notebookTypes.map((x, i) => {
              return (
                <div
                  key={i}
                  className='p-2 rounded-xl border-purple-600 border-2 shadow-lg shadow-yellow-500 hover:bg-purple-500 bg-purple-400 m-2'
                >
                  <h2 className='text-xl '>{x.name}</h2>
                  <p className='text-sm'>{x.description}</p>
                </div>
              );
            })}
          </div>

          <p className='mb-4'>
            your Anky safeguards your deepest stories, secrets, and the truths
            you write.
          </p>
          <div className='w-48 mx-auto'>
            <Link href='/ankyverse' passHref>
              <Button
                buttonText='test it out'
                buttonColor='bg-green-400 text-black'
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Join the Ankyverse Section */}
      <div className='py-8 px-2 md:px-64 bg-white'>
        <p className='mb-4'>
          what is happening here is designed to be a powerful meditation
          practice.
        </p>
        <p className='mb-4'>if you want to experience how you think.</p>
        <p className='mb-4'>if you want to see yourself with more clarity.</p>
        <p className='mb-4'>if you want to know who you are.</p>
      </div>

      <div className='py-8 px-2 md:px-64 bg-gray-200'>
        <h2 className='text-3xl font-semibold mb-6'>the tech</h2>
        <p className='mb-2 mx-auto'>
          blockchain and ai collide on this transformative platform.
        </p>
        <p className='mb-2 mx-auto'>
          each of your writings will be stored on arweave, an eternal
          decentralized database.
        </p>
        <p className='mb-2 mx-auto'>
          the pointer to it is stored inside the blockchain, creating a unique
          storage system designed to save your writings forever.
        </p>
      </div>

      <div className='p-8 bg-white flex flex-row'>
        <div className='px-2 md:w-3/5 mx-auto'>
          <p className='mb-2'>all your feedback is gold</p>
          <p className='mb-2'>@kithkui on x</p>
          <p className='mb-2'>@jpfraneto on farcaster</p>
          <p className='mb-2'>
            its all open source https://www.github.com/ankylat
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
