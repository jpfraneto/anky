import React, { useState } from 'react';

const sections = [
  {
    question: 'why?',
    image: 'why.png',
    oneLiner:
      'because humanity is awakening and it is a hard process. like being born again but feeling that you are completely crazy.',
  },
  {
    question: 'what?',
    image: 'what.png',
    oneLiner:
      'an interface to develop open source practical tools for you to realize who you really are. please contribute here: <a className="text-yellow-600" href="https://www.github.com/ankylat" target="_blank">https://www.github.com/ankylat</a>',
  },
  {
    question: 'when?',
    image: 'when.png',
    oneLiner: 'forever on the blockchain. here. now.',
  },
  {
    question: 'where?',
    image: 'where.png',
    oneLiner: 'through the internet.',
  },
  {
    question: 'who?',
    image: 'who.png',
    oneLiner: 'those that are serious about the quest for truth.',
  },
  {
    question: 'how?',
    image: 'how.png',
    oneLiner:
      'by inspiring you with the raw truth that each of us has to offer.',
  },
];

const MobileApp = () => {
  return (
    <div className='h-screen'>
      {sections.map((x, i) => (
        <Element section={x} key={i} />
      ))}
    </div>
  );
};

export default MobileApp;

const Element = ({ section }) => {
  const [opened, setOpened] = useState(false);
  console.log('the section is: ', section);
  return (
    <div
      onClick={() => setOpened(x => !x)}
      className='h-1/6 p-4 w-full relative bg-cover'
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/ankys/${section.image}')`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <p className='text-white text-2xl'>{section.question}</p>
      {opened && (
        <p
          className='text-white text-sm'
          dangerouslySetInnerHTML={{ __html: section.oneLiner }}
        ></p>
      )}
    </div>
  );
};
