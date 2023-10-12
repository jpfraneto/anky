import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { usePWA } from '../context/pwaContext';

const BottomNavbar = () => {
  const {
    isAnkyReady,
    setIsAnkyReady,
    isAnkyLoading,
    meditationReady,
    setMeditationReady,
    writingReady,
    setWritingReady,
    enteredTheAnkyverse,
  } = usePWA();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { login, user, authenticated, logout } = usePrivy();

  useEffect(() => {
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      subscribeToPushManager();
    }
  }, []);

  const askForNotificationsPermission = () => {
    if (Notification.permission === 'denied') {
      alert(
        'Notifications have been denied. Please enable them from your browser settings.'
      );
      return;
    }
    Notification.requestPermission().then(permission => {
      console.log('IN HEREAS', permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        console.log('Notification permission granted.');
        subscribeToPushManager();
      } else {
        console.error('Unable to get permission to notify.');
      }
    });
  };

  const subscribeToPushManager = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          })
          .then(pushSubscription => {
            localStorage.setItem(
              'pushSubscription',
              JSON.stringify(pushSubscription)
            );
          })
          .catch(error => {
            console.error('Could not subscribe to push', error);
          });
      });
    }
  };

  if (!meditationReady || !writingReady || !enteredTheAnkyverse) return;

  return (
    <nav className='w-full md:w-96 flex-none pt-3 pb-5 bg-transparent flex space-x-4 justify-between px-8'>
      <span onClick={() => alert('this will open the notebooks options')}>
        <Image
          width={58}
          height={58}
          src='/icons/notebook.png'
          className='hover:border-white hover:border'
          passHref
        />
      </span>
      <Link passHref href='/new-question'>
        <Image width={36} height={36} src='/icons/plus.svg' />
      </Link>
      {notificationsEnabled ? (
        <Link passHref href='/notifications'>
          <Image width={36} height={36} src='/icons/notification.svg' />
        </Link>
      ) : (
        <button onClick={askForNotificationsPermission}>
          <Image width={36} height={36} src='/icons/notification.svg' />
        </button>
      )}
    </nav>
  );
};

export default BottomNavbar;
