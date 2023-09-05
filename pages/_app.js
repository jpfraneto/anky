import '../styles/globals.css';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Righteous } from 'next/font/google';
import { PrivyProvider, useWallets } from '@privy-io/react-auth';
import { PrivyWagmiConnector } from '@privy-io/wagmi-connector';
import { baseGoerli } from '@wagmi/chains';
import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { InjectedConnector } from 'wagmi/connectors/injected';
import BottomNavbar from '../components/BottomNavbar';
import Head from 'next/head';
import Button from '../components/Button';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { PWAProvider, usePWA } from '../context/pwaContext';

const configureChainsConfig = configureChains([baseGoerli], [publicProvider()]);

const righteous = Righteous({ subsets: ['latin'], weight: ['400'] });
const DesktopApp = dynamic(() => import('../components/DesktopApp'));

function MyApp({ Component, pageProps }) {
  const {
    isAnkyReady,
    setAnkyImages,
    setIsAnkyReady,
    setIsAnkyLoading,
    writingReady,
    enteredTheAnkyverse,
    meditationReady,
    setMeditationReady,
  } = usePWA();
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.innerWidth > 768) {
      setIsDesktop(true);
    }
    console.log('Right before the setloading');
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('THIS USE EFFECT IS RUNNING');
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
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

  const handleLogin = async user => {
    console.log('the user is', user);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/airdrop`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: user.wallet.address,
        }),
      }
    );
    const data = await response.json();
    console.log('The data iheeres: ', data);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className={`${righteous.className}`}>
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
        <script src='/main.js' defer></script>
      </Head>

      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        onSuccess={handleLogin}
        config={{
          embeddedWallets: {
            noPromptOnSignature: true,
          },
          loginMethods: ['email'],
          appearance: {
            theme: 'dark',
            accentColor: '#364CAC',
            logo: '',
            showWalletLoginFirst: true,
          },
          embeddedWallets: {
            createOnLogin: 'all-users',
          },
        }}
      >
        <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
          <PWAProvider>
            {isDesktop ? (
              <DesktopApp />
            ) : (
              <div
                className='h-[calc(100dvh)] fixed text-white md:w-96 md:left-1/2 md:-translate-x-1/2 w-full bg-cover bg-center justify-center flex flex-col '
                style={{
                  boxSizing: 'border-box',
                  backgroundImage:
                    "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/pwa.png')",
                  backgroundPosition: 'center center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {writingReady && meditationReady && enteredTheAnkyverse && (
                  <Navbar />
                )}
                <div className={`overflow-y-scroll flex-grow border-white`}>
                  <Component {...pageProps} />
                </div>
                {writingReady && meditationReady && enteredTheAnkyverse && (
                  <BottomNavbar />
                )}
              </div>
            )}
          </PWAProvider>
        </PrivyWagmiConnector>
      </PrivyProvider>
    </main>
  );
}

export default MyApp;
