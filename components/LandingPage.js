import React, { useState } from 'react';
import Button from './Button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import { useUser } from '../context/UserContext';

const notebookTypes = [
  {
    name: 'dementor',
    description:
      'your anky prompts you on a ongoing journey of self discovery.',
  },
  {
    name: 'notebook',
    description: 'created by others, you can buy and write on them.',
  },
  {
    name: 'eulogias',
    description:
      'community written notebook. want say happy birthday? say goodbye to someone that died? eulogias are for that.',
  },
  {
    name: 'journal',
    description: 'write without any direction. just do it.',
  },
];

function LandingPage() {
  const { login, authenticated } = usePrivy();
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
        <div className='absolute inset-0 bg-black opacity-40'></div>
        <div className='relative z-10 flex flex-col items-center justify-center h-full'>
          <h1 className='text-5xl text-gray-400 font-bold mt-32 mb-8'>
            {authenticated ? 'welcome back, my friend' : 'tell me who you are'}
          </h1>

          {authenticated ? (
            <div className='text-gray-400'>
              <div className='mt-2 flex space-x-2'>
                {libraryLoading ? (
                  <Button
                    disabled
                    buttonText='loading your library...'
                    buttonColor='bg-purple-400 text-black'
                  />
                ) : (
                  <>
                    <Link href='/library' passHref>
                      <Button
                        buttonText='library'
                        buttonColor='bg-purple-400 text-black'
                      />
                    </Link>
                    {/* <Link href='/journal' passHref>
                      <Button
                        buttonText='journal'
                        buttonColor='bg-green-400 text-black'
                      />
                    </Link> */}
                    <Link href='/dementor' passHref>
                      <Button
                        buttonText='dementor'
                        buttonColor='bg-red-400 text-black'
                      />
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
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
                    buttonAction={() => router.push('/ankyverse')}
                    buttonColor='bg-green-400 text-black mx-1'
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Journey with Anky Section */}
      <div className='py-8 px-2 w-full md:px-64 bg-white'>
        <h2 className='text-3xl font-semibold mb-6'>
          welcome to a self inquiry tool like no other.
        </h2>
        <p className='mb-4'>
          writing is the vehicle, and anky is built on top of a pioneer system:
        </p>
        <p className='mb-4'>
          if you stop writing for more than three seconds, you lose.
        </p>
        <p className='mb-4'>as simple as that.</p>

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
            all of them powered by a unique writing mechanism: consciousness
            dumping.
          </p>
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
          that itself is stored inside the blockchain, creating a unique storage
          system designed to save your writings forever.
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
