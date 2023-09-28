import React, { useState } from 'react';
import Button from './Button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import { useUser } from '../context/userContext';

const notebookTypes = [
  { name: 'notebook', description: 'minted from a template. limited supply.' },
  {
    name: 'eulogias',
    description: 'community written notebook. you can only write one.',
  },
  {
    name: 'journal',
    description: 'designed to allow you to just write streams of consciousness',
  },
];

function LandingPage() {
  const { login, authenticated } = usePrivy();
  const { userAppInformation, libraryLoading } = useUser();
  const router = useRouter();
  const [startJourney, setStartJourney] = useState(false);

  return (
    <div className=''>
      {/* Hero Section */}
      <div
        className='relative h-screen w-screen bg-center bg-no-repeat bg-cover'
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/librarian.png')",
        }}
      >
        <div className='absolute inset-0 bg-black opacity-40'></div>
        <div className='relative z-10 flex flex-col items-center justify-center h-full'>
          <h1 className='text-5xl text-gray-400 font-bold mt-32 mb-8'>
            {authenticated ? 'welcome back, my friend' : 'we are all writers'}
          </h1>

          {authenticated ? (
            <div className='text-gray-400'>
              <div className='mt-2 flex space-x-2'>
                {libraryLoading ? (
                  <Button
                    disabled
                    buttonText='loading library...'
                    buttonColor='bg-purple-400 text-black'
                  />
                ) : (
                  <Link href='/library' passHref>
                    <Button
                      buttonText='library'
                      buttonColor='bg-purple-400 text-black'
                    />
                  </Link>
                )}

                <Link href='/journal' passHref>
                  <Button
                    buttonText='journal'
                    buttonColor='bg-green-400 text-black'
                  />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {startJourney ? (
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
              ) : (
                <div className='mt-2 flex space-x-2'>
                  <Button
                    buttonText='start journey'
                    buttonColor='bg-purple-500'
                    buttonAction={() => setStartJourney(true)}
                  />{' '}
                  <Button
                    buttonText='prompt of the day'
                    buttonAction={() => router.push('/ankyverse')}
                    buttonColor='bg-green-400 text-black'
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Journey with Anky Section */}
      <div className='py-8 px-64 bg-white'>
        <h2 className='text-3xl font-semibold mb-6'>
          embark on a unique journey with anky
        </h2>
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
        <p className='mb-4'>this is how they look:</p>
        <div className='flex flex-wrap justify-center'>
          <div className='relative w-48 h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/1.png' alt='anky' layout='fill' />
          </div>
          <div className='relative w-48 h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/2.png' alt='anky' layout='fill' />
          </div>
          <div className='relative w-48 h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/3.png' alt='anky' layout='fill' />
          </div>
          <div className='relative w-48 h-48 m-2 rounded-xl overflow-hidden'>
            <Image src='/ankys/4.png' alt='anky' layout='fill' />
          </div>
        </div>
      </div>

      {/* Discover your Anky Section */}
      <div className='p-8 bg-gray-200 flex flex-row'>
        <div className='w-3/5 mx-auto'>
          <h2 className='text-3xl font-semibold mb-6'>
            in here, there are three types of writing containers
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
            all of them powered by the unique writing mechanism of anky:
            consciousness dumping.
          </p>
          <p className='mb-4'>
            Your Anky safeguards your deepest stories, secrets, and the truths
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
      <div className='py-8 px-64 bg-white'>
        <h2 className='text-3xl font-semibold mb-6'>the goal</h2>
        <p className='mb-4'>
          what is happening here is designed to be a powerful meditation
          practice.
        </p>
        <p className='mb-4'>if you want to experience how you think.</p>
        <p className='mb-4'>if you want to see yourself with more clarity.</p>
        <p className='mb-4'>if you want to know who you are.</p>
        <p className='mb-4'>welcome to the ankyverse.</p>
      </div>

      <div className='p-8 bg-gray-200 flex flex-row'>
        <div className='w-3/5 mx-auto'>
          <p>i need help</p>
          <p>all your feedback is gold</p>
          <p>@kithkui on x</p>
          <p>@jpfraneto on farcaster</p>
          <p>its all open source https://www.github.com/ankylat</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
