import { usePrivy, useWallets } from '@privy-io/react-auth';
import React, { useState, useEffect, useCallback } from 'react';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import Link from 'next/link';
import Button from './Button';
import { TokenboundClient } from '@tokenbound/sdk';
import { usePWA } from '../context/pwaContext';
import CreateNotebookTemplate from './CreateNotebookTemplate';
import TemplatesList from './TemplatesList';

const NotebooksPage = () => {
  const { login, ready, authenticated } = usePrivy();
  const { userAppInformation } = usePWA();

  const [displayCreateNotebook, setDisplayCreateNotebook] = useState(false);

  if (!userAppInformation)
    return (
      <div className='text-white'>
        <p>If you want to understand how this will work...</p>
        <p>Help me code it!</p>
        <a
          rel='noopener noreferrer'
          href='https://www.githubg.com/ankylat/smart_contracts'
          target='_blank'
        >
          https://www.githubg.com/ankylat/smart_contracts
        </a>
      </div>
    );

  return (
    <div className='text-white pt-4 flex flex-col aloja'>
      <p className='text-2xl'>
        What has happened since you logged in for the first time:
      </p>
      <p className='text-xl '>
        1. A brand new ethereum account was created on base goerli for you.
      </p>
      <small>
        (if you don&apos;t believe me, it&apos;s address is{' '}
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={`https://goerli.basescan.org/address/${userAppInformation.wallet?.address}`}
        >
          {userAppInformation.wallet?.address}
        </a>
        )
      </small>
      <p className='text-xl '>
        2. You were airdropped some eth and an NFT into that wallet. Your anky.
      </p>
      <p className='text-xl '>
        3. A Token Bound Account was created for that NFT.
      </p>
      <small>
        (this means that it behaves as if it was a wallet - it&apos;s address is{' '}
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={`https://goerli.basescan.org/address/${userAppInformation.tbaAddress}`}
        >
          {userAppInformation.tbaAddress}
        </a>
        )
      </small>
      <p className='text-xl '>
        4. Your writing was added to the 100 Builders Notebook.
      </p>
      <p className='text-xl '>
        5. You have the 100 builders notebook inside your Anky.
      </p>

      <h2 className='mt-24'>The mission is to make crypto invisible.</h2>
      <h2>To build something that the world has not seen before.</h2>
      {/* <h2 className='text-white'>Templates</h2>
      <div>
        <TemplatesList />
      </div>
      <h2 className='text-white'>Notebooks</h2> */}

      {/* {userAppInformation?.wallet?.address && (
          <p>
            Your embedded wallet address is:{' '}
            {userAppInformation?.wallet?.address}
          </p>
        )}

        {userAppInformation?.ankyIndex && (
          <p>The index of your anky is: {userAppInformation?.ankyIndex}</p>
        )} */}
      {/* {userAppInformation?.tbaAddress && (
          <>
            <p>
              The address of the Token Bound Account associated with your anky
              is: {userAppInformation?.tbaAddress}
            </p>
            <div className='w-48 mt-4 mx-auto'>
              <Button
                buttonAction={() => {
                  setDisplayCreateNotebook(x => !x);
                }}
                buttonColor={
                  displayCreateNotebook ? 'bg-red-300' : 'bg-green-300'
                }
                buttonText={
                  displayCreateNotebook ? 'cancel' : 'create notebook template'
                }
              />
            </div>
          </>
        )} */}

      {displayCreateNotebook && (
        <CreateNotebookTemplate userAnky={userAppInformation} />
      )}
    </div>
  );
};

export default NotebooksPage;
