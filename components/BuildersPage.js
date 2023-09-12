import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import buildersABI from '../lib/buildersABI.json';
import { processFetchedTemplate } from '../lib/notebooks.js';

const BUILDERS_NOTEBOOKS_CONTRACT_ADDRESS =
  '0x1AbaF6A56b963621507c854e9F3a52BF95ecd645';

function BuildersPage() {
  const [writings, setWritings] = useState([]);
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
      console.log(`there are ${writingsCount} writings`);
      const fetchedWritings = [];

      const allWritings = await writingsContract.getAllWritings();
      console.log('all the writings are: ', allWritings);
      const writingsContent = await Promise.all(
        allWritings.map(async url => {
          const response = await fetch(url);
          console.log('in here, the response is: ', response);
          return await response.text();
        })
      );
      console.log('the writings content is: ', writingsContent);
      setWritings(writingsContent);
    }

    fetchWritings();
  }, [thisWallet]);

  if (!writings) return <p>There are no writings</p>;

  return (
    <div className='flex text-white space-x-2'>
      {writings.map((writing, index) => (
        <p>{writing}</p>
      ))}
    </div>
  );
}

export default BuildersPage;
