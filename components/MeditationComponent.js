import React, { useState, useEffect, useRef } from 'react';
import { PWAProvider, usePWA } from '../context/pwaContext';
import CircularPlayer from './CircularPlayer';

const MeditationComponent = () => {
  const audioRef = useRef();

  const { meditationReady, setMeditationReady } = usePWA();
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className='h-full'>
      <div className='w-full h-full flex justify-center items-center text-center'>
        <div className='flex flex-col'>
          {/* This button is for testing purposes only */}
          <button onClick={() => setMeditationReady(true)}>
            meditation ready
          </button>
          <div className='w-full flex justify-center'>
            <CircularPlayer
              image='/ankys/elmasmejor.png'
              audio='/assets/meditation15.mp3'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationComponent;
