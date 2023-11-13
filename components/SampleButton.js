import React from 'react';

const SampleButton = ({ notebook, setExampleNotebook }) => {
  return (
    <button
      type='button'
      onClick={() => setExampleNotebook(notebook)}
      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2'
    >
      {notebook.title}
    </button>
  );
};

export default SampleButton;
