import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Spinner from './Spinner';
import { Dancing_Script } from 'next/font/google';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import buildersABI from '../lib/buildersABI.json';
import { processFetchedTemplate } from '../lib/notebooks.js';

const BUILDERS_NOTEBOOKS_CONTRACT_ADDRESS =
  '0x1AbaF6A56b963621507c854e9F3a52BF95ecd645';

const dancingScript = Dancing_Script({ weight: '400', subsets: ['latin'] });

function BuildersPage() {
  const [writings, setWritings] = useState([]);
  const [displayedPage, setDisplayedPage] = useState(0);
  const [provider, setProvider] = useState(null);
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function fetchWritings() {
      if (!thisWallet) return;

      let fetchedProvider = await thisWallet.getEthersProvider();
      setProvider(fetchedProvider); // Setting the provider to the state
      let signer = await fetchedProvider.getSigner();

      const writingsContract = new ethers.Contract(
        BUILDERS_NOTEBOOKS_CONTRACT_ADDRESS,
        buildersABI,
        signer
      );
      const writingsCount = await writingsContract.getTotalWritings();
      const fetchedWritings = [];

      const allWritings = await writingsContract.getAllWritings();
      const writingsContent = await Promise.all(
        allWritings.map(async url => {
          const response = await fetch(url);
          console.log('in here, the response is: ', response);
          return await response.text();
        })
      );
      setWritings(writingsContent);
    }

    fetchWritings();
  }, [thisWallet]);

  const changeDisplayedPage = () => {};

  if (!thisWallet) return <p>Please login first.</p>;

  if (writings.length === 0)
    return (
      <div>
        <Spinner />
        <p>loading...</p>
      </div>
    );

  return (
    <div className='flex text-white space-x-2  flex-col'>
      <div className=' flex flex-col text-black'>
        <Notebook text={writings[displayedPage]} />;
        <div className='flex w-full overflow-x-scroll'>
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
      </div>
    </div>
  );
}

const Notebook = ({ text }) => {
  console.log('the text is: ', text);
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
