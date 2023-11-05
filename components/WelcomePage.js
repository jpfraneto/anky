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
      <p>it will be stored forever.</p>
      <p>encrypted with a secret language.</p>
      <p>that only your anky knows.</p>
      <p>if you have any questions about how this happens.</p>
      <p>just let jp know.</p>
      <p>that is how this system evolves.</p>
      <p>through the power of the collective.</p>
      <Link href='/journal/new'>get journal</Link>
    </div>
  );
};

export default WelcomePage;
