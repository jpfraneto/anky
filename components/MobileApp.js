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
      'an interface to develop practical tools for you to realize who you really are. a network of humans collaborating in awesome open source software here: <a className="text-yellow-600" href="https://www.github.com/ankylat" target="_blank">https://www.github.com/ankylat</a>',
  },
  {
    question: 'when?',
    image: 'when.png',
    oneLiner: 'forever on the blockchain. here. now.',
  },
  {
    question: 'where?',
    image: 'where.png',
    oneLiner:
      'on a small store in the city where you live. the coolest store in town.',
  },
  {
    question: 'who?',
    image: 'who.png',
    oneLiner: 'those that are serious about the quest for truth.',
  },
  {
    question: 'how?',
    image: 'how.png',
    oneLiner: 'by showing up. being who you already are. as simple as that.',
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
      <p className='text-white text-3xl'>{section.question}</p>
      {opened && (
        <p
          className='text-white'
          dangerouslySetInnerHTML={{ __html: section.oneLiner }}
        ></p>
      )}
    </div>
  );
};
