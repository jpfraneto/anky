import React from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ weight: ['400'], style: ['normal', 'italic'] });

const ReaderComponent = ({ metadata, content }) => {
  return (
    <div>
      <div className={`${lora.className} overflow-y-scroll h-9/12`}>
        {content ? (
          content.includes('\n') ? (
            content.split('\n').map((x, i) => (
              <p className='my-2' key={i}>
                {x}
              </p>
            ))
          ) : (
            <p className='my-2'>{content}</p>
          )
        ) : null}
      </div>
    </div>
  );
};

export default ReaderComponent;
