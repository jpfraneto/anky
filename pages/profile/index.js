import React from 'react';
import Image from 'next/image';
import Button from '../../components/Button';
import { useRouter } from 'next/router';

const Profile = () => {
  const router = useRouter();
  return (
    <div>
      <div className='rounded-full relative mt-8 mb-4 border-2 border-white overflow-hidden mx-auto w-2/3 aspect-square'>
        <Image src='/ankys/1.png' fill />
      </div>
      <p className='text-center text-2xl text-white mb-4 '>Lunamaria</p>
      <div className='flex flex-col space-y-2'>
        <Button
          buttonColor='bg-white text-black'
          buttonText='Get new avatar'
          buttonAction={() => router.push('/get-new-anky')}
        />
        <Button
          buttonColor='bg-green-700 text-white'
          buttonText='My asked questions'
          buttonAction={() => router.push('/profile/my-questions')}
        />
        <Button
          buttonColor='bg-purple-800 text-white'
          buttonText='My answered questions'
          buttonAction={() => router.push('/profile/answered-questions')}
        />
        <Button
          buttonColor='bg-red-800 text-white'
          buttonText='Delete account'
          buttonAction={() => alert('Holy shit')}
        />
      </div>
    </div>
  );
};

export default Profile;
