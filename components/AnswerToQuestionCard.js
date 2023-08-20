import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AnswerToQuestionCard = ({ answer, index }) => {
  return (
    <div
      onClick={() =>
        alert(
          'Grow this comment so that you can read it in here. If you tap again, it gets smaller.'
        )
      }
      className='w-full my-2 flex flex-row items-center  rounded-xl bg-gray-700 border-white border-2 shadow-orange-300 shadow-md'
    >
      <div className='w-1/4 flex items-center h-full justify-center '>
        <div className='w-11/12 aspect-square relative rounded-full m-2 overflow-hidden border-2 border-white'>
          <Image src={`/ankys/${index + 1}.png`} fill />
        </div>
      </div>

      <div className=' w-full text-sm '>
        <p>{answer.slice(0, 50)}...</p>
      </div>
    </div>
  );
};

export default AnswerToQuestionCard;
