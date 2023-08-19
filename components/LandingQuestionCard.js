import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LandingQuestionCard = ({ question, id, avatar = '1' }) => {
  return (
    <Link href={`/question/${id}`} passHref>
      <div className='w-full my-2 flex flex-row  rounded-xl bg-black border-white border-2 shadow-orange-300 shadow-md'>
        <div className='w-1/3 aspect-square relative rounded-full m-2 overflow-hidden border-2 border-white'>
          <Image src={`/ankys/${avatar}.png`} fill />
        </div>
        <div className='m-2 w-2/3'>
          <p>{question}</p>
        </div>
      </div>
    </Link>
  );
};

export default LandingQuestionCard;
