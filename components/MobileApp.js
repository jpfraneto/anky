import React from 'react';

const sections = [
  {
    question: 'why?',
    image: '1.png',
    oneLiner: 'because humanity is awakening.',
  },
  {
    question: 'what?',
    image: '2.png',
    oneLiner:
      'an interface to develop practical tools for you to realize who you really are.',
  },
  {
    question: 'when?',
    image: '3.png',
    oneLiner: 'forever on the blockchain.',
  },
  {
    question: 'where?',
    image: '4.png',
    oneLiner: 'on a small store in the downtown of your city.',
  },
  {
    question: 'who?',
    image: '5.png',
    oneLiner: 'those that are serious about the quest for truth.',
  },
  {
    question: 'how?',
    image: '6.png',
    oneLiner: 'by showing up.',
  },
];

const MobileApp = () => {
  return (
    <div className='h-screen'>
      {sections.map((x, i) => {
        return (
          <div
            className='h-1/6 p-4 w-full relative bg-cover'
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/ankys/${x.image}')`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <p className='text-white text-3xl'>{x.question}</p>
          </div>
        );
      })}
    </div>
  );
};

export default MobileApp;
