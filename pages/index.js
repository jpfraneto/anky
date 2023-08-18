import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Button from '../components/Button';
import { ThirdwebSDK } from '@thirdweb-dev/sdk/evm';
import {
  useContract,
  useContractWrite,
  useSigner,
  useAddress,
  Web3Button,
} from '@thirdweb-dev/react';
import Link from 'next/link';

export default function Home() {
  const writingDisplayContainerRef = useRef();
  const signer = useSigner();
  const address = useAddress();
  const [anotherOneLoading, setAnotherOneLoading] = useState(false);
  const [collectWritingLoading, setCollectWritingLoading] = useState(false);
  const [giveLoveLoading, setGiveLoveLoading] = useState(false);
  const [writingIndex, setWritingIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [writings, setWritings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWritings = async () => {
      try {
        const res = await fetch('/api/writings');
        const data = await res.json();
        console.log('in here, the data is: ', data);
        setWritings(data);
      } catch (error) {
        console.log('There was an error fetching the writings', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWritings();
  }, []);

  const collectWriting = () => {
    setCollectWritingLoading(true);
  };

  const giveLoveToWriting = () => {
    setGiveLoveLoading(true);
  };

  const loadAnotherWriting = async () => {
    setAnotherOneLoading(true);
    setWritingIndex(index => {
      console.log('in hereeee');
      console.log(index, writings.length);
      if (index === writings.length - 1) {
        alert('There are no more writings');
        return index;
      } else {
        // Scroll to the top of the writingDisplayContainerRef component
        writingDisplayContainerRef.current.scrollIntoView({
          behavior: 'smooth',
        });
        return index + 1;
      }
    });
  };

  if (isLoading) {
    return <div className='text-white'>Loading...</div>;
  }

  if (!writings) {
    return <p className='text-white'>There are no writings yet.</p>;
  }

  return (
    <div className='w-screen text-white overflow-y-scroll px-4 pt-2 pb-8 '>
      <div className='flex flex-wrap justify-center mt-4'>
        {writings &&
          writings.map(writing => (
            <div key={writing.id}>
              <div className='aspect-square relative rounded-full overflow-hidden border-2 border-white m-2'>
                <Image
                  src={`/ankys/${Math.floor(8 * Math.random())}.png`}
                  fill
                  alt={`{i} image`}
                />
              </div>
              <div className='my-4'>
                {writing &&
                  writing.text.split('\n').map((x, i) => {
                    return <p key={i}>{x}</p>;
                  })}
              </div>
              <hr className='border-2 border-white w-full px-2' />
            </div>
          ))}
      </div>
    </div>
  );
}
