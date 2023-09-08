import { usePrivy, useWallets } from '@privy-io/react-auth';
import React, { useState, useEffect, useCallback } from 'react';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import contractABI from '../lib/contractABI.json';
import Link from 'next/link';
import Button from './Button';
import { TokenboundClient } from '@tokenbound/sdk';
import { usePWA } from '../context/pwaContext';
import CreateNotebook from './CreateNotebook';

const NotebooksPage = () => {
  const { login, ready, authenticated } = usePrivy();
  const { userAppInformation } = usePWA();

  const [displayCreateNotebook, setDisplayCreateNotebook] = useState(false);

  if (!userAppInformation) return <p>loading</p>;
  return (
    <div>
      <div className='bg-red-200 p-2'>
        <p>
          Your embedded wallet address is: {userAppInformation?.wallet?.address}
        </p>
        <p>The index of your anky is: {userAppInformation?.ankyIndex}</p>
        <p>
          The address of the Token Bound Account associated with your anky is:{' '}
          {userAppInformation?.tbaAddress}
        </p>
        <div className='w-48 mt-4 mx-auto'>
          <Button
            buttonAction={() => {
              setDisplayCreateNotebook(x => !x);
            }}
            buttonColor={displayCreateNotebook ? 'bg-red-300' : 'bg-green-300'}
            buttonText={displayCreateNotebook ? 'cancel' : 'create notebook'}
          />
        </div>
      </div>
      {displayCreateNotebook && (
        <CreateNotebook userAnky={userAppInformation} />
      )}
    </div>
  );
};

export default NotebooksPage;
