import React from 'react';
import LandingQuestionCard from '../../components/LandingQuestionCard';

const MyQuestions = () => {
  return (
    <div className='flex flex-col w-full px-4 mt-24'>
      <LandingQuestionCard
        question='How was the last time you were drunk?'
        id='1'
      />
      <LandingQuestionCard
        question='What have you never been able to say to your father?'
        id='2'
      />
      <LandingQuestionCard
        question='What is your biggest unmet need in life?'
        id='3'
      />
    </div>
  );
};

export default MyQuestions;
