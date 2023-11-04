import React from 'react';
import Link from 'next/link';

const WelcomePage = () => {
  return (
    <div className='text-white py-2 text-center'>
      <p>welcome to anky</p>
      <p>it is an honor to have you here.</p>
      <p>the first action you can take is get your first journal.</p>
      <p>which will be the container on which you will come to write.</p>
      <p>over and over again.</p>
      <Link href='/journal/new'>get journal</Link>
    </div>
  );
};

export default WelcomePage;
