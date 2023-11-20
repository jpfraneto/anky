import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Spinner from './Spinner';
import Button from './Button';
import Link from 'next/link';
import { Dancing_Script } from 'next/font/google';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import buildersABI from '../lib/buildersABI.json';
import { processFetchedTemplate } from '../lib/notebooks.js';
import { useRouter } from 'next/router';
import { getCommunityWritings } from '../lib/irys.js';

const BUILDERS_NOTEBOOKS_CONTRACT_ADDRESS =
  '0xA06742b4018aec4602C3296D3CAcF0159F5234E8';

const dancingScript = Dancing_Script({ weight: '400', subsets: ['latin'] });

function BuildersPage() {
  const router = useRouter();
  const [writings, setWritings] = useState([]);
  const [displayedPage, setDisplayedPage] = useState(0);
  const [communityWritings, setCommunityWritings] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [provider, setProvider] = useState(null);
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  const handleKeyDown = event => {
    if (event.key === 'ArrowLeft') {
      setDisplayedPage(prevPage => {
        return Math.max(0, prevPage - 1);
      });
    } else if (event.key === 'ArrowRight') {
      setDisplayedPage(prevPage => {
        return Math.min(writings.length - 1, prevPage + 1);
      });
    }
  };

  useEffect(() => {
    const fetchWritings = async () => {
      if (!thisWallet) return;
      const theseWritings = await getCommunityWritings();
      console.log('these writings are:', theseWritings);
      setCommunityWritings(theseWritings);
      setLoadingFeed(false);
    };
    fetchWritings();
  }, [thisWallet]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (writings.length === 0)
    return (
      <div className='text-white'>
        <Spinner />
        <p>loading...</p>
      </div>
    );

  return (
    <div className='flex text-white space-x-2 mb-10 flex-col'>
      <h2 className='text-white text-xl mt-2'>community notebook</h2>
      <div className=' flex flex-col text-black'>
        <Notebook text={writings[displayedPage]} />;
        <div className='flex flex-nowrap w-96 mx-auto mb-2 overflow-x-scroll'>
          {writings.map((x, i) => {
            {
              return (
                <div
                  key={i}
                  className={`p-2 m-2 w-8 h-8 hover:cursor-pointer rounded-xl ${
                    displayedPage === i ? 'bg-green-600' : 'bg-slate-200'
                  } flex justify-center items-center`}
                  onClick={() => setDisplayedPage(i)}
                >
                  {i}
                </div>
              );
            }
          })}
        </div>
        <div className='w-48 mx-auto'>
          <Link href='/library' passHref>
            <Button buttonColor='bg-green-600' buttonText='my library' />
          </Link>
        </div>
      </div>
    </div>
  );
}

const Notebook = ({ text }) => {
  return (
    <div
      id='notebook-paper'
      className={`${dancingScript.className} text-2xl pt-7 text-left `}
    >
      <div id='content'>
        <div class='hipsum'>
          {text.split((x, i) => {
            return <p key={i}>{x}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

export default BuildersPage;
