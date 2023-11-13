import React, { useState } from 'react';
import Button from './Button';
import Link from 'next/link';

const SuccessfulNotebook = ({ notebook }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  async function createSharingLink() {
    console.log('the notebook is: ', notebook);
    const newLink = `https://www.anky.lat/notebook/${notebook.notebookId}`;
    await navigator.clipboard.writeText(newLink);
    setLinkCopied(true);
  }
  return (
    <div>
      <p>Your notebook was created successfully:</p>
      <h2 className='text-2xl my-2'>{notebook.metadata.title}</h2>
      <div className='mx-auto w-48'>
        <Button
          buttonAction={createSharingLink}
          buttonText='copy invite link'
          buttonColor='bg-purple-500'
        />
      </div>
      {linkCopied && (
        <>
          <small className='text-red-600 text-sm'>
            the link is on your clipboard
          </small>
          <p className='mt-2'>
            You can now send the link of this notebook for people to buy it and
            write on it.
          </p>

          <div className='bg-purple-600 active:translate-x-1 active:translate-y-1 px-4 py-2 rounded-xl mt-4 mx-auto w-48 border-black border hover:opacity-70'>
            <Link href={`/notebook/${notebook.notebookId}`}>
              visit notebook
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SuccessfulNotebook;
