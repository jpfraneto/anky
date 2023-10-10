import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../Button';
import { formatUserJournal } from '../../lib/notebooks.js';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';
import WritingGameComponent from '../WritingGameComponent';
import { useUser } from '../../context/UserContext';
import Spinner from '../Spinner';
import AnkyJournalsAbi from '../../lib/journalsABI.json'; // Assuming you have the ABI
import Link from 'next/link';

function transformJournalType(index) {
  switch (index) {
    case 0:
      return 8;
    case 1:
      return 32;
    case 2:
      return 64;
  }
}

const BuyNewJournal = () => {
  const router = useRouter();
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mintingNewJournal, setMintingNewJournal] = useState(false);
  const [mintedJournalId, setMintedJournalId] = useState(null);
  const [successfullyMintedJournal, setSuccessfullyMintedJournal] =
    useState(false);
  const [journalPrices, setJournalPrices] = useState({}); // Store journal prices
  const [displayJournalOption, setDisplayJournalOption] = useState(null);
  const { userAppInformation, setUserAppInformation, appLoading } = useUser();

  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function fetchJournalPrices() {
      try {
        const provider = await thisWallet.getEthersProvider();
        const journalsContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
          AnkyJournalsAbi,
          provider
        );

        // Fetch journal prices
        const [smallJournalPrice, mediumJournalPrice, largeJournalPrice] =
          await Promise.all([
            journalsContract.smallJournalPrice(),
            journalsContract.mediumJournalPrice(),
            journalsContract.largeJournalPrice(),
          ]);

        const smallJournalPriceEth = ethers.utils.formatUnits(
          smallJournalPrice,
          'ether'
        );
        const mediumJournalPriceEth = ethers.utils.formatUnits(
          mediumJournalPrice,
          'ether'
        );
        const largeJournalPriceEth = ethers.utils.formatUnits(
          largeJournalPrice,
          'ether'
        );

        setJournalPrices({
          0: smallJournalPriceEth,
          1: mediumJournalPriceEth,
          2: largeJournalPriceEth,
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch journal prices:', error);
      }
    }

    if (thisWallet) {
      fetchJournalPrices();
    }
  }, [thisWallet]);

  const mintNewJournal = async size => {
    try {
      if (!thisWallet) {
        // Handle the case where the wallet is not available
        console.error('Wallet not available.');
        return;
      }
      setMintingNewJournal(true);
      const provider = await thisWallet.getEthersProvider();
      const signer = await provider.getSigner();

      const journalsContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
        AnkyJournalsAbi,
        signer
      );

      // Get the price for the selected journal size
      const price = journalPrices[size];

      if (!price) {
        // Handle the case where the price is not available
        console.error('Price not available for size', size);
        return;
      }

      const priceWei = ethers.utils.parseUnits(price, 'ether');

      // Send the correct amount of Ether when minting
      const tx = await journalsContract.mintJournal(size, {
        value: priceWei,
      });
      const receipt = await tx.wait();

      // Process logs from the transaction receipt
      const eventTopic = ethers.utils.id('JournalMinted(uint256,address)');
      for (const log of receipt.logs) {
        if (log.topics[0] === eventTopic) {
          const decodedLog = journalsContract.interface.parseLog(log);
          const { tokenId } = decodedLog.args;
          setUserAppInformation(x => {
            console.log(
              'the x in the user app information before adding a new journal is: ',
              x
            );
            return {
              ...x,
              journals: [...x.journals, { journalId: tokenId, entries: [] }],
            };
          });
          setMintedJournalId(tokenId.toString()); // Save the tokenId to state
          setSuccessfullyMintedJournal(true);
          setMintingNewJournal(false);

          break; // Exit loop once you find the first event that matches
        }
      }

      console.log('after the journal was minted');
    } catch (error) {
      console.error('Failed to write to notebook:', error);
    }
  };

  if (loading)
    return (
      <div className='text-white'>
        <Spinner />
        <p>loading...</p>
      </div>
    );

  return (
    <div className='text-white pt-4'>
      {successfullyMintedJournal ? (
        <div>
          <p className='my-2'>
            you now have a new journal where to download your consciousness
          </p>
          <p className='my-2'>the id of it is {mintedJournalId}</p>
          <Link
            href={`/journal/${mintedJournalId}`}
            className='p-2 bg-green-600 rounded-xl'
          >
            go to journal
          </Link>
        </div>
      ) : (
        <>
          {mintingNewJournal ? (
            <div>
              <Spinner />
              <p className='text-white'>minting your new journal</p>
            </div>
          ) : (
            <div>
              <p className='mb-2'>mint new journal</p>
              <p className='mb-4'>how many pages do you want?</p>
              <div className='flex'>
                {[0, 1, 2].map((x, i) => {
                  return (
                    <div
                      key={i}
                      className='mx-4 text-center flex flex-col items-center rounded-xl bg-red-200 p-2 text-black'
                    >
                      <span
                        key={i}
                        onClick={() => mintNewJournal(x)}
                        className='m-2 bg-red-400 cursor-pointer hover:bg-red-600 shadow-lg shadow-black p-2 w-8 h-8 rounded-xl flex justify-center items-center'
                      >
                        {x}
                      </span>
                      <p>{transformJournalType(x)} pages</p>
                      <p>
                        {journalPrices[x] !== undefined
                          ? `${journalPrices[x]} ETH`
                          : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className='mt-4 w-36 mx-auto'>
                <Link href='/library' passHref>
                  <Button buttonText='go back' buttonColor='bg-red-600' />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BuyNewJournal;
