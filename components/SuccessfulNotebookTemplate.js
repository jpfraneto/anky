import React, { useState } from 'react';
import Button from './Button';
import Link from 'next/link';

const SuccessfulNotebookTemplate = ({ template }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  async function createSharingLink() {
    console.log('the template is: ', template);
    const newLink = `https://www.anky.lat/template/${template.createdTemplateId}`;
    await navigator.clipboard.writeText(newLink);
    setLinkCopied(true);
  }
  return (
    <div>
      <p>Your template was created successfully:</p>
      <h2 className='text-2xl my-2'>{template.title}</h2>
      <div className='mx-auto w-48'>
        <Button
          buttonAction={createSharingLink}
          buttonText='Copy Link'
          buttonColor='bg-purple-500'
        />
      </div>
      {linkCopied && (
        <small className='text-red-600 text-sm'>
          the link is on your clipboard
        </small>
      )}
      <p className='mt-2'>
        I&apos;m working on the functionality for making all of this more
        interactive.
      </p>
      <p>All feedback is gold.</p>
      <p>Thank you.</p>
      <div className='bg-purple-600 px-4 py-2 rounded-xl mt-4 mx-auto w-48 border-black border hover:opacity-70'>
        <Link href={`/template/${template.createdTemplateId}`}>
          Visit Template
        </Link>
      </div>
    </div>
  );
};

export default SuccessfulNotebookTemplate;
