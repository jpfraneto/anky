import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ethers } from 'ethers';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['200', '400'] });

var options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

const MobileUserEulogiaById = ({ userAnky }) => {
  const [thisEulogia, setThisEulogia] = useState(null);
  const [expanded, setExpanded] = useState(null); // add this line

  const router = useRouter();

  useEffect(() => {
    if (!userAnky.userEulogias) return;
    console.log('aslkdjhalskjdksañ', userAnky.userEulogias, router.query);
    const thisEulogiaArray = userAnky.userEulogias.filter(
      x => x.eulogiaId == router.query.id
    );
    console.log('this eulogia array', thisEulogiaArray);
    setThisEulogia(thisEulogiaArray[0]);
  }, [router, userAnky.userEulogias]);

  if (!thisEulogia) return <p>loading!</p>;

  const toggleExpand = index => {
    // add this function
    setExpanded(expanded === index ? null : index);
  };
  return (
    <div className={`${inter.className} w-full p-4`}>
      <div className='bg-amber-400 w-5/6 mx-auto h-24 rounded-2xl mt-4 flex items-center text-center active:bg-lime-500'>
        <div className='w-1/3 flex justify-center'>
          <div className='rounded-xl overflow-hidden relative w-3/4 aspect-square'>
            <Image
              src={thisEulogia.metadata.coverImageUrl}
              fill
              alt='eulogia image'
            />
          </div>
        </div>
        <div className='text-left w-2/3 px-2 py-3'>
          <p className='text-xl'>{thisEulogia.metadata.title}</p>
          <p className='text-sm'>
            {thisEulogia.messages.length}/{thisEulogia.metadata.maxPages} pages
            written.
          </p>
        </div>
      </div>

      {Array.from({
        length: thisEulogia.metadata.maxPages,
      }).map((_, i) => {
        const writtenPage = thisEulogia.messages.find(
          (page, index) => index === i
        );
        return (
          <div
            key={i}
            onClick={() => toggleExpand(i)}
            className={`${
              writtenPage ? 'bg-amber-300' : 'bg-amber-200'
            } w-full p-2 mx-auto mt-4 pb-12 flex flex-col relative items-start rounded-2xl transition-all duration-300 ${
              expanded === i ? 'h-auto' : `${writtenPage ? 'h-32' : 'h-8'}`
            } active:bg-amber-400`}
          >
            {writtenPage ? (
              expanded === i ? (
                <p className='w-full'>{writtenPage.content}</p>
              ) : (
                <p className='w-full'>{writtenPage.content.slice(0, 50)}...</p>
              )
            ) : (
              <div className='w-full h-full bg-amber-200' />
            )}
            {writtenPage && (
              <p className='absolute bottom-1 text-gray-500 text-xs right-1'>
                {new Date(writtenPage.timestamp * 1000).toLocaleDateString(
                  'en-US',
                  options
                )}
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

export default MobileUserEulogiaById;
