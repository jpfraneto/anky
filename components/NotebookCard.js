import React from 'react';
import Link from 'next/link';

const NotebookCard = ({ notebook }) => {
  // CHANGE THIS
  console.log('the notebook is: ', notebook);
  return (
    <Link href={`/notebook/${notebook.notebookId}`}>
      <div className='py-2 px-4 text-left m-2  rounded-xl bg-purple-400 hover:bg-purple-500 text-black'>
        <h2 className='text-2xl'>{notebook.metadata.title}</h2>
        <p className='-my-1'>
          {notebook.pages?.length || 0}/{notebook.metadata.prompts.length}{' '}
          prompts answered
        </p>
      </div>
    </Link>
  );
};

export default NotebookCard;
