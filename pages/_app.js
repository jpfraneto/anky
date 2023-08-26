import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { Righteous } from 'next/font/google';
import { PrivyProvider, useWallets } from '@privy-io/react-auth';
import BottomNavbar from '../components/BottomNavbar';
import Head from 'next/head';
import Button from '../components/Button';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { PWAProvider, usePWA } from '../context/pwaContext';

const righteous = Righteous({ subsets: ['latin'], weight: ['400'] });

const handleLogin = user => {
  console.log(`User ${user.id} logged in!`);
};

function MyApp({ Component, pageProps }) {
  const {
    isAnkyReady,
    setAnkyImages,
    setIsAnkyReady,
    setIsAnkyLoading,
    writingReady,
    meditationReady,
    setMeditationReady,
  } = usePWA();
  useEffect(() => {
    console.log('THIS USE EFFECT IS RUNNING');
    const handleServiceWorkerMessage = event => {
      if (event.data && event.data.type === 'ANKY_LOADING') {
        console.log('listening to the anky loading event');
        setIsAnkyLoading(true);
      }
      if (event.data && event.data.type === 'ANKY_READY') {
        console.log('listening to the anky ready event');
        setIsAnkyReady(true);
        setIsAnkyLoading(false);
      }
      if (event.data && event.data.type === 'ANKY_IMAGES_READY') {
        console.log(
          'listening to the anky images event on the app',
          event.data.images
        );
        setAnkyImages(event.data.images);
      }
    };
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener(
        'message',
        handleServiceWorkerMessage
      );
      return () => {
        navigator.serviceWorker.removeEventListener(
          'message',
          handleServiceWorkerMessage
        );
      };
    }
  }, []);

  const subscribeToPushManager = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            ),
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

  // Utility function
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <main
      className={`${righteous.className} h-[calc(100dvh)] fixed text-white w-full md:w-96 mx-auto bg-cover bg-center`}
      style={{
        boxSizing: 'border-box',
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/anky.png')",
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Head>
        <title>Anky</title>
        <meta name='description' content='Anky is you' />
        <link rel='icon' href='/favicon.ico' />
        <link rel='manifest' href='/manifest.json' />
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
        />
        <meta name='application-name' content='Anky' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Anky' />
        <meta name='description' content='Tell us who you are' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-config' content='/icons/browserconfig.xml' />
        <meta name='msapplication-TileColor' content='#21152C' />
        <meta name='msapplication-tap-highlight' content='no' />
        <meta name='theme-color' content='#000000' />

        <link rel='apple-touch-icon' href='/images/touch/homescreen48.png' />
        <link
          rel='apple-touch-icon'
          sizes='152x152'
          href='/images/touch/homescreen168.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/images/touch/homescreen192.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='167x167'
          href='/images/touch/homescreen168.png'
        />

        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/images/touch/homescreen48.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='images/touch/homescreen48.png'
        />
        <link rel='manifest' href='/manifest.json' />
        <link rel='mask-icon' href='/icons/safari-pinned-tab.svg' />
        <link rel='shortcut icon' href='/favicon.ico' />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css?family=Righteous:300,400,500'
        />

        <meta name='twitter:card' content='summary' />
        <meta name='twitter:url' content='https://anky.lat' />
        <meta name='twitter:title' content='Anky' />
        <meta name='twitter:description' content='Tell us who you are' />
        <meta
          name='twitter:image'
          content='https://anky.lat/images/touch/homescreen168.png'
        />
        <meta name='twitter:creator' content='@kithkui' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='Anky' />
        <meta property='og:description' content='Tell us who you are' />
        <meta property='og:site_name' content='Anky' />
        <meta property='og:url' content='https://anky.lat' />
        <meta
          property='og:image'
          content='https://anky.lat/images/touch/homescreen144.png'
        />
      </Head>

      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        onSuccess={handleLogin}
        config={{
          loginMethods: ['email'],
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            logo: '',
            showWalletLoginFirst: true,
          },
        }}
      >
        <PWAProvider>
          <div className='flex flex-col h-full relative'>
            {writingReady && meditationReady && <Navbar />}
            <div className={`overflow-y-scroll flex-grow border-white`}>
              <Component {...pageProps} />
            </div>
            {writingReady && meditationReady && <BottomNavbar />}
          </div>
        </PWAProvider>
      </PrivyProvider>
    </main>
  );
}

export default MyApp;
