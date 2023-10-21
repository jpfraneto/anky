import React from 'react';
import Link from 'next/link';

const NotebookCard = ({ notebook }) => {
  // CHANGE THIS
  return (
    <Link href={`/notebook/${notebook.notebookId}`}>
      <div className='p-2 m-2 rounded-xl bg-purple-400 hover:bg-purple-500 text-black'>
        <h2 className='text-xl'>{notebook.template.metadata.title}</h2>
        <p>
          {notebook.userPages.length}/
          {notebook.template.metadata.prompts.length} prompts answered
        </p>
      </div>
    </Link>
  );
};

export default NotebookCard;
