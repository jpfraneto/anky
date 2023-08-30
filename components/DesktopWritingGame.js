import React, { useState, useRef, useEffect } from 'react';
import { Righteous, Dancing_Script } from 'next/font/google';
import Button from './Button';
import Image from 'next/image';
import { saveTextAnon } from '../lib/backend';
import LoggedInUser from './LoggedInUser';
import { useRouter } from 'next/router';

import { usePrivy } from '@privy-io/react-auth';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const righteous = Righteous({ weight: '400', subsets: ['latin'] });
const dancingScript = Dancing_Script({ weight: '400', subsets: ['latin'] });

const DesktopWritingGame = ({
  userPrompt,
  setLifeBarLength,

  setLoadButtons,
  ankyverseDate,
}) => {
  const { login, authenticated, user } = usePrivy();
  const audioRef = useRef();

  const [text, setText] = useState('');
  const [time, setTime] = useState(0);
  const [upscaledUrls, setUpscaledUrls] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [savingRound, setSavingRound] = useState(false);
  const [moreThanMinRun, setMoreThanMinRound] = useState(null);
  const [chosenUpscaledImage, setChosenUpscaledImage] = useState('');
  const [savingTextAnon, setSavingTextAnon] = useState(false);
  const [savedText, setSavedText] = useState(false);

  const [generatedImages, setGeneratedImages] = useState('');
  const [loadingAnkyResponse, setLoadingAnkyResponse] = useState(false);

  const [characterIsReady, setCharacterIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const [character, setCharacter] = useState(null);
  const [ankyIsReady, setAnkyIsReady] = useState(false);
  const [ankyReflection, setAnkyReflection] = useState(null);

  const [gettingAnkyverseCharacter, setGettingAnkyverseCharacter] =
    useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const [lastKeystroke, setLastKeystroke] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [errorProblem, setErrorProblem] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [secondLoading, setSecondLoading] = useState(false);
  const [thirdLoading, setThirdLoading] = useState(false);
  const [copyText, setCopyText] = useState('Copy my writing');
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
    if (time > 30) {
      setLoadButtons(true);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    alert('Your writing is on the clipboard');
  };

  const startNewRun = () => {
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
    setCopyText('Copied.');
  };

  const sendTextToBackend = async () => {
    setSavingTextAnon(true);
    console.log('going to save the text anon');
    const responseee = await saveTextAnon(text, userPrompt);
    console.log('ERAL', responseee);
    setSavedText(true);
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
      className={`${righteous.className} text-black relative  flex flex-col items-center  w-full bg-cover bg-center`}
      style={{
        boxSizing: 'border-box',
        height: 'calc(100vh - 33px)',
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/mintbg.jpg')",
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <audio ref={audioRef}>
        <source src='/sounds/bell.mp3' />
      </audio>
      <div className='md:block text-white w-full px-2 md:w-1/2 lg:w-2/3'>
        <div>
          {!finished && (
            <div
              className={` ${text.length > 0 && 'fade-out'} mb-4 ${
                time > 2 && 'hidden'
              }`}
            >
              <small className={`${righteous.className}  font-bold`}>
                {ankyverseDate}
              </small>
              <p
                className={`${righteous.className} text-4xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]   mb-4 font-bold text-center`}
              >
                {userPrompt}
              </p>
              <p className={`${righteous.className} mb-2 font-bold`}>
                Feel the prompt. Read it with intention. Answer with the heart.
              </p>

              <p className={`${righteous.className} mb-2 font-bold`}>
                Write what comes. Your truth, without judgements.
              </p>

              <p className={`${righteous.className} mb-2 font-bold`}>
                If you stop writing for 3 seconds, you lose.
              </p>

              <small
                className={`${righteous.className} hidden text-center md:flex md:justify-center mb-2 font-bold`}
              >
                (This won&apos;t be stored anywhere)
              </small>
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
              text ? 'md:aspect-video md:flex w-full h-full' : 'w-3/5 h-64'
            } p-4 text-white ${
              time > 2 && 'opacity-80'
            } placeholder-white  text-2xl border border-white rounded-md  bg-opacity-10 bg-black`}
            value={text}
            placeholder='write here...'
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
                <div className=' bg-black p-3 rounded-xl z-50 '>
                  {authenticated ? (
                    <>
                      <LoggedInUser
                        text={text}
                        startNewRun={startNewRun}
                        copyWriting={copyToClipboard}
                      />
                    </>
                  ) : (
                    <div>
                      {time <= 3 ? (
                        <div>
                          <p
                            className={`${righteous.className} mb-2 font-bold`}
                          >
                            You lost. You have to keep writing, no matter what.
                          </p>
                          <p
                            className={`${righteous.className} mb-2 font-bold`}
                          >
                            This game is designed to bring you into a meditative
                            state.
                          </p>
                          <p
                            className={`${righteous.className} mb-2 font-bold`}
                          >
                            Just relax and let your being come forth through
                            your words.
                          </p>
                          <p
                            className={`${righteous.className} mb-2 font-bold`}
                          >
                            Min score to qualify is 30 seconds.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p
                            className={`${righteous.className} mb-2 font-bold`}
                          >
                            Great job.
                          </p>
                          <p
                            className={`${righteous.className} mb-2 font-bold`}
                          >
                            I&apos;m working on giving you the ability to store
                            your writings forever.
                          </p>
                          <p
                            className={`${righteous.className} mb-2 font-bold`}
                          >
                            For now, you can store it anonymously.
                          </p>
                        </div>
                      )}
                      <div className='flex flex-col  md:flex-row justify-center '>
                        <Button
                          buttonColor='bg-yellow-500'
                          buttonAction={pasteText}
                          buttonText={copyText}
                        />

                        {time > 3 ? (
                          <Button
                            buttonAction={login}
                            buttonText='Create account / login'
                            buttonColor='bg-purple-600'
                          />
                        ) : (
                          <Button
                            buttonAction={startNewRun}
                            buttonText='Start again'
                            buttonColor='bg-green-600'
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {savedText ? (
                    <p>Your text was saved anon</p>
                  ) : (
                    <Button
                      buttonAction={sendTextToBackend}
                      buttonText={
                        savingTextAnon ? `Saving...` : `Save text anon`
                      }
                      buttonColor='bg-green-600 mt-2'
                    />
                  )}
                </div>
              ) : (
                <p
                  className={`${righteous.className} z-40 text-fuchsia-500 text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-bold`}
                >
                  {userPrompt}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopWritingGame;
