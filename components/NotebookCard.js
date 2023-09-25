import React from 'react';
import Link from 'next/link';

const NotebookCard = ({ notebook }) => {
  console.log('in here', notebook);
  // CHANGE THIS
  notebook.notebookId = 0;
  return (
    <Link href={`/notebook/${notebook.notebookId}`}>
      <div className='p-2 m-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-black'>
        <h2>{notebook.template.metadata.title}</h2>
        <p>
          {notebook.userPages.length}/
          {notebook.template.metadata.prompts.length} answered
        </p>
      </div>
    </Link>
  );
};

export default NotebookCard;