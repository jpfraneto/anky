import React, { useState } from 'react';
import { usePWA } from '../context/pwaContext';
import Image from 'next/image';
import Button from '../components/Button';

const ChooseAnky = () => {
  const [chosenOne, setChosenOne] = useState('');
  const { ankyImages } = usePWA();

  const mintYourAnky = async () => {
    alert('Time to mint your anky on to the base blockchain');
  };

  if (ankyImages.length === 0)
    return (
      <>
        <p>You are not allowed here yet.</p>
        <button onClick={() => console.log(ankyImages)}>console</button>
      </>
    );
  return (
    <div>
      <h2 className='text-center text-xl '>choose your anky</h2>

      <div className='flex flex-wrap px-2'>
        {ankyImages.map((image, i) => {
          return (
            <div
              key={i}
              onClick={() => setChosenOne(image)}
              className='w-1/2 relative aspect-square'
            >
              <Image src={image} fill alt='Anky choice' />
            </div>
          );
        })}
      </div>
      {chosenOne && (
        <Button
          buttonText='Save Forever'
          buttonColor='bg-purple-500'
          buttonAction={mintYourAnky}
        />
      )}
    </div>
  );
};

export default ChooseAnky;
