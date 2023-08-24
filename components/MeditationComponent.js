import React, { useState, useEffect, useRef } from 'react';
import { PWAProvider, usePWA } from '../context/pwaContext';

const MeditationComponent = () => {
  const audioRef = useRef();

  const { meditationReady, setMeditationReady } = usePWA();
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeLeft(Math.floor(audioRef.current.duration));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPlaying, timeLeft]);

  const startMeditation = () => {
    setIsPlaying(true);
    setIsStarted(true);
    if (audioRef.current) {
      console.log('in here');
      audioRef.current.play();
    }
  };

  return (
    <div className='h-full'>
      <audio
        ref={audioRef}
        src='/assets/meditation15.mp3'
        className='hidden'
        onPlay={() => setIsPlaying(true)}
        onEnded={() => {
          setIsPlaying(false);
          setMeditationReady(true);
        }}
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className='w-full h-full flex justify-center items-center text-center'>
          <div className='flex flex-col'>
            {/* This button is for testing purposes only */}
            <button onClick={() => setMeditationReady(true)}>
              meditation ready
            </button>
            <div className='text-5xl'>
              {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}
              {timeLeft % 60}
            </div>
            {!isPlaying ? (
              <button
                className='bg-purple-600 my-4 px-4 py-2 rounded-xl border-white border-2'
                onClick={startMeditation}
              >
                {!isStarted ? 'Start Guided Meditation' : 'Resume'}
              </button>
            ) : (
              <div>
                <button
                  className='bg-green-800  my-4 px-4 py-2 rounded-xl border-white border-2'
                  onClick={() => {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }}
                >
                  Pause
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationComponent;
