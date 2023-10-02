import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['200', '400'] });

const MobileUserNotebooksPage = ({ userAnky }) => {
  const router = useRouter();
  if (!userAnky && !userAnky.userNotebooks) return <p>loading!</p>;
  return (
    <div className={`${inter.className} w-full p-4`}>
      {userAnky.userNotebooks.map((notebook, i) => {
        return (
          <Link
            href={`/m/user/notebooks/${notebook.notebookId}`}
            passHref
            key={i}
          >
            <div className='p-2 bg-blue-400 w-5/6 mx-auto aspect-square rounded-2xl mt-4 flex  flex-col items-center text-center active:bg-blue-500'>
              <div className='flex w-full h-1/2 '>
                <div className='rounded-xl overflow-hidden relative w-1/2 aspect-square'>
                  <Image fill src={`/ankys/1.png`} />
                </div>
                <div className='w-1/2 p-2'>
                  <p className='text-left text-xl'>
                    {notebook.template.metadata.title}
                  </p>
                </div>
              </div>
              <div className='h-1/2 py-2 text-xs text-left'>
                <p>{notebook.template.metadata.description.slice(0, 400)}...</p>
                <p>{notebook.template.metadata.prompts.length} prompts</p>
                <p>{notebook.userPages.length} answered</p>
              </div>
            </div>
          </Link>
        );
      })}
      <Link passHref href='/m/notebooks'>
        <div className='bg-blue-800 w-4/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'>
          <p className='text-white text-3xl text-center w-9/12 mx-auto'>
            explore
          </p>
        </div>
      </Link>

      <div
        onClick={() => router.back()}
        className='bg-red-400 w-4/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'
      >
        <p className='text-white text-3xl text-center w-9/12 mx-auto'>back</p>
      </div>
      <p className='mt-4'>
        (you can buy a new notebook on the desktop app, or even create one for
        people to buy and write on it)
      </p>
    </div>
  );
};

export default MobileUserNotebooksPage;

{
  /* <Link href={`/m/user/journals/${journal.journalId}`} passHref>
            <div className='bg-lime-400 w-5/6 mx-auto h-16 rounded-2xl mt-4 flex items-center text-center active:bg-lime-500'>
              <p className='text-center  w-full text-xl'>{`journal #${
                journal.journalId
              } - ${journal.entries.length}/${
                journal.pagesLeft + journal.entries.length
              } pages`}</p>
            </div>
          </Link> */
}
