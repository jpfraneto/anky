import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ethers } from 'ethers';

var options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

const MobileUserNotebookById = ({ userAnky }) => {
  const [thisNotebook, setThisNotebook] = useState(null);
  const [expanded, setExpanded] = useState(null); // add this line

  const router = useRouter();

  useEffect(() => {
    console.log('IN HERE', userAnky, router.query);
    if (!userAnky.userNotebooks) return;
    const thisNotebookArray = userAnky.userNotebooks.filter(
      x => x.notebookId == router.query.id
    );
    console.log('this notebook array', thisNotebookArray);
    setThisNotebook(thisNotebookArray[0]);
  }, [router, userAnky.userNotebooks]);

  if (!thisNotebook) return <p>loading!</p>;

  const toggleExpand = index => {
    // add this function
    setExpanded(expanded === index ? null : index);
  };
  return (
    <div className='w-full p-4'>
      <div className='p-2 bg-blue-400 w-5/6 mx-auto aspect-square rounded-2xl mt-4 flex  flex-col items-center text-center active:bg-blue-500'>
        <div className='flex w-full h-1/2 '>
          <div className='rounded-xl overflow-hidden relative w-1/2 aspect-square'>
            <Image fill src={`/ankys/1.png`} />
          </div>
          <div className='w-1/2 p-2'>
            <p className='text-left text-xl'>
              {thisNotebook.template.metadata.title}
            </p>
          </div>
        </div>
        <div className='h-1/2 py-2 text-xs text-left'>
          <p>{thisNotebook.template.metadata.description.slice(0, 400)}...</p>
          <p>{thisNotebook.template.metadata.prompts.length} prompts</p>
          <p>{thisNotebook.userPages.length} answered</p>
        </div>
      </div>

      {Array.from({
        length: thisNotebook.template.metadata.prompts.length,
      }).map((_, i) => {
        const userPage = thisNotebook.userPages.find(
          (page, index) => index === i
        );
        return (
          <div
            onClick={() => toggleExpand(i)}
            className={`${
              userPage ? 'bg-blue-300' : 'bg-blue-200'
            } w-5/6 p-2 mx-auto mt-4 pb-12 flex flex-col relative items-start rounded-2xl transition-all duration-300 ${
              expanded === i ? 'h-auto' : `${userPage ? 'h-32' : 'h-8'}`
            } active:bg-blue-400`}
          >
            <p className='text-gray-600 text-xs text-left'>
              {thisNotebook.template.metadata.prompts[i]}
            </p>
            {userPage ? (
              expanded === i ? (
                <p className='w-full'>{userPage.pageContent}</p>
              ) : (
                <p className='w-full'>{userPage.pageContent.slice(0, 50)}...</p>
              )
            ) : (
              <div className='w-full h-full bg-blue-200' />
            )}
            {userPage && (
              <p className='absolute bottom-1 text-gray-500 text-xs right-1'>
                {new Date(
                  ethers.utils.formatUnits(userPage.timestamp, 0) * 1000
                ).toLocaleDateString('en-US', options)}
              </p>
            )}
          </div>
        );
      })}

      <div
        onClick={() => router.back()}
        className='bg-red-400 w-4/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'
      >
        <p className='text-white text-3xl text-center w-9/12 mx-auto'>back</p>
      </div>
    </div>
  );
};

export default MobileUserNotebookById;
