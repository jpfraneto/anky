import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Button from '../Button';
import { formatUserJournal } from '../../lib/notebooks.js';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';
import WritingGameComponent from '../WritingGameComponent';
import Spinner from '../Spinner';
import AnkyJournalsAbi from '../../lib/journalsABI.json'; // Assuming you have the ABI

function transformJournalType(index) {
  switch (index) {
    case 0:
      return 8;
    case 1:
      return 16;
    case 2:
      return 32;
  }
}

const JournalById = ({ setLifeBarLength, lifeBarLength }) => {
  const router = useRouter();
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [text, setText] = useState('');
  const [uploadingWriting, setUploadingWriting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [chosenPrompt, setChosenPrompt] = useState('');
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [writingForDisplay, setWritingForDisplay] = useState(null);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [whoIsWriting, setWhoIsWriting] = useState('');
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function fetchJournal() {
      try {
        if (!thisWallet) return;
        const journalId = router.query.id;

        let fetchedProvider = await thisWallet.getEthersProvider();
        setProvider(fetchedProvider);
        let signer = await fetchedProvider.getSigner();
        const journalsContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
          AnkyJournalsAbi,
          signer
        );
        console.log('this journal id is: ', journalId);
        const thisJournal = await journalsContract.getJournal(journalId);
        console.log('the journal is: ', thisJournal);

        const formattedJournal = await formatUserJournal(thisJournal);
        console.log('the formatted journal is: ', formattedJournal);
        if (thisJournal && formattedJournal) {
          setJournal(formattedJournal);
          setLoading(false);
        } else {
          throw Error('No notebook found');
        }
      } catch (error) {
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks/upload-writing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: finishText }),
        }
      );

      const { cid } = await response.json();
      console.log('the cid is: ', cid);
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
      const tx = await journalsContract.writeJournal(journalId, cid, false);
      await tx.wait();
      console.log('after the response of writing in the journal', journal);

      // setJournal(x=> {
      //   return {...x, entries: [...journal.entries, {}]}
      // })
      setLoadWritingGame(false);
    } catch (error) {
      console.error('Failed to write to notebook:', error);
    }
  };

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
  return (
    <div className='text-white pt-4'>
      <h2 className='text-2xl mb-4'>This is journal {journal.journalId}</h2>
      {journal.entries.length !== 0 ? (
        <div className='p-4 rounded-xl bg-yellow-500'>
          {journal.entries.map((x, i) => {
            return (
              <div
                key={i}
                onClick={() => alert(x.text)}
                className='p-2 w-8 h-8 flex justify-center items-center hover:bg-blue-600 cursor-pointer bg-blue-400 rounded-xl'
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
      <button
        onClick={writeOnJournal}
        className='text-4xl p-4 bg-red-400 rounded-xl hover:bg-red-600 my-4'
      >
        write journal
      </button>
      <div className='flex mt-8 space-x-2'>
        <Button
          buttonText='back to my journals'
          buttonColor='bg-green-600'
          buttonAction={() => router.push('/journal')}
        />
        <Button
          buttonText='buy new journal'
          buttonColor='bg-purple-600'
          buttonAction={() =>
            alert('this will allow the user to mint another journal')
          }
        />
      </div>
    </div>
  );
  // return (
  //   <div className='text-white'>
  //     <h2 className='text-4xl my-2'>{notebookTemplate.metadata.title}</h2>{' '}
  //     <small className='italic'>{notebookTemplate.metadata.description}</small>
  //     <div className='text-left my-4'>
  //       {journal.metadata.prompts.map((x, i) => {
  //         return (
  //           <div key={i}>
  //             <p
  //               className={`${
  //                 notebookPages[i] &&
  //                 notebookPages[i].pageIndex &&
  //                 'line-through'
  //               }`}
  //               onClick={() => {
  //                 if (writingForDisplay?.index === i + 1) {
  //                   setWritingForDisplay({}); // Empty it if it's the same index
  //                 } else {
  //                   setWritingForDisplay(notebookPages[i]);
  //                 }
  //               }}
  //             >
  //               {i + 1}. {x}
  //             </p>
  //             {writingForDisplay?.pageIndex === i + 1 && (
  //               <div className='my-2 text-white p-2 bg-purple-600 rounded-xl'>
  //                 {writingForDisplay.text}
  //               </div>
  //             )}
  //           </div>
  //         );
  //       })}
  //     </div>
  //     {notebookPages.length === notebookTemplate.metadata.prompts.length ? (
  //       <div>
  //         <p>Congratulations, you finished writing this notebook</p>
  //         <p className='mb-4'>Time to mint another one!</p>
  //         <Button
  //           buttonText={`Browse notebooks`}
  //           buttonColor='bg-purple-500 w-48 mx-auto'
  //           buttonAction={() => router.push('/templates')}
  //         />
  //       </div>
  //     ) : (
  //       <div className='flex'>
  //         <Button
  //           buttonText={`Answer prompt #${notebookPages.length + 1}`}
  //           buttonColor='bg-purple-500 w-48 mx-auto mb-3'
  //           buttonAction={writeOnNotebook}
  //         />
  //         <Button
  //           buttonText={`Go Back`}
  //           buttonColor='bg-red-600 w-48 mx-auto mb-3'
  //           buttonAction={() => router.push('/templates')}
  //         />
  //       </div>
  //     )}
  //   </div>
  // );
};

export default JournalById;
