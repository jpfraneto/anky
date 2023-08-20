import React, { useState, useEffect, useRef } from 'react';

const WritingGame = ({ onSubmit, placeholder = '', prompt }) => {
  const [timeLeft, setTimeLeft] = useState(3);
  const [isWriting, setIsWriting] = useState(true);
  const [text, setText] = useState('');
  const [lastTyped, setLastTyped] = useState(Date.now());

  const textareaRef = useRef(null);

  useEffect(() => {
    if (isWriting) {
      const interval = setInterval(() => {
        const timeDiff = Math.floor((Date.now() - lastTyped) / 1000);
        setTimeLeft(3 - timeDiff);
        if (timeDiff >= 3) {
          setIsWriting(false);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isWriting, lastTyped]);

  const handleKeystroke = () => {
    setLastTyped(Date.now());
  };

  const handleSubmit = () => {
    onSubmit(text);
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          height: '5%',
          backgroundColor: timeLeft === 0 ? 'red' : 'green',
        }}
      >
        {timeLeft}s
      </div>
      <textarea
        ref={textareaRef}
        style={{
          width: '100%',
          height: isWriting ? '95%' : '90%',
          fontSize: '16px',
        }}
        placeholder={prompt}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyPress={handleKeystroke}
        disabled={!isWriting}
      />
      {!isWriting && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button style={{ width: '50%' }} onClick={handleSubmit}>
            Publish
          </button>
          <button style={{ width: '50%' }} onClick={() => setText('')}>
            Discard
          </button>
        </div>
      )}
    </div>
  );
};

export default WritingGame;
