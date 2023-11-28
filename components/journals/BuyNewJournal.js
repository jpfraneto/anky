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
  const [loading, setLoading] = useState(false);
  const [journalTitle, setJournalTitle] = useState('');
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [mintingNewJournal, setMintingNewJournal] = useState(false);
  const [mintedJournalId, setMintedJournalId] = useState(null);
  const [successfullyMintedJournal, setSuccessfullyMintedJournal] =
    useState(false);
  const { setUserAppInformation, appLoading } = useUser();

  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  const mintNewJournal = async size => {
    try {
      if (!thisWallet) {
        // Handle the case where the wallet is not available
        console.error('Wallet not available.');
        return;
      }
      if (journalTitle.length > 20) {
        return alert('The title must be less than 20 characters');
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

      // WHAT IS THE METADATA FOR THE JOURNAL?
      // Here i need to fetch bundlr with the information of the journal and update that metadata, which will be the starting thread of this particular journal... page 0
      // It can be a title, a description, a timecreated, an image associated, a starting point in the form of an UID.
      // Send the correct amount of Ether when minting
      const tx = await journalsContract.mintJournal(journalTitle);

      const receipt = await tx.wait();
      console.log('the receipt isss', receipt);

      // Process logs from the transaction receipt
      const eventTopic = ethers.utils.id(
        'JournalMinted(uint256, address, title)'
      );
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
            title: journalTitle,
          };
          let newJournals;
          console.log('the new journal element is: ', newJournalElement);

          setUserAppInformation(x => {
            console.log(
              'the x in the user app information before adding a new journal is: ',
              x
            );
            if (x.userJournals && x.userJournals.length > 0) {
              newJournals = [...x.userJournals, newJournalElement];
              setUserData('userJournals', newJournals);
              return {
                ...x,
                userJournals: newJournals,
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
            <p className='my-2'>success!</p>
            <p className='my-2'>you now own a new journal.</p>
            <div className='mt-2 w-48 mx-auto'>
              <Link passHref href={`/journal/${mintedJournalId}`}>
                <Button buttonColor='bg-green-600' buttonText='go to it' />
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
                <p className='mb-2 text-3xl'>new journal</p>
                <div>
                  <p className='mb-2'>this is a simple container</p>
                  <p className='mb-2'>that will store all of your writings.</p>
                  <input
                    onChange={e => setJournalTitle(e.target.value)}
                    type='text'
                    placeholder='journal title'
                    className='rounded-xl p-2 text-black'
                  />
                  <div className='flex justify-around w-96 mx-auto   my-4'>
                    <Button
                      buttonText='buy new journal'
                      buttonAction={mintNewJournal}
                      buttonColor='bg-green-600'
                    />
                    <Link href='/library' passHref>
                      <Button
                        buttonText='library'
                        buttonColor='bg-purple-600'
                      />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuyNewJournal;
