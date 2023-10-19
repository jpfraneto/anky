import React, { useState, useRef, useEffect } from 'react';
import { Righteous, Dancing_Script } from 'next/font/google';
import Button from './Button';
import Image from 'next/image';
import { saveTextAnon } from '../lib/backend';
import { ethers } from 'ethers';
import LoggedInUser from './LoggedInUser';
import { useRouter } from 'next/router';
import buildersABI from '../lib/buildersABI.json';

import { usePrivy } from '@privy-io/react-auth';
import { usePWA } from '../context/pwaContext';
import Spinner from './Spinner';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const righteous = Righteous({ weight: '400', subsets: ['latin'] });
const dancingScript = Dancing_Script({ weight: '400', subsets: ['latin'] });

const theText =
  "it means to exist in what is happening right here, right now. it is an exploration into what is happening. it means to give up time in order to enter the eternal flow of existence. it means to explore. it means to come up with something new each time that you face the unknown. it means to explore. it means to come up with new ways of exploring. it means to give up the willingness to be worried about something that happened before, or that will happen. it is the end of anxiety and depression. it is the end of the expectations of life to be different from what it is. it is the exploration into what is. into life as it is, and as it has always been. it means to explore. it means to dive into the unkown. it means to explore the unknown in every second. it means to breathe. it means to come up with new ways of breathing. it means to ellaborate the beauty of life through your experience. through your unique experience. through the beauty of your experience. which is unique, which has always been unique. which has always been here. which has been forgotten. the beauty of life has been forgotten on the quest of something more. something more meaningful. but this is all of what is. the present is all of what is. that is the beauty of i--- it is that what is happening is happening now. and that all of life is contained in this exploration. in this moment. the gift of what it is. the breath. my daughter asking for her milk. my partner sleeping next to her. the warmth of the fire that burns next to me and that gives warmth to my house. the beauty of that fire, and how that wood is being transformed ino something different in order to give us warmth. the beauty of that warmth. the beauty of life being expressed as that warmth. as the transformation that comes from expriencing that warmth. the warmth of this moment being explored in those coals that are burning. the beauty of those coals that are burning, and that somehow grew on a tree that now is being transformed into the air that we will eventually breathe. the cycle of the water that i just drank before starting to write. the beauty of this exploration. the beauty of what is happening through this exploration. through this moment. the beauty of this moment, as it is. right here. right now. the gift of this moment is that it is. it is that it exists.---that is the question that i'm trying to ask here. it leads to a deeper understanding of myself. of who i am. self inquiry is the vehicle for me to recognize who i am, and what i bring into this moment. self inquiry is the expression of what is inside, and how it unfolds in my experience as a human being. self inquiry is the vehicle that has been developed as a tool for realizing who i am, and that is the exploration that i am on. that is the exploration that i can't get rid of. i look and look and look for it. asking 24/7 inside: who am i? self inquiry is the quest into that. it is the quest into who i am. it is the experience of who i am. it is the exploration of who i am. it is the invitation of who i am. it is the vehicle for who i am to be expressed in this world. in this moment. self inquiry is a game. it is an exploration. it is an invitation. it is a quest. it is the quest of meaning. the ongoing unfolding of that quest for meaning, as it is expressed inside me, as it comes inside me. as this rush of energy flows throuigh all of my being, and it is conveyed through these words. self inquiry is the vehicle for these words to be a manifestation of what unfolds inside. it is the expression of what happens inside transformed into what you can read.---the absence of expectations. the beauty of becoming the present moment comes from ceasing to expect something different to happen, and it comes from a full acceptance of what is. of what unfolds. for example, for the last years i have developed a strong resistance towards my parents. in relationship to my parents. i have developed a strong resistance in relationship to them that makes me feel that there is something that i need to change. that i need to transform. that i need to make new. and what comes from that is a necessity to drink alcohol when i'm with them. and yesterday i went to their house and didn't drink anything. and i didn't make a big thing of it, i didn't tell anyone, i just didn't serve myself wine or beer. and it was perfect. it all was perfect. it all was just the perfect expression of what living in that moment was, without blaming them. without expecting them to be something different. just accepting them for who they were. and that is the beauty of that game. that is the experience of that game. that is the expression of that game. the game of what happened. it was great. i honored them for who they are. without changing them inside my mind---with the understanding that there is something different, something more, to the present experience than what is here. this is something that has always been hard for me to reply to, or to explore, because there is always a lack in my present experience. i'm always looking for what is missing. for what is not there. for what can be made different. for what can be changed. and the willingness to explore makes that experience different because it entails accepting what is, and being open to what is. not to what will be. not to what is the next transformation that comes, but about what is. the willingness to experience is all about what is, and the more open you are to it, the more willing you will be to come up with a new way of honoring, of embracing, of coming up with something new, with something special. there is a deep willingness to explore that arises from being present, and those experiences are fundamentally transformed because of that. they are transformed because of the experience of this moment. because of the experience of what is alive in this moment. that is the beauty of the game. that is the beauty of what is happening here. the beauty of being alive. that is how the willingness to explore shapes my experience. by bringing awe. ---because it allows you to explore what is there. what has always been there, with a renewed sense of presence. it is a trigger to the conscious aspect of myself to become bored. to become something new. or not something new, but the mind seeks novelty. it seeks comfort. and in the comfort there is an expression that ends up being not alive, because there is a numbness that comes from being running in that cycle of looking for what is new. of trying to find that novelty everywhere. and that is what happens. that is what comes. that is the experience that comes. that is the experience of the beauty of this moment. the beauty of what is alive, and what has always been alive. this is the gift. this is the exploration. this is the welcoming. this is the invitation. the invitation to be alive. the invitation to come up with a new expression. that is rooted in what has always been there. the practice helps in recognizing what has always been there. the practice helps in rooting into what has always been there, and honoring it for what it is. right here. right now. the practice triggers. the practice opens. it opens up the experience. it allows it to be. right here. right now. that is the experience. that is the gift. the gift of being who i am. the gift o---it depends in the inividual, but if that question was targeted to me especifically, i would say that i become more and more transparent to them. i am moving towards understanding - and realizing - that each word that comes to me is just a vehicle for the person that conveyed them to express herself, without the fundamental meaning of it being contained in the word, but with the fundamental expression of the person that asked it being hidden behind it. and that is the beauty of that game. the game of life. the game of this expression. the game of this interaction. the game of this transformation. the transformation that is here, that has always been, and that will ever be. that is the beauty of it, seeing the underlying love behind each one of those words. the underlying quest for love. for expression. for being. that is what comes. the beauty of this moment being that gift that the person that wrote them, or said them, wanted to convey. i'm here to just learn how to receive them in a way that doesn't make me the center of attention. i am not the center of my life. i am not the center. i am just a vehicle for life to be expressed through my actions, and that is something that i need to remember, over and over again. that is something that will always b---because it enables you to see with more clarity what is in front of your eyes. without the quest of self knowledge, what happens is a quest towards imposing your truth in front of others. what comes is a quest of being more important than others. as if your experience was more important than others. as if your expression was more important than others. and that is the trick, because your experience is not more important than others. your experience is valuable, yes, but it is not more important than others. your experience is a gift, and that is the beauty of what it means to be alive. but there is no boundary between you and the person that is in front, and the quest for self knowledge is what unmasks that as part of the intrisic fabric of reality. if there is not a quest for knowing oneself, you end up acting on an unconscious way through life, which is based on fear, on anger, on all of those things that are just a quest for love. for that love that was never given to you at the beginning. that is what it brings. a quest for true love. that love that is here. right here. right now. and that has been forgotten. that can be forgotten. that can be expressed. that will be expressed. ";

