import React, { useState } from 'react';
import Button from './Button';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';

function LandingPage() {
  const { login, authenticated } = usePrivy();
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
            Embrace Your Inner Writer
          </h1>

          {authenticated ? (
            <div className='text-gray-400'>
              <div className='mt-2 flex space-x-2'>
                <Button
                  buttonText='dashboard'
                  buttonAction={() => router.push('/dashboard')}
                  buttonColor='bg-purple-400 text-black'
                />
                <Button
                  buttonText='prompt of the day'
                  buttonAction={() => router.push('/ankyverse')}
                  buttonColor='bg-green-400 text-black'
                />
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
                <Button
                  buttonText='start journey'
                  buttonColor='bg-purple-500'
                  buttonAction={() => setStartJourney(true)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Journey with Anky Section */}
      <div className='py-8 px-64 bg-white'>
        <h2 className='text-3xl font-semibold mb-6'>
          Embark on a Unique Journey with Anky
        </h2>
        <p className='mb-4'>
          Enter an enchanted notebook, guided by the ethereal whispers of Anky.
          Navigate pages filled with prompts that resonate with your soul and
          challenge your writing boundaries.
        </p>
        <p className='mb-4'>
          But tread with care. In Anky’s realm, a moment's hesitation, and the
          words vanish. It’s not just a test, it’s a dance of thoughts,
          challenging the boundaries of your creativity.
        </p>
      </div>

      {/* Discover your Anky Section */}
      <div className='p-8 bg-gray-200 flex flex-row'>
        <div className='w-3/5'>
          <h2 className='text-3xl font-semibold mb-6'>
            Unearth Your Anky: The Guardian of Stories
          </h2>
          <p className='mb-4'>
            Register and be bestowed with an Anky, a mystical guardian tailored
            to your narrative essence.
          </p>
          <p className='mb-4'>
            Your Anky safeguards your deepest stories, secrets, and the truths
            you pen.
          </p>
        </div>
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

      {/* Join the Ankyverse Section */}
      <div className='py-8 px-64 bg-white'>
        <h2 className='text-3xl font-semibold mb-6'>
          Dive Deeper into the Ankyverse
        </h2>
        <p className='mb-4'>
          The Ankyverse is a universe brimming with stories, dreams, and
          emotions. It's a world where each Anky tells its own tale, waiting for
          you to join the narrative.
        </p>
        <p className='mb-4'>
          Venture into a domain where words wield power and where stories unfold
          in mystical patterns. Find your place in the Ankyverse and let your
          Anky guide your way.
        </p>
      </div>
    </div>
  );
}

export default LandingPage;
