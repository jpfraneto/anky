import React, { useState, useEffect } from 'react';
import Button from './Button';
import { usePrivy } from '@privy-io/react-auth';

const steps = [
  {
    id: 'changeChain',
    label: 'Changing the blockchain network to base goerli',
  },
  {
    id: 'sendEther',
    label: 'Sending you some monopoly money to explore the app',
  },
  { id: 'airdrop', label: 'Looking for your companion in the Ankyverse' },
  {
    id: 'getTBA',
    label: 'Teaching your Anky how to store all your writing containers...',
  },
  { id: 'sendJournal', label: 'Gifting you your first journal' },
];

const AccountSetupModal = ({
  currentStep,
  setupIsReady,
  setShowProgressModal,
}) => {
  const { logout } = usePrivy();
  return (
    <div className='fixed top-0 left-0 w-full h-full bg-opacity-70 bg-gray-900 flex justify-center items-center z-100'>
      <div className='bg-white p-8 rounded-lg shadow-md space-y-4'>
        {/* <p onClick={logout}>logout</p> */}
        <h2 className='text-xl font-semibold'>Setting up your account...</h2>
        <p>
          (everything is deployed on a sandbox, no real money is in place
          here... yet.)
        </p>
        <ul>
          {steps.map((step, idx) => (
            <li key={step.id} className='flex items-center space-x-2'>
              <span>
                {currentStep > idx ? (
                  <span className='text-green-500'>✔️</span>
                ) : currentStep === idx ? (
                  <span className='text-yellow-500 animate-wave'>⏳</span>
                ) : (
                  <span className='text-gray-400'>⏺</span>
                )}
              </span>
              <span>{step.label}</span>
            </li>
          ))}
        </ul>
        {setupIsReady && (
          <div className='flex flex-col items-start justify-start'>
            <p className='mb-2'>Your are all set.</p>
            <Button
              buttonAction={() => setShowProgressModal(false)}
              buttonText='close this'
              buttonColor='bg-green-600 w-fit mr-auto'
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSetupModal;
