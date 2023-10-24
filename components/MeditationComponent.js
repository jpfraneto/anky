import React, { useState, useEffect, useRef } from 'react';
import CircularPlayer from './CircularPlayer';
import Button from './Button';

const MeditationComponent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [dontHaveTime, setDontHaveTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dontHaveTimeFunction = () => {
    if (dontHaveTime) return setMeditationReady(true);
    setDontHaveTime(true);
  };

  return (
    <div className='pt-96 md:pt-64'>
      <div className='w-full flex justify-center items-center text-center'>
        <div className='flex h-fit flex-col'>
          <div className='w-full flex justify-center'>
            <CircularPlayer
              image='/ankys/elmasmejor.png'
              audio='/assets/meditation26.mp3'
            />
          </div>
          <div className='absolute left-1/2 -translate-x-1/2 bottom-8 w-7/12 mx-auto'>
            <Button
              buttonAction={dontHaveTimeFunction}
              buttonText={
                dontHaveTime ? 'Are you sure?' : `I don't have time for this`
              }
              buttonColor={dontHaveTime ? 'bg-red-600' : `bg-purple-600`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationComponent;
