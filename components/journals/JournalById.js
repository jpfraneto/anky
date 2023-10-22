import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../Button';
import { formatUserJournal } from '../../lib/notebooks.js';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';
import Link from 'next/link';
import WritingGameComponent from '../WritingGameComponent';
import Spinner from '../Spinner';
import AnkyJournalsAbi from '../../lib/journalsABI.json'; // Assuming you have the ABI
import { useUser } from '../../context/UserContext';
import { setUserData } from '../../lib/idbHelper';

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

const JournalById = ({ setLifeBarLength, lifeBarLength }) => {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { userAppInformation } = useUser();
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [text, setText] = useState('');
  const [noJournals, setNoJournals] = useState(false);
  const [uploadingWriting, setUploadingWriting] = useState(false);
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [entryForDisplay, setEntryForDisplay] = useState(null);
  const [chosenPrompt, setChosenPrompt] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [writingForDisplay, setWritingForDisplay] = useState(null);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [whoIsWriting, setWhoIsWriting] = useState('');
  const { wallets } = useWallets();
  const { setUserAppInformation } = useUser();

  const thisWallet = wallets[0];

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEntryForDisplay(null);
  }, []);

  useEffect(() => {
    const handleKeyPress = event => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isModalOpen, closeModal]);

  useEffect(() => {
    async function fetchJournal() {
      try {
        const userJournals = userAppInformation.userJournals;
        console.log('the user app information is: ', userAppInformation);
        console.log(router.query);
        console.log('the user journals are: ', userJournals);

        if (userJournals?.length > 0) {
          const thisJournal = userJournals.filter(
            x => x.journalId === router.query.id
          );
          if (thisJournal.length > 0) {
            console.log('sajl', thisJournal);
            setJournal(thisJournal[0]);
            setLoading(false);
          } else {
            setNoJournals(true);
            throw Error('No journal found');
          }
        } else {
          setNoJournals(true);
          throw Error('No journal found');
        }
      } catch (error) {
        console.log('there was an error');
        console.error(error);
      }
    }

    fetchJournal();
  }, [thisWallet]);

  const writeOnJournal = async () => {
    const pagesWritten = journal.entries.length;
    console.log('the pages written are:', pagesWritten);
    if (pagesWritten >= transformJournalType(journal.journalType)) {
      alert('All pages have been written!');
      return;
    }
    const writingGameParameters = {
      notebookType: 'journal',
      targetTime: 480,
      backgroundImage: null, // You can modify this if you have an image.
      prompt: 'write as if the world was going to end', // You need to fetch and set the correct prompt.
      musicUrl: 'https://www.youtube.com/watch?v=HcKBDY64UN8',
      onFinish: updateJournalWithPage,
    };

    setWritingGameProps(writingGameParameters);
    setLoadWritingGame(true);
  };

  const updateJournalWithPage = async finishText => {
    try {
      console.log('inside the update journal with page function');
      const authToken = await getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/upload-writing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text: finishText }),
        }
      );

      const { cid } = await response.json();
      console.log('the cid is: ', cid);
      console.log('the WALLETS are: ', wallets);
      const provider = await thisWallet.getEthersProvider();
      let signer = await provider.getSigner();
      const journalsContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
        AnkyJournalsAbi,
        signer
      );
      console.log('the journals contract is: ', journalsContract);

      const pageNumber = journal.entries.length;
      console.log('the page number is', pageNumber);
      console.log('the notebook is: ', journal);
      const journalId = router.query.id;
      console.log('the journal id is: ', journalId, cid);
      console.log('the journals contract is: ', journalsContract);
      const tx = await journalsContract.writeJournalPage(journalId, cid, true);
      await tx.wait();
      console.log('after the response of writing in the journal', journal);
      setUserAppInformation(x => {
        // Find the specific journal index by its id
        const journalIndex = x.userJournals.findIndex(
          j => j.journalId == journalId
        );

        // If the journal is found
        if (journalIndex !== -1) {
          const updatedJournal = {
            ...x.userJournals[journalIndex],
            entries: [
              ...x.userJournals[journalIndex].entries,
              {
                cid: cid,
                isPublic: false,
                text: finishText,
                timestamp: new Date().getTime(),
              },
            ],
          };

          const updatedUserJournals = [
            ...x.userJournals.slice(0, journalIndex),
            updatedJournal,
            ...x.userJournals.slice(journalIndex + 1),
          ];

          setUserData('userJournals', updatedUserJournals);

          return {
            ...x,
            userJournals: updatedUserJournals,
          };
        }

        // Return the original state if the journal isn't found (for safety)
        return x;
      });

      setJournal(x => {
        return {
          ...x,
          entries: [
            ...journal.entries,
            {
              cid: cid,
              isPublic: false,
              text: finishText,
              timestamp: new Date().getTime(),
            },
          ],
        };
      });
      setLifeBarLength(0);
      setLoadWritingGame(false);
      console.log('after the setloadwrtinggame put into false');
    } catch (error) {
      setLoadWritingGame(false);
      setThereWasAnError(true);
      console.error('Failed to write to notebook:', error);
    }
  };

  function renderModal() {
    let content;
    if (entryForDisplay) {
      console.log('the entry for display is: ', entryForDisplay);
      content = entryForDisplay.content || entryForDisplay.text;
    }
    return (
      isModalOpen && (
        <div className='fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50'>
          <div className='bg-purple-300 overflow-y-scroll text-black rounded relative p-6 w-2/3 h-2/3'>
            <p
              onClick={closeModal}
              className='absolute top-1 cursor-pointer right-2 text-red-600'
            >
              close
            </p>
            <div className='overflow-y-scroll h-9/12'>
              {content ? (
                content.includes('\n') ? (
                  content.split('\n').map((x, i) => (
                    <p className='my-2' key={i}>
                      {x}
                    </p>
                  ))
                ) : (
                  <p className='my-2'>{content}</p>
                )
              ) : null}
            </div>
          </div>
        </div>
      )
    );
  }

  if (noJournals) {
    return (
      <div className='pt-8'>
        <p className='text-white mb-3'>
          this journal doesn&apos;t belong to you
        </p>
        <Link href='/library' passHref>
          <Button buttonText='my library' buttonColor='bg-green-600' />
        </Link>
      </div>
    );
  }

  if (loading)
    return (
      <div>
        <Spinner />
        <p className='text-white'>loading...</p>
      </div>
    );

  if (loadWritingGame)
    return (
      <WritingGameComponent
        {...writingGameProps}
        text={text}
        setLifeBarLength={setLifeBarLength}
        lifeBarLength={lifeBarLength}
        setText={setText}
        time={time}
        setTime={setTime}
        cancel={() => setLoadWritingGame(false)}
      />
    );

  if (thereWasAnError) {
    <div className='text-white'>
      <p>there was an error, but here is your writing:</p>
      <div className='p-2 bg-green-100'>
        {text.includes('\n')
          ? text.split('\n').map((x, i) => {
              return (
                <p key={i} className='my-2'>
                  {x}
                </p>
              );
            })
          : text.map((x, i) => {
              return (
                <p key={i} className='my-2'>
                  {x}
                </p>
              );
            })}
      </div>
      <Button
        buttonText='upload again'
        buttonColor='bg-green-600'
        buttonAction={() => updateJournalWithPage(text)}
      />
    </div>;
  }
  return (
    <div className='text-white pt-4'>
      <h2 className='text-2xl mb-4'>This is journal {journal.journalId}</h2>
      {journal.entries.length !== 0 ? (
        <div className='p-4 flex rounded-xl bg-yellow-500'>
          {journal.entries.map((x, i) => {
            return (
              <div
                key={i}
                onClick={() => {
                  setEntryForDisplay(x);
                  setIsModalOpen(true);
                }}
                className='px-2  py-1 m-1 w-8 h-8 flex justify-center items-center hover:bg-blue-600 cursor-pointer bg-blue-400 rounded-xl'
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <p>you haven&apos;t written here yet</p>
        </div>
      )}
      {journal.pagesLeft === 0 ? (
        <p className='text-4xl p-4 bg-red-400 rounded-xl hover:bg-red-600 hover:cursor-not-allowed my-4'>
          you wrote it all
        </p>
      ) : (
        <button
          onClick={writeOnJournal}
          className='text-4xl p-4 bg-red-400 rounded-xl hover:bg-red-600 my-4'
        >
          write journal
        </button>
      )}

      <div className='flex space-x-2 justify-center'>
        <Button
          buttonText='buy new journal'
          buttonColor='bg-purple-600'
          buttonAction={() => router.push('/journal/new')}
        />
        <Button
          buttonText='library'
          buttonColor='bg-green-600'
          buttonAction={() => router.push('/library')}
        />
      </div>
      {renderModal()}
    </div>
  );
};

export default JournalById;
