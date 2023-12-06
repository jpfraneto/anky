import React, { useEffect, useState } from 'react';
import { getOneWriting } from '../lib/irys';
import { usePrivy } from '@privy-io/react-auth';
import Button from './Button';
import Link from 'next/link';
import Spinner from './Spinner';
import { useRouter } from 'next/router';

var options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  };

const IndividualWritingDisplayPage = ({  }) => {
    const router = useRouter();
    const [writing, setWriting] = useState(null);
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [copyText, setCopyText] = useState('copy text')

    const copyThisText = async () => {
      await navigator.clipboard.writeText(writing.text);
      setCopyText('copied')
    }

    useEffect(() => {
        const fetchUserWritings = async () => {
          const thisWriting = await getOneWriting(router.query.cid);
          setWriting(thisWriting);
          setLoadingFeed(false);
        };
        fetchUserWritings();
      }, [router]);
  
    if (loadingFeed) {
      return (
        <div className='mt-12'>
          <p className='text-white'>loading...</p>
          <Spinner />
        </div>
      );
    }
  
    return (
      <div className='w-full'>
      
        <div className='w-full px-4 md:w-1/2 mx-auto'>
        
        <div
        className={`p-2 m-2 rounded-xl  text-white`}
      >
        {writing.text && writing.text ? (
          writing.text.includes('\n') ? (
            writing.text.split('\n').map((x, i) => (
              <p className='my-2' key={i}>
                {x}
              </p>
            ))
          ) : (
            <p className='my-2'>{writing.text}</p>
          )
        ) : null}
      </div>

        </div>
        <Button buttonText={copyText} buttonAction={copyThisText} buttonColor='bg-green-600 w-48 mb-8'/>
      </div>
    );
}

export default IndividualWritingDisplayPage
