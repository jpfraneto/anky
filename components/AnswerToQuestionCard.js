import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AnswerToQuestionCard = ({ answer, index }) => {
  const [opened, setOpened] = useState(false);
  return (
    <div
      onClick={() => setOpened(x => !x)}
      className='w-full my-2 flex flex-row items-center  rounded-xl bg-gray-700 border-white border-2 shadow-orange-300 shadow-md'
    >
      <div className='w-1/4 flex items-center h-full justify-center '>
        <div className='w-11/12 aspect-square relative rounded-full m-2 overflow-hidden border-2 border-white'>
          <Image src={`/ankys/${index + 1}.png`} fill />
        </div>
      </div>

      <div className=' w-full text-sm '>
        <p>
          {answer.slice(0, `${opened ? answer.length : '50'}`)}
          {opened && '...'}
        </p>
      </div>
    </div>
  );
};

export default AnswerToQuestionCard;
