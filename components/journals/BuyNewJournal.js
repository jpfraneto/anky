import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../Button';
import { setUserData } from '../../lib/idbHelper';
import { formatUserJournal } from '../../lib/notebooks.js';
import { encryptData } from '../../lib/encryption';
import { generatePagePasswords } from '../../lib/helpers';
import { uploadToIrys } from '../../lib/irys';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';
import WritingGameComponent from '../WritingGameComponent';
import { useUser } from '../../context/UserContext';
import Spinner from '../Spinner';
import AnkyJournalsAbi from '../../lib/journalsABI.json'; // Assuming you have the ABI
import Link from 'next/link';

const BuyNewJournal = () => {
  const router = useRouter();
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [journalPrice, setJournalPrice] = useState(null);
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [mintingNewJournal, setMintingNewJournal] = useState(false);
  const [mintedJournalId, setMintedJournalId] = useState(null);
  const [successfullyMintedJournal, setSuccessfullyMintedJournal] =
    useState(false);
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

        const fetchedJournalPrice = await journalsContract.journalPrice();
        setJournalPrice(fetchedJournalPrice);
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
      console.log('in heeere');

      if (!journalPrice) {
        // Handle the case where the price is not available
        console.error('Price not available for size', size);
        return;
      }

      // WHAT IS THE METADATA FOR THE JOURNAL?
      // Here i need to fetch bundlr with the information of the journal and update that metadata, which will be the starting thread of this particular journal... page 0
      // It can be a title, a description, a timecreated, an image associated, a starting point in the form of an UID.z
      const metadataCID = '';
      const rawPasswords = generatePagePasswords(96);
      console.log('the raw passwords are: ', rawPasswords);
      const encryptedRawPasswords = await encryptData(
        thisWallet,
        provider,
        JSON.stringify(rawPasswords)
      );
      console.log('the encrypted raw passwords are: ', encryptedRawPasswords);

      const passwordsCID = await uploadToIrys(
        thisWallet,
        encryptedRawPasswords
      );
      console.log('outside here, the passwords cid is: ', passwordsCID);
      // Send the correct amount of Ether when minting
      // function mintJournal(uint256 randomUID, string memory metadataCID, string memory passwordsCID) external onlyAnkyOwner {
      const tx = await journalsContract.mintJournal(metadataCID, passwordsCID);

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
            metadataCID: '',
          };
          console.log('the new journal element is: ', newJournalElement);

          setUserAppInformation(x => {
            console.log(
              'the x in the user app information before adding a new journal is: ',
              x
            );
            if (x.userJournals) {
              setUserData('userJournals', [
                ...x.userJournals,
                newJournalElement,
              ]);
              return {
                ...x,
                userJournals: [...x.userJournals, newJournalElement],
              };
            } else {
              setUserData('userJournals', [newJournalElement]);
              return {
                ...x,
                userJournals: [newJournalElement],
              };
            }
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
                <p className='mb-4'>it has 96 pages.</p>
                {loading ? (
                  <div>
                    <Spinner /> <p>loading...</p>
                  </div>
                ) : (
                  <div>
                    <div className='flex justify-center mb-4'>
                      <span
                        onClick={() => mintNewJournal()}
                        className='m-2 bg-green-400 cursor-pointer hover:bg-green-600 shadow-lg shadow-black p-2 w-fit rounded-xl flex justify-center items-center'
                      >
                        buy new journal
                      </span>
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
