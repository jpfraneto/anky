import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Button from '../components/Button';
import Link from 'next/link';
import LandingQuestionCard from '../components/LandingQuestionCard';

export default function Home() {
  const writingDisplayContainerRef = useRef();

  const [anotherOneLoading, setAnotherOneLoading] = useState(false);
  const [collectWritingLoading, setCollectWritingLoading] = useState(false);
  const [giveLoveLoading, setGiveLoveLoading] = useState(false);
  const [writingIndex, setWritingIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [writings, setWritings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      // add event listeners to handle any of PWA lifecycle event
      // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-window.Workbox#events
      wb.addEventListener('installed', event => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.addEventListener('controlling', event => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.addEventListener('activated', event => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting to false in next.config.js pwa object
      // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
      const promptNewVersionAvailable = event => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.
        if (
          confirm(
            'A newer version of this web app is available, reload to update?'
          )
        ) {
          wb.addEventListener('controlling', event => {
            window.location.reload();
          });

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting();
        } else {
          console.log(
            'User rejected to reload the web app, keep using old version. New version will be automatically load when user opens the app next time.'
          );
        }
      };

      wb.addEventListener('waiting', promptNewVersionAvailable);

      // ISSUE - this is not working as expected, why?
      // I could only make message event listenser work when I manually add this listenser into sw.js file
      wb.addEventListener('message', event => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      /*
      wb.addEventListener('redundant', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('externalinstalled', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('externalactivated', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })
      */

      // never forget to call register as auto register is turned off in next.config.js
      wb.register();
    }
  }, []);

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
    return <div className='text-white p-4'>Loading...</div>;
  }

  if (!writings) {
    return <p className='text-white'>There are no writings yet.</p>;
  }

  return (
    <div className='w-full mx-auto text-white overflow-y-scroll px-4 pt-2 pb-8 '>
      <h2 className='text-4xl text-center mt-2'>ANKY</h2>
      <LandingQuestionCard
        id='1'
        question='What does personal transformation mean to you, and how have you pursued it?'
        avatar='anky'
      />
      <div className='flex flex-wrap justify-center'>
        {writings &&
          writings.reverse().map(writing => (
            <div className='pt-4' key={writing.id}>
              <div className='aspect-square relative rounded-full overflow-hidden border-2 border-white m-2'>
                <Image
                  src={`/ankys/${Math.floor(7 * Math.random())}.png`}
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
              <Link href='/chocapec' passHref>
                <hr className='border-2 border-white w-full px-2' />
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
