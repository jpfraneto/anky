import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';

const WritingGame = ({
  onSubmit,
  placeholder = '',
  prompt,
  btnOneText = 'Save my writing anon',
  text,
  setText,
  btnTwoText = 'Discard',
  onDiscard,
  messageForUser,
  fullDisplay,
}) => {
  const [timeLeft, setTimeLeft] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [lastKeystroke, setLastKeystroke] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [lastTyped, setLastTyped] = useState(Date.now());
  const [startTime, setStartTime] = useState(null);
  const [lifeBarLength, setLifeBarLength] = useState(100);

  const textareaRef = useRef(null);
  const intervalRef = useRef(null);
  const keystrokeIntervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isDone) {
      intervalRef.current = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!isActive && !isDone) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, time, isDone]);

  useEffect(() => {
    if (isActive) {
      keystrokeIntervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - lastKeystroke;
        if (time === 480) {
          // audioRef.current.play();
        }
        if (elapsedTime > 3000 && !isDone) {
          finishRun();
        } else {
          // calculate life bar length
          const newLifeBarLength = 100 - elapsedTime / 30; // 100% - (elapsed time in seconds * (100 / 3))
          setLifeBarLength(Math.max(newLifeBarLength, 0)); // do not allow negative values
        }
      }, 100);
    } else {
      clearInterval(keystrokeIntervalRef.current);
    }

    return () => clearInterval(keystrokeIntervalRef.current);
  }, [isActive, lastKeystroke]);

  const handleTextChange = event => {
    setText(event.target.value);
    if (!isActive && event.target.value.length > 0) {
      setIsActive(true);
      setStartTime(Date.now());
    }
    setLastKeystroke(Date.now());
  };

  const finishRun = async () => {
    setLifeBarLength(0);
    setFinished(true);
    setIsDone(true);
    setIsActive(false);
    clearInterval(intervalRef.current);
    clearInterval(keystrokeIntervalRef.current);
  };

  if (!onDiscard) {
    onDiscard = async () => {
      await navigator.clipboard.writeText(text);
      alert('Your text was copied on the clipboard');
      setText('');
    };
  }

  if (!onSubmit) {
    onSubmit = async () => {
      await navigator.clipboard.writeText(text);
      alert(messageForUser);
      setText('');
    };
  }

  const startNewRun = () => {
    setTime(0);
    setText('');
    setFinished(false);
    setIsDone(false);
    setLifeBarLength(100);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    alert('Your writing is on the clipboard');
    startNewRun();
  };

  return (
    <div
      className={`${
        fullDisplay || text.length > 0
          ? 'h-1/2 z-30 px-2 left-0 absolute md:-translate-x-1/2 w-full md:mt-10 top-10 md:left-1/2'
          : 'my-4'
      } flex flex-col w-full md:w-96 md:mx-auto h-full rounded-xl`}
    >
      {(fullDisplay || text.length > 0) && (
        <div className='bg-black w-full text-2xl flex-none  pt-6 pb-2 px-2'>
          {prompt}
        </div>
      )}
      <div className='text-thewhite w-full h-8 flex rounded-xl overflow-hidden justify-between items-center'>
        <div className='h-full w-full bg-black'>
          <div
            className='h-full'
            style={{
              width: `${lifeBarLength}%`,
              backgroundColor: lifeBarLength > 30 ? 'green' : 'red',
            }}
          ></div>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        disabled={finished}
        style={{
          width: '100%',
          fontSize: '16px',
        }}
        placeholder='just write...'
        value={text}
        className={` p-2  bg-black ${
          text.length > 0 ? 'h-64' : 'h-64'
        } rounded-xl text-white border overflow-y-auto`} // Updated this line
        onChange={handleTextChange}
      />
      <div className='w-full flex justify-center'>
        <p className='text-2xl py-2'>{time}</p>
      </div>
      {(fullDisplay || text.length) > 0 && isDone && (
        <div
          className='h-8 mt-2 flex-none'
          style={{ display: 'flex', justifyContent: 'space-around' }}
        >
          <button
            className='bg-green-700 rounded-xl'
            style={{ width: '45%' }}
            onClick={() => {
              setWritingReady(true);
              onSubmit();
            }}
          >
            {btnOneText}
          </button>
          <button
            className='bg-red-700 rounded-xl'
            style={{ width: '45%' }}
            onClick={() => {
              copyToClipboard();
            }}
          >
            {btnTwoText}
          </button>
        </div>
      )}
    </div>
  );
};

export default WritingGame;
