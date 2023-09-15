import React from 'react';
import Link from 'next/link';

const IndividualNotebookPage = () => {
  return (
    <div className='text-white'>
      <p>Fetch the notebook</p>
      <p>check if the user owns it</p>
      <p>if the user owns it, give her the prompt that comes</p>
      <p>if the user doesn&apos;t own it, redirect to the template screen</p>
      <Link href='/templates'>templates</Link>
    </div>
  );
};

export default IndividualNotebookPage;
