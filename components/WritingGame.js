import React, { useState, useEffect, useRef } from 'react';

const WritingGame = ({
  onSubmit,
  placeholder = '',
  prompt,
  btnOneText = 'Save my writing',
  text,
  setText,
  btnTwoText = 'Discard',
  messageForUser,
  fullDisplay = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(3);
  const [isWriting, setIsWriting] = useState(false);
  const [lastTyped, setLastTyped] = useState(Date.now());

  const textareaRef = useRef(null);

  const handleKeystroke = () => {
    setLastTyped(Date.now());
  };

  const handleDiscard = async () => {
    await navigator.clipboard.writeText(text);
    alert('Your text was copied on the clipboard');
    setText('');
  };

  if (!onSubmit) {
    onSubmit = async () => {
      await navigator.clipboard.writeText(text);
      alert(messageForUser);
      setText('');
    };
  }

  return (
    <div
      className={`${
        fullDisplay || text.length > 0
          ? 'h-1/2 z-50 absolute top-0 left-0'
          : 'my-4'
      } flex flex-col w-full rounded-xl`}
    >
      {(fullDisplay || text.length > 0) && (
        <div className='w-full text-sm flex-none bg-black py-2 px-2'>
          {prompt}
        </div>
      )}
      <textarea
        ref={textareaRef}
        style={{
          width: '100%',
          fontSize: '16px',
        }}
        placeholder='Your answer here...'
        value={text}
        className={`flex-grow p-2 bg-black ${
          text.length > 0 ? 'h-full' : 'h-24'
        } rounded-xl text-white border overflow-y-auto`} // Updated this line
        onChange={e => {
          setText(e.target.value);
        }}
      />
      {(fullDisplay || text.length) > 0 && (
        <div
          className='h-8 flex-none'
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <button
            className='bg-green-700'
            style={{ width: '50%' }}
            onClick={onSubmit}
          >
            {btnOneText}
          </button>
          <button
            className='bg-red-700'
            style={{ width: '50%' }}
            onClick={handleDiscard}
          >
            {btnTwoText}
          </button>
        </div>
      )}
    </div>
  );
};

export default WritingGame;
