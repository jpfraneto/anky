import React, { useState, useRef, useEffect, use } from 'react';
import classNames from 'classnames';
import Spinner from './Spinner';

const CircularPlayer = ({ image, audio, setMeditationReady }) => {
  const [active, setActive] = useState(false);
  const [strokeDashoffset, setStrokeDashoffset] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [audioSrc, setAudioSrc] = useState(audio);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    setAudioSrc(audio);
  }, [audio]);

  const checkAudioDuration = () => {
    if (audioRef.current && audioRef.current.readyState > 0) {
      // If the audio's metadata or more is available, set the duration.
      setTimeLeft(Math.floor(audioRef.current.duration));
      setLoadingAudio(false);
    }
  };

  useEffect(() => {
    checkAudioDuration();
  }, [audioSrc]);

  useEffect(() => {
    if (active && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [active, timeLeft]);

  let pathLength = null;
  let progressLoop = null;

  const onAudioMetadataLoaded = () => {
    setTimeLeft(Math.floor(audioRef.current.duration));
  };

  const onAudioEnded = () => {
    setMeditationReady(true);
    setActive(false);
    cancelAnimationFrame(progressLoop);
  };

  const updateProgressBar = () => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
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
      if (!pathLength) {
        startAnimation();
      }
      // audioRef.current.play();
    }

    setActive(!active);
  };

  return (
    <figure
      className={classNames('audio-bubble', { 'audio-bubble--active': active })}
    >
      <audio
        src={audio}
        ref={audioRef}
        onEnded={onAudioEnded}
        onLoadedMetadata={checkAudioDuration}
      />
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
        {loadingAudio ? (
          <Spinner />
        ) : (
          <span>
            {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}
            {timeLeft % 60}
          </span>
        )}
      </div>
    </figure>
  );
};

export default CircularPlayer;
