import '../styles/globals.css';
import { useState } from 'react';
import { Righteous } from 'next/font/google';
import { BaseGoerli } from '@thirdweb-dev/chains';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  trustWallet,
} from '@thirdweb-dev/react';

const righteous = Righteous({ subsets: ['latin'], weight: ['400'] });

function MyApp({ Component, pageProps }) {
  const [didUserWrite, setDidUserWrite] = useState(false);
  return (
    <main
      className={`${righteous.className} text-white h-screen flex flex-col overflow-y-scroll w-full bg-cover bg-center`}
      style={{
        boxSizing: 'border-box',
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/mintbg.jpg')",
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
      <ThirdwebProvider
        activeChain={BaseGoerli}
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        supportedWallets={[metamaskWallet(), coinbaseWallet(), trustWallet()]}
      >
        <Navbar />
        {true ? (
          <div>
            <Component {...pageProps} />
          </div>
        ) : (
          <div className='px-2 pt-4'>
            <p className='mb-4'>
              You need to go to the web app and write in there, before you can
              read here.
            </p>
            <Button
              buttonAction={() => setDidUserWrite(true)}
              buttonText='I already wrote'
              buttonColor='bg-purple-400 w-fit'
            />
          </div>
        )}
      </ThirdwebProvider>
    </main>
  );
}

export default MyApp;
