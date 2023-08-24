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
import { usePrivy } from '@privy-io/react-auth';
import MeditationComponent from '../components/MeditationComponent';

export default function Home() {
  const writingDisplayContainerRef = useRef();
  const {
    meditationReady,
    setMeditationReady,
    writingReady,
    setWritingReady,
    enteredTheAnkyverse,
    setEnteredTheAnkyverse,
  } = usePWA();
  const { user, authenticated, logout } = usePrivy();
  const { login } = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated) => {
      console.log(user, isNewUser, wasAlreadyAuthenticated);
      // Any logic you'd like to execute if the user is/becomes authenticated while this
      // component is mounted
    },
    onError: error => {
      console.log(error);
      // Any logic you'd like to execute after a user exits the login flow or there is an error
    },
  });

  const [anotherOneLoading, setAnotherOneLoading] = useState(false);
  const [collectWritingLoading, setCollectWritingLoading] = useState(false);
  const [displayAnswers, setDisplayAnswers] = useState(false);
  const [giveLoveLoading, setGiveLoveLoading] = useState(false);
  const [writingIndex, setWritingIndex] = useState(0);

  const [success, setSuccess] = useState(false);
  const [writings, setWritings] = useState([]);

  const [answers, setAnswers] = useState([
    'And that is why the relationship that AI will have with time is very important and informative about our own relationship with it. In a sense, AI is static because it is encapsulated in computers. But (from the pure basic understanding that I have of it) it evolves by bringing in more and more information related to inputs that they feed it with. So isn’t that as it is evolved with all these different inputs there is also a passing of time that happens? Isn’t it that that is how we frame time as passing? As more and more changing inputs come through our system there is a perception that there is something that is changed and that something is called time. If there is a car that is passing by in front of me right now, there is a perception that there is an input that is changing, and because of that, there is a conceptual understanding that time went by. I can’t relate this to the experience of no-time that happens in deep trance states because I can’t relate to them now, but I wonder these two things: How will AI perceive time, which will be it’s interpretation of it on a conceptual level, and also what is time ultimately in the sense of all this what goes on when there is no inputs that are changed in our whole perception system.',
    'The future is bright, and humanity will wake up to the truth of our nature just by being creative. Just by allowing ourselves to be. We came here to just be. ',
    'But yesterday I realized that that can also be an experience of the present moment. The way on which he was deriving the most out of that moment, was through recording it with his phone, so that he could send it to his friends, or whatever he wanted to do with it. That IS a valid way of spending his time as we were singing her happy birthday. It IS the way that makes more sense to him, in that moment, and that is why he is doing it. Who am I to judge that? Who am I to blame? No one. It doesn’t matter. If I find more value just by being a witness and enjoying it without the meditation of technology, it is perfect like that. Just do it. But make sure you respect the way on which other people decide to do things also. This was a big eye opener yesterday, because now I realize how much I have judged other people because of doing something like this. And what is the use of it? Why do I even care? I can only control my own life experience, the things that I do, what I care about, and caring about what other person decides to do in a particular moment doesn’t help at all. It is just noise. And I want to break free of that noise. I want to integrate it fully, and move towards the rest of my life without it. It ends up being a burden. And I don’t want that burden on top of myself. I just want to be able to enjoy every second of my experience as a human being, to be present with what is, and if I’m there judging him because he is recording, or even worse, telling him to stop, I’m just being the asshole that I have been for a big part of my life.',
  ]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const collectWriting = () => {
    setCollectWritingLoading(true);
  };

  const giveLoveToWriting = () => {
    setGiveLoveLoading(true);
  };

  if (isLoading) {
    return <div className='text-white p-4'>Loading...</div>;
  }

  if (!meditationReady && !writingReady)
    return (
      <div className='h-full'>
        <small className='absolute top-0 left-0 right-0 text-center text-sm text-gray-500'>
          sojourn 1 - wink 15 - claridium
        </small>
        <MeditationComponent />
      </div>
    );

  if (meditationReady && !writingReady) {
    return (
      <div className='h-full'>
        <WritingGame
          fullDisplay={true}
          text={text}
          setText={setText}
          onSubmit={() => {
            setAnswers(x => [...x, text]);
            setText('');
            setWritingReady(true);
          }}
          prompt='How do you cultivate a connection with the universe or a higher power?'
          messageForUser='You made it, once again. Congratulations, dear friend. This is all of what this game is about.'
        />
      </div>
    );
  }

  if (meditationReady && writingReady && !authenticated)
    return (
      <div className='h-full p-4'>
        <div>
          <p className='text-sm mt-20'>
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
      </div>
    );

  return (
    <div className='h-full relative'>
      {meditationReady && (
        <div className='w-full h-full mx-auto text-white overflow-y-scroll px-4 pt-2 pb-32 '>
          <h2 className='text-4xl text-center mt-2'>ANKY</h2>
          <LandingQuestionCard
            setDisplayAnswers={setDisplayAnswers}
            displayAnswers={displayAnswers}
            totalAnswers={answers.length}
            id='1'
            question='How do you cultivate a connection with the universe or a higher power?'
            avatar='anky'
          />

          {displayAnswers &&
            answers.map((answer, i) => (
              <AnswerToQuestionCard answer={answer} key={i} index={i} />
            ))}
        </div>
      )}
    </div>
  );
}
