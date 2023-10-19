import React, { useState } from 'react';
import Button from '../Button';
import Link from 'next/link';

const SuccessfulEulogiaTemplate = ({ eulogia }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  async function createSharingLink() {
    console.log('the eulogia is: ', eulogia);
    const newLink = `https://www.anky.lat/eulogias/${eulogia.createdEulogiaId}`;
    await navigator.clipboard.writeText(newLink);
    setLinkCopied(true);
  }
  return (
    <div className='pt-2'>
      <p>Your eulogia was created successfully:</p>
      <h2 className='text-2xl my-2'>{eulogia.title}</h2>
      <p>{eulogia.pages} people can write here</p>
      <div className='mx-auto w-48 mt-2'>
        <Button
          buttonAction={createSharingLink}
          buttonText='Copy Invite Link'
          buttonColor='bg-purple-500'
        />
      </div>
      {linkCopied && (
        <>
          <small className='text-red-600 text-sm'>
            the link is on your clipboard
          </small>
          <p className='mt-2'>
            I&apos;m working on the functionality for making all of this more
            interactive.
          </p>
          <p>All feedback is gold.</p>
          <p>Thank you.</p>
          <div className='w-48 mx-auto mt-2'>
            <Link href={`/eulogias/${eulogia.createdEulogiaId}`} passHref>
              <Button buttonColor='bg-orange-600' buttonText='visit eulogia' />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SuccessfulEulogiaTemplate;
