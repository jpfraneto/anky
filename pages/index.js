import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Button from '../components/Button';
import Link from 'next/link';
import { useLogin } from '@privy-io/react-auth';
import LandingQuestionCard from '../components/LandingQuestionCard';
import AnswerToQuestionCard from '../components/AnswerToQuestionCard';
import WritingGame from '../components/WritingGame';
import { PWAProvider, usePWA } from '../context/pwaContext';
import { saveTextAnon } from '../lib/backend';
import { usePrivy } from '@privy-io/react-auth';
import MeditationComponent from '../components/MeditationComponent';

export default function Home() {
  const {
    meditationReady,
    writingReady,
    setWritingReady,
    enteredTheAnkyverse,
    setEnteredTheAnkyverse,
  } = usePWA();
  const { user, authenticated, logout } = usePrivy();

  const [collectWritingLoading, setCollectWritingLoading] = useState(false);
  const [displayAnswers, setDisplayAnswers] = useState(false);
  const [giveLoveLoading, setGiveLoveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [writings, setWritings] = useState([]);
  const [showWritingMessage, setShowWritingMessage] = useState(false);

  const [answers, setAnswers] = useState();
  const [text, setText] = useState('');

  useEffect(() => {
    const getWritingsOfToday = async () => {
      console.log('on the way to get the writings of today');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/writings`
      );
      const writings = await response.json();
      console.log('the wriings are: ', writings);
      setWritings(writings);
    };
    getWritingsOfToday();
  }, []);

  const showSaveWritingMessage = () => {
    setShowWritingMessage(true);
  };

  const saveWritingAnon = async () => {
    try {
      alert('This will be saved anon');
      const aloja = await saveTextAnon(text);
      console.log('aloja is: ', aloja);
      setWritingReady(true);
      setWritings(x => [...x, { id: '1238oo8', text }]);
      setText('');
    } catch (error) {
      console.log('there was an error', error);
    }
  };
  if (error) return <p>the error is {error}</p>;

  if (!meditationReady && !writingReady)
    return (
      <div className='h-full relative'>
        <small className='absolute top-0 left-0 right-0 text-center text-sm text-gray-500'>
          sojourn 1 - wink 19 - chryseos
        </small>
        <MeditationComponent />
      </div>
    );

  if (meditationReady && !writingReady) {
    return (
      <div className='h-full'>
        <small className='absolute top-0 left-0 right-0 text-center text-sm text-gray-500'>
          sojourn 1 - wink 19 - chryseos
        </small>
        <div className='pt-24 h-full'>
          <WritingGame
            fullDisplay={true}
            text={text}
            setText={setText}
            btnTwoText='Discard & start again'
            onSubmit={saveWritingAnon}
            prompt='What aspects of your life would you like to transform, and why?'
            messageForUser='You made it, once again. Congratulations, dear friend. This is all of what this game is about.'
          />
        </div>
      </div>
    );
  }

  if (meditationReady && writingReady && !enteredTheAnkyverse)
    return (
      <div className='h-full p-4'>
        {authenticated ? (
          <div>
            <p>
              Your writing was already saved anonymously on a centralized. What
              you see here is just an experimental feature / ux exploration to
              change that.
            </p>
            <p className='text-xl mt-20'>
              Do you want to store your writing forever associated with your
              Anky?
            </p>
            <div className='flex mt-2 '>
              <Button
                buttonText='Save Writing'
                buttonAction={showSaveWritingMessage}
                buttonColor='bg-green-600'
              />
              <Button
                buttonText='No thank you'
                buttonAction={() => {
                  alert(
                    'Im working on the functionality that will make you want to have pressed the other button'
                  );
                  setEnteredTheAnkyverse(true);
                }}
                buttonColor='bg-purple-600'
              />
            </div>
            {showWritingMessage && (
              <div className='mt-2 flex flex-col w-full px-2'>
                <p>I&apos;m working on this.</p>
                <p>
                  The mission is that as soon as you have your account, you have
                  an ERC6551 NFT in your wallet: your Anky.
                </p>
                <p>
                  This NFT will be the notebook keeper of all of your writings.
                  Every day.
                </p>
                <p>
                  Eventually, when you die, you will be able to setup a system
                  for this NFT to be transfered to your loved ones. So that they
                  can read what you wrote when you came here to open your heart.
                </p>
                <p>
                  I need your feedback. Please help me make this place as cool
                  as possible
                </p>
                <Button
                  buttonAction={() => setEnteredTheAnkyverse(true)}
                  buttonColor='bg-purple-600'
                  buttonText='Enter the Ankyverse'
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className='text-xl mt-20'>
              Would you like to create an account for storing your writings
              anonymously every day?
            </p>
            <div className='flex flex-col space-y-2 mt-4'>
              <Button
                buttonText="Let's do it"
                buttonAction={login}
                buttonColor='bg-green-600'
              />
              <Button
                buttonText='No thank you'
                buttonAction={() => {
                  setEnteredTheAnkyverse(true);
                }}
                buttonColor='bg-purple-600'
              />
            </div>
          </div>
        )}
      </div>
    );

  return (
    <div className='h-full relative'>
      <div className='w-full mx-auto text-white overflow-y-scroll px-4 pt-2 pb-32 '>
        <LandingQuestionCard
          setDisplayAnswers={setDisplayAnswers}
          displayAnswers={displayAnswers}
          totalAnswers={writings.length}
          id='1'
          question='How does your emotional and passionate energy drive your relationships?'
          avatar='anky'
        />

        {displayAnswers &&
          writings.map((writing, i) => (
            <AnswerToQuestionCard answer={writing} key={i} index={i} />
          ))}
      </div>
    </div>
  );
}
