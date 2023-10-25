import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../Button';
import { setUserData } from '../../lib/idbHelper';
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
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [mintingNewJournal, setMintingNewJournal] = useState(false);
  const [mintedJournalId, setMintedJournalId] = useState(null);
  const [successfullyMintedJournal, setSuccessfullyMintedJournal] =
    useState(false);
  const [journalPrices, setJournalPrices] = useState({}); // Store journal prices
  const [displayJournalOption, setDisplayJournalOption] = useState(null);
  const { setUserAppInformation, appLoading } = useUser();

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
        setThereWasAnError(true);
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

      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const newCID = array[0];

      const priceWei = ethers.utils.parseUnits(price, 'ether');

      // Send the correct amount of Ether when minting
      const tx = await journalsContract.mintJournal(size, newCID, {
        value: priceWei,
      });
      const receipt = await tx.wait();
      console.log('the receipt isss', receipt);

      // Process logs from the transaction receipt
      const eventTopic = ethers.utils.id('JournalMinted(uint256,address)');
      console.log('the event topic is: ', eventTopic);
      for (const log of receipt.logs) {
        console.log('inside the log', log);
        if (log.topics[0]) {
          const decodedLog = journalsContract.interface.parseLog(log);
          console.log('the decoded log is: ', decodedLog);
          const { tokenId } = decodedLog.args;
          console.log('the token iddd is', tokenId);
          const newJournalElement = {
            journalId: tokenId.toString(),
            entries: [],
            journalType: size,
            metadataCID: '',
          };
          console.log('the new journal element is: ', newJournalElement);

          setUserAppInformation(x => {
            console.log(
              'the x in the user app information before adding a new journal is: ',
              x
            );
            setUserData('userJournals', [...x.userJournals, newJournalElement]);
            return {
              ...x,
              userJournals: [...x.userJournals, newJournalElement],
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
      setThereWasAnError(true);
      console.error('Failed to write to notebook:', error);
    }
  };

  if (thereWasAnError) {
    return (
      <div className='text-white my-4'>
        <p className='mb-2'>oops, there was an error</p>
        <div className='w-48 flex justify-center'>
          <Button
            buttonAction={() => {
              setMintingNewJournal(false);
              setThereWasAnError(false);
            }}
            buttonText='try again'
            buttonColor='bg-purple-600'
          />
        </div>
      </div>
    );
  }

  return (
    <div className='text-white pt-4'>
      <div>
        {successfullyMintedJournal ? (
          <div>
            <p className='my-2'>
              you now have a new journal where to download your consciousness
            </p>
            <p className='my-2'>the id of it is {mintedJournalId}</p>
            <div className='mt-2 w-48 mx-auto'>
              <Link passHref href={`/journal/${mintedJournalId}`}>
                <Button buttonColor='bg-green-600' buttonText='go to journal' />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {mintingNewJournal ? (
              <div>
                <Spinner />
                <p className='text-white'>processing your purchase</p>
              </div>
            ) : (
              <div>
                <p className='mb-2 text-3xl'>buy new journal</p>
                <p className='mb-4'>how many pages do you want?</p>
                {loading ? (
                  <div>
                    <Spinner /> <p>loading...</p>
                  </div>
                ) : (
                  <div>
                    <div className='flex justify-center mb-4'>
                      {[
                        { name: 'test', size: 0 },
                        { name: 'go', size: 1 },
                        { name: 'zen', size: 2 },
                      ].map((x, i) => {
                        return (
                          <div
                            key={i}
                            className='mx-4 text-center flex flex-col items-center rounded-xl bg-green-200 p-2 text-black'
                          >
                            <span
                              key={i}
                              onClick={() => mintNewJournal(x.size)}
                              className='m-2 bg-green-400 cursor-pointer hover:bg-green-600 shadow-lg shadow-black p-2 w-fit rounded-xl flex justify-center items-center'
                            >
                              {x.name}
                            </span>
                            <p>{transformJournalType(i)} pages</p>
                            <p>
                              {journalPrices[x.size] !== undefined
                                ? `${journalPrices[x.size]} ETH`
                                : ''}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <h2 className='mb-2'>important information</h2>
                    <p className='mb-2'>
                      the mission is to make what you will write here PRIVATE.
                    </p>
                    <p className='mb-2'>
                      encrypted using your wallet, so that only you can read the
                      contents of your notebook.
                    </p>
                    <p className='mb-2'>
                      yes, it is stored on the blockchain, but the information
                      inside it is not public.
                    </p>
                    <p className='mb-2'>
                      it will be stored forever, but you need to access through
                      this wallet in order to read what is inside.
                    </p>

                    <div className='mt-4 w-36 mx-auto'>
                      <Link href='/library' passHref>
                        <Button
                          buttonText='library'
                          buttonColor='bg-purple-600'
                        />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuyNewJournal;