const DementorGame = ({
  targetTime,
  notebookTypeId,
  backgroundImage,
  preloadedBackground,
  text,
  setText,
  uploadDementorPageToSmartContract,
  lifeBarLength,
  setLifeBarLength,
  time,
  cancel,
  setTime,

  prompts,
  secondsPerPrompt,
}) => {
  const router = useRouter();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [prompt, setPrompt] = useState(prompts[0]);
  const [activateNext, setActivateNext] = useState(false);
  const audioRef = useRef();
  const [blockWriting, setBlockWriting] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [saveText, setSaveText] = useState('save anon');
  const [uploadingWriting, setUploadingWriting] = useState(false);
  const [upscaledUrls, setUpscaledUrls] = useState([]);

  const [isActive, setIsActive] = useState(false);
  const [newPromptDisplay, setNewPromptDisplay] = useState(false);
  const [savingRound, setSavingRound] = useState(false);
  const [moreThanMinRun, setMoreThanMinRound] = useState(null);
  const [showNewPromptStarter, setShowNewPromptStarter] = useState(false);
  const [chosenUpscaledImage, setChosenUpscaledImage] = useState('');
  const [savingTextAnon, setSavingTextAnon] = useState(false);
  const [savedText, setSavedText] = useState(false);
  const [userLostFlag, setUserLostFlag] = useState(false);
  const [generatedImages, setGeneratedImages] = useState('');
  const [loadingAnkyResponse, setLoadingAnkyResponse] = useState(false);
  const [loadButtons, setLoadButtons] = useState(false);

  const [characterIsReady, setCharacterIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const [character, setCharacter] = useState(null);
  const [ankyIsReady, setAnkyIsReady] = useState(false);
  const [ankyReflection, setAnkyReflection] = useState(null);

  const [gettingAnkyverseCharacter, setGettingAnkyverseCharacter] =
    useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const [lastKeystroke, setLastKeystroke] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [errorProblem, setErrorProblem] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [secondLoading, setSecondLoading] = useState(false);
  const [thirdLoading, setThirdLoading] = useState(false);
  const [copyText, setCopyText] = useState('copy my writing');
  const [metadata, setMetadata] = useState(null);
  const [userIsReadyWithDementor, setUserIsReadyWithDementor] = useState(false);
  const [writingSaved, setWritingSaved] = useState(false);
  const [writingSavingLoading, setWritingSavingLoading] = useState(false);

  const [progress, setProgress] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const textareaRef = useRef(null);
  const intervalRef = useRef(null);
  const keystrokeIntervalRef = useRef(null);

  useEffect(() => {
    const handleSpacePress = e => {
      if (e.code === 'Space') {
        setIsActive(true); // Restart the game
        setBlockWriting(false);
        setTimeout(() => {
          textareaRef.current.focus();
        }, 50);
        setLastKeystroke(Date.now());
        document.removeEventListener('keydown', handleSpacePress); // Remove the event listener
      }
    };

    if (!isActive && blockWriting) {
      textareaRef.current.focus(); // Focus the textarea
    }

    if (isActive && !isDone) {
      intervalRef.current = setInterval(() => {
        setTime(time => time + 1);
        if (time > 1 && time % secondsPerPrompt === 0) {
          const newIndex = currentPromptIndex + 1;
          if (prompts.length > newIndex) {
            setBlockWriting(true);
            setIsActive(false);
            setCurrentPromptIndex(newIndex);
            setPrompt(prompts[newIndex]);
            setNewPromptDisplay(true);
            setTimeout(() => {
              setText(x => `${x}---`);
              setNewPromptDisplay(false);
              document.addEventListener('keydown', handleSpacePress);
            }, 3000);
          } else {
            setIsDone(true);
            setIsActive(false);
            setUserIsReadyWithDementor(true);
          }
        }
      }, 1000);
    } else if (!isActive && !isDone) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, time, isDone]);

  useEffect(() => {
    if (isActive) {
      keystrokeIntervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - lastKeystroke;
        if (time === 480) {
          // audioRef.current.play();
        }
        if (elapsedTime > 3000 && !isDone) {
          userLost();
        } else {
          // calculate life bar length
          const newLifeBarLength = 100 - elapsedTime / 30; // 100% - (elapsed time in seconds * (100 / 3))
          setLifeBarLength(Math.max(newLifeBarLength, 0)); // do not allow negative values
        }
      }, 100);
    } else {
      clearInterval(keystrokeIntervalRef.current);
    }

    return () => clearInterval(keystrokeIntervalRef.current);
  }, [isActive, lastKeystroke]);

  const userLost = async () => {
    setUserLostFlag(true);
    startNewRun();
    setIsActive(false);
  };

  const finishRun = async () => {
    setLifeBarLength(0);

    setFinished(true);
    setEndTime(Date.now());
    setIsDone(true);
    setIsActive(false);
    clearInterval(intervalRef.current);
    clearInterval(keystrokeIntervalRef.current);
    await navigator.clipboard.writeText(text);
    setMoreThanMinRound(true);
    setFailureMessage(`You're done! This run lasted ${time}.}`);
    if (time > 3) {
      setLoadButtons(true);
    }
  };

  async function readyToUpdateSmartContract() {
    setUploadingWriting(true);
    await uploadDementorPageToSmartContract(text, prompts);
    setUploadingWriting(false);
    setWritingSaved(true);
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopyText('copied');
  };

  const startNewRun = () => {
    copyToClipboard();
    setCurrentPromptIndex(0);
    setCopyText('copy my writing');
    setTime(0);
    setLifeBarLength(100);
    setText('');
    setSavingRound(false);
    setSavedToDb(false);
    setIsDone(false);
    setFinished(false);
    setSavedText(false);
  };

  const handleTextChange = event => {
    setText(event.target.value);
    if (!isActive && event.target.value.length > 0) {
      setIsActive(true);
      setFailureMessage('');
      setStartTime(Date.now());
    }
    setLastKeystroke(Date.now());
  };

  if (errorProblem)
    return (
      <div
        className={`${righteous.className} text-thewhite relative  flex flex-col items-center justify-center w-full bg-cover bg-center`}
        style={{
          boxSizing: 'border-box',
          height: 'calc(100vh  - 90px)',
          backgroundImage: "url('/images/the-monumental-game.jpeg')",
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <p>
          There was an error. But you can always keep your writing if you want.
        </p>
        <p>I&apos;m sorry. I&apos;m doing my best to make this thing work.</p>
        <Button
          buttonColor='bg-thegreenbtn'
          buttonAction={copyToClipboard}
          buttonText={copyText}
        />
      </div>
    );

  if (uploadingWriting) {
    return (
      <div
        className={`${righteous.className} text-black relative overflow-y-scroll flex flex-col items-center  w-full bg-cover bg-center`}
        style={{
          boxSizing: 'border-box',
          height: 'calc(100vh - 33px)',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${
            preloadedBackground || '/images/mintbg.jpg'
          })`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Spinner />
        <p className='text-white'>loading...</p>
      </div>
    );
  }

  if (userIsReadyWithDementor) {
    return (
      <>
        {writingSaved ? (
          <>
            <p>your writing was saved. congratulations.</p>
          </>
        ) : (
          <>
            {uploadingWriting ? (
              <div className='text-white my-2'>
                <Spinner />
                <p className='text-white'>loading...</p>
              </div>
            ) : (
              <div className='text-white my-2'>
                <p>you are ready!</p>
                <p>big congratulations</p>
                <p>do you want to submit your writing?</p>
                <Button
                  buttonText='yes'
                  buttonColor='bg-green-600'
                  buttonAction={readyToUpdateSmartContract}
                />
              </div>
            )}
          </>
        )}
      </>
    );
  }

  if (userLostFlag) {
    return (
      <div className='text-white my-2'>
        <p>you lost</p>
        <p>this is extremely hard. better focus more next time.</p>
        <p>remember: there are no right or wrong answers.</p>
        <p>just write.</p>
        <div className='my-2 mx-auto w-98 justify-between flex'>
          <Button
            buttonAction={copyToClipboard}
            buttonColor='bg-green-600 mx-2'
            buttonText={copyText}
          />
          <Button
            buttonText='start again'
            buttonColor='bg-green-600 mx-2'
            buttonAction={() => {
              setCopyText('copy writing');
              setUserLostFlag(false);
            }}
          />
          <Button
            buttonText='library'
            buttonColor='bg-purple-600 mx-2'
            buttonAction={cancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${righteous.className} text-black relative overflow-y-scroll flex flex-col items-center  w-full bg-cover bg-center`}
    >
      <audio ref={audioRef}>
        <source src='/sounds/bell.mp3' />
      </audio>
      <div className='md:block text-white w-screen h-screen '>
        <div>
          {!finished && (
            <div
              className={` ${text.length > 0 && 'fade-out'} mb-4 ${
                time > 2 && 'hidden'
              }`}
            >
              <p
                className={`${righteous.className} text-5xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]   my-4 font-bold text-center`}
              >
                {prompt}
              </p>
            </div>
          )}

          <textarea
            ref={textareaRef}
            disabled={finished || blockWriting}
            style={{
              top: `${text && '0'}%`,
              bottom: `${text && '0'}%`,
              left: `${text && '0'}%`,
              right: `${text && '0'}%`,
              transition: 'top 1s, bottom 1s, left 1s, right 1s', // smooth transition over 1 second
            }}
            onBlur={() => {
              if (!isActive && blockWriting) {
                textareaRef.current.focus();
              }
            }}
            className={`${dancingScript.className} ${text && 'absolute'} ${
              text ? 'md:aspect-video md:flex w-full h-full' : 'w-3/5 h-48'
            } p-4 text-white ${
              time > 2 && 'opacity-80'
            } placeholder-white  text-2xl border border-white rounded-md  bg-opacity-10 bg-black`}
            value={text}
            placeholder='just write...'
            onChange={handleTextChange}
          ></textarea>
          {!text && (
            <div className='w-48 mt-2 mx-auto'>
              <Button
                buttonText='cancel'
                buttonColor='bg-red-600'
                buttonAction={cancel}
              />
            </div>
          )}

          {text && (
            <div
              className={`${
                text && 'fade-in'
              } flex flex-col justify-center items-center text-opacity-20 mb-4`}
            >
              <div
                className={`${
                  text
                    ? 'text-6xl z-50 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                    : 'text-2xl'
                }`}
              >
                {time}
              </div>

              {finished ? (
                <div className='p-4 bg-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] rounded-xl  z-50'>
                  <p
                    className={`${righteous.className} mb-2 text-xl font-bold`}
                  >
                    you are ready.
                  </p>
                  <p
                    className={`${righteous.className} mb-2 text-xl font-bold`}
                  >
                    do you want to store your writing?
                  </p>

                  <div className='flex justify-center '>
                    <Button
                      buttonAction={async () => {
                        setUploadingWriting(true);
                        setSavingTextAnon(true);
                        await uploadDementorPageToSmartContract(text, prompts);
                        startNewRun();
                        setUploadingWriting(false);
                      }}
                      buttonColor='bg-green-600 text-black'
                      buttonText={savingTextAnon ? 'saving...' : 'save text'}
                    />
                    <Button
                      buttonAction={startNewRun}
                      buttonColor='bg-cyan-200 text-black'
                      buttonText='start again'
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p
                    className={`${righteous.className}  ${
                      time < 3 && 'hidden'
                    } z-40 ${
                      newPromptDisplay
                        ? 'text-yellow-500 text-5xl'
                        : 'text-yellow-400 text-3xl'
                    } drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-bold`}
                  >
                    {prompt}
                  </p>
                  <div className='flex w-full justify-around my-2'>
                    {prompts.map((_, i) => {
                      return (
                        <div
                          key={i}
                          className={`rounded-full w-3 h-3 border border-white opacity-50
                 ${currentPromptIndex < i && 'transparent'}
                 ${currentPromptIndex === i && 'bg-yellow-600'}
                 ${currentPromptIndex > i && 'bg-yellow-400'}`}
                        ></div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DementorGame;
