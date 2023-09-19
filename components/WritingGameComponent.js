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

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const righteous = Righteous({ weight: '400', subsets: ['latin'] });
const dancingScript = Dancing_Script({ weight: '400', subsets: ['latin'] });

const WritingGameComponent = ({
  notebookType,
  targetTime,
  notebookTypeId,
  backgroundImage,
  preloadedBackground,
  prompt,
  musicUrl,
  fullDisplay,
  text,
  setText,
  onFinish,
  lifeBarLength,
  setLifeBarLength,
  time,
  setTime,
}) => {
  const router = useRouter();
  const { setMusicPlaying, setIsAnkyLoading } = usePWA();
  const { login, authenticated, user } = usePrivy();
  const audioRef = useRef();
  const [preparing, setPreparing] = useState(true);
  const [saveText, setSaveText] = useState('save anon');
  const [upscaledUrls, setUpscaledUrls] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [savingRound, setSavingRound] = useState(false);
  const [moreThanMinRun, setMoreThanMinRound] = useState(null);
  const [chosenUpscaledImage, setChosenUpscaledImage] = useState('');
  const [savingTextAnon, setSavingTextAnon] = useState(false);
  const [savedText, setSavedText] = useState(false);

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
  const [writingSaved, setWritingSaved] = useState(false);
  const [writingSavingLoading, setWritingSavingLoading] = useState(false);

  const [progress, setProgress] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const textareaRef = useRef(null);
  const intervalRef = useRef(null);
  const keystrokeIntervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isDone) {
      intervalRef.current = setInterval(() => {
        setTime(time => time + 1);
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
          audioRef.current.play();
        }
        if (elapsedTime > 3000 && !isDone) {
          finishRun();
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

  const finishRun = async () => {
    setLifeBarLength(0);
    audioRef.current.volume = 0.1;
    audioRef.current.play();
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

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopyText('copied');
  };

  const startNewRun = () => {
    copyToClipboard();
    audioRef.current.pause();
    setCopyText('Copy my writing');
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

  const pasteText = async () => {
    await navigator.clipboard.writeText(text);
    setCopyText('copied.');
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
          buttonAction={pasteText}
          buttonText={copyText}
        />
      </div>
    );

  return (
    <div
      className={`${righteous.className} text-black relative overflow-y-scroll flex flex-col items-center  w-full bg-cover bg-center`}
      style={{
        boxSizing: 'border-box',
        height: 'calc(100vh - 33px)',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${
          preloadedBackground || '/images/mintbg.jpg'
        })`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
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
                className={`${righteous.className} text-5xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]   mb-4 font-bold text-center`}
              >
                {prompt}
              </p>

              <small
                className={`${righteous.className} md:hidden mb-2 font-bold`}
              >
                (This website is optimized for desktop)
              </small>
            </div>
          )}

          <textarea
            ref={textareaRef}
            disabled={finished}
            style={{
              top: `${text && '0'}%`,
              bottom: `${text && '0'}%`,
              left: `${text && '0'}%`,
              right: `${text && '0'}%`,
              transition: 'top 1s, bottom 1s, left 1s, right 1s', // smooth transition over 1 second
            }}
            className={`${dancingScript.className} ${text && 'absolute'} ${
              text ? 'md:aspect-video md:flex w-full h-full' : ' w-3/5 h-64'
            } p-4 text-white ${
              time > 2 && 'opacity-80'
            } placeholder-white  text-2xl border border-white rounded-md  bg-opacity-10 bg-black`}
            value={text}
            placeholder={prompt}
            onChange={handleTextChange}
          ></textarea>
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
                <div className='p-4 bg-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]  z-50'>
                  <p
                    className={`${righteous.className} mb-2 text-xl font-bold`}
                  >
                    great job.
                  </p>
                  <p
                    className={`${righteous.className} mb-2 text-xl font-bold`}
                  >
                    you can save what you wrote forever on the blockchain.
                  </p>

                  <div className='flex justify-center '>
                    <Button
                      buttonAction={() => {
                        setSavingTextAnon(true);
                        onFinish(text);
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
                <p
                  className={`${righteous.className}  ${
                    time < 3 && 'hidden'
                  } z-40 text-fuchsia-500 text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-bold`}
                >
                  {prompt}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingGameComponent;
