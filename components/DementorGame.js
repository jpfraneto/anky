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
import Spinner from './Spinner';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const righteous = Righteous({ weight: '400', subsets: ['latin'] });
const dancingScript = Dancing_Script({ weight: '400', subsets: ['latin'] });

const DementorGame = ({
  targetTime,
  notebookTypeId,
  backgroundImage,
  preloadedBackground,
  text,
  setText,
  uploadDementorPage,
  lifeBarLength,
  setLifeBarLength,
  time,
  cancel,
  setTime,
  setUserAnswers,
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
  const [newPromptDisplay, setNewPromptDisplay] = useState(true);
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
        setTime(time => time - 1);
        if (time < 1) {
          const newIndex = currentPromptIndex + 1;
          setTime(secondsPerPrompt);
          if (prompts.length > newIndex) {
            setBlockWriting(true);
            setIsActive(false);
            setCurrentPromptIndex(newIndex);
            setPrompt(prompts[newIndex]);
            setNewPromptDisplay(true);
            setTimeout(() => {
              setText(x => {
                setUserAnswers(y => [...y, x]);
                return ' ';
              });

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
    await uploadDementorPage(text, prompts);
    setUploadingWriting(false);
    startNewRun();
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
    setTime(secondsPerPrompt);
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
            <p className='text-white my-3'>
              your writing was saved. congratulations.
            </p>
            <div className='w-96 mx-auto'>
              <Button
                buttonText='close this'
                buttonColor='bg-purple-600'
                buttonAction={cancel}
              />
            </div>
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
      <div className='md:block text-white w-screen relative h-screen '>
        <div className='p-4'>
          <p
            className={`${righteous.className} z-40 ${
              newPromptDisplay
                ? 'text-yellow-500 text-4xl'
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
                  className={`rounded-full w-3 h-3 border border-white mt-2
                 ${currentPromptIndex < i && 'transparent'}
                 ${currentPromptIndex === i && 'bg-yellow-600'}
                 ${currentPromptIndex > i && 'bg-yellow-400'}`}
                ></div>
              );
            })}
          </div>
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
            className={`${dancingScript.className} ${
              text && ' absolute  pt-64'
            } ${
              text ? 'md:aspect-video md:flex w-full h-full' : 'mt-4 w-3/5 h-48'
            } p-4 text-white ${
              time > 2 && 'opacity-80'
            } placeholder-white text-2xl border border-white rounded-md  bg-opacity-10 bg-black`}
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
                <></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DementorGame;
