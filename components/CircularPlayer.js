import React, { useState, useRef, useEffect, use } from 'react';
import classNames from 'classnames';

const CircularPlayer = ({ image, audio, setMeditationReady }) => {
  const [active, setActive] = useState(false);
  const [strokeDashoffset, setStrokeDashoffset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (active && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [active, timeLeft]);

  useEffect(() => {
    if (audioRef && audioRef.current) {
      console.log('in here', audioRef.current.duration);
      duration = audioRef.current.duration;
      setTimeLeft(Math.floor(Math.floor(audioRef.current.duration)));
      setLoading(false);
    }
  }, []);

  let duration = null;
  let pathLength = null;
  let progressLoop = null;

  const onAudioEnded = () => {
    setActive(false);
  };

  const updateProgressBar = () => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;
    const percentage = currentTime / duration;
    const offset = percentage * pathLength;
    setStrokeDashoffset(pathLength - offset);
  };

  const startAnimation = () => {
    pathLength = progressRef.current.getTotalLength();
    setStrokeDashoffset(pathLength);
    progressRef.current.style.strokeDasharray = `${pathLength} ${pathLength}`;

    const progressUpdater = () => {
      updateProgressBar();
      progressLoop = requestAnimationFrame(progressUpdater);
    };
    progressLoop = requestAnimationFrame(progressUpdater);
  };

  const handleTogglePlay = () => {
    if (active) {
      cancelAnimationFrame(progressLoop);
      audioRef.current.pause();
    } else {
      if (!duration || !pathLength) {
        startAnimation();
      }
      audioRef.current.play();
    }

    setActive(!active);
  };

  return (
    <figure
      className={classNames('audio-bubble', { 'audio-bubble--active': active })}
    >
      <audio src={audio} ref={audioRef} onEnded={onAudioEnded} />
      <button onClick={handleTogglePlay} className='audio-bubble__button'>
        <svg viewBox='0 0 200 200' className='audio-bubble__progress'>
          <circle
            cx='100'
            cy='100'
            r='97'
            strokeWidth='3'
            fill='none'
            ref={progressRef}
            style={{ strokeDashoffset }}
          />
        </svg>
        <img
          className='audio-bubble__image'
          src={image}
          alt='Circular Player'
        />
        {!active && (
          <svg className='audio-bubble__play' viewBox='0 0 109.4 124.5'>
            <path
              fill='#fff'
              d='M106.4 57L9 .8C5-1.5 0 1.4 0 6v112.5c0 4.6 5 7.5 9 5.2l97.4-56.2c4-2.4 4-8.2 0-10.5z'
            />
          </svg>
        )}
        {active && (
          <svg className='audio-bubble__pause' viewBox='0 0 120.2 124.5'>
            <path
              fill='#fff'
              d='M114.2 124.5c3.3 0 6-2.7 6-6V6c0-3.3-2.7-6-6-6h-36c-3.3 0-6 2.7-6 6v112.5c0 3.3 2.7 6 6 6h36zM42 124.5c3.3 0 6-2.7 6-6V6c0-3.3-2.7-6-6-6H6C2.7 0 0 2.7 0 6v112.5c0 3.3 2.7 6 6 6h36z'
            />
          </svg>
        )}
      </button>
      <div className='text-4xl mt-16'>
        {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}
        {timeLeft % 60}
      </div>
    </figure>
  );
};

export default CircularPlayer;
