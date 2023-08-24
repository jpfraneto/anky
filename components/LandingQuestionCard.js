import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LandingQuestionCard = ({
  question,
  id,
  avatar = '1',
  totalAnswers = 3,
  user,
  setDisplayAnswers,
  displayAnswers,
}) => {
  return (
    <button
      onClick={() => {
        if (setDisplayAnswers) setDisplayAnswers(x => !x);
      }}
    >
      <div className='w-full my-2 flex flex-row items-center  rounded-xl bg-black border-white border-2 shadow-orange-300 shadow-md'>
        <div className='w-1/4 flex items-center h-full justify-center '>
          <div className='z-0 w-11/12 aspect-square relative rounded-full m-2 overflow-hidden border-2 border-white'>
            <Image src={`/ankys/${avatar}.png`} fill alt='Anky' />
          </div>
        </div>

        <div className='flex flex-col w-3/4 p-2'>
          <div className='text-left text-sm w-full'>
            <p>{question}</p>
          </div>
          <div className='flex space-x-2'>
            <div className='flex space-x-1'>
              <span
                className={`${
                  displayAnswers ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {totalAnswers} answers
              </span>
            </div>

            <div className='flex space-x-1'>
              <span className=' text-gray-500'>
                @{user?.username || 'ankytheape'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default LandingQuestionCard;