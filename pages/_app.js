import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Inter, Righteous, Comic_Neue } from "next/font/google";
import axios from "axios";
import ErrorBoundary from "../components/ErrorBoundary"; // Make sure the path is correct
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { base } from "viem/chains";
import { addRpcUrlOverrideToChain } from "@privy-io/react-auth";
import { configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import Head from "next/head";
import { UserProvider } from "../context/UserContext";
import { FarcasterProvider } from "../context/FarcasterContext";
import { SettingsProvider } from "../context/SettingsContext";
import { useRouter } from "next/router";
import { initializeDB } from "../lib/idbHelper";
import { Network, Alchemy } from "alchemy-sdk";

const baseOverride = addRpcUrlOverrideToChain(
  base,
  "https://base-mainnet.g.alchemy.com/v2/a2iIM92F0NkI34tOv4fNdIHQ266oPEiD"
);

const settings = {
  apiKey: "",
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(settings);

const inter = Inter({ subsets: ["cyrillic"], weight: ["400"] });
const GlobalApp = dynamic(() => import("../components/GlobalApp"));
const comic = Comic_Neue({ subsets: ["latin"], weight: ["400"] });

function MyApp({ Component, pageProps }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [loginResponse, setLoginResponse] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // const isStandalone = window.matchMedia(
    //   '(display-mode: standalone)'
    // ).matches;
    // if (isStandalone) {
    //   alert('the user has the pwa installed');
    // } else {
    //   alert('the user doesnt have the pwa installed');
    // }
    if (typeof window !== "undefined") {
      initializeDB().then((db) => {});
    }
    if (window.innerWidth > 768) {
      setIsDesktop(true);
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator && navigator.serviceWorker) {
      const handleServiceWorkerMessage = (event) => {
        if (event.data && event.data.type === "ANKY_LOADING") {
          console.log("listening to the anky loading event");
          setIsAnkyLoading(true);
        }
        if (event.data && event.data.type === "ANKY_READY") {
          console.log("listening to the anky ready event");
          setIsAnkyReady(true);
          setIsAnkyLoading(false);
        }
        if (event.data && event.data.type === "ANKY_IMAGES_READY") {
          console.log(
            "listening to the anky images event on the app",
            event.data.images
          );
          setAnkyImages(event.data.images);
        }
      };
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );
      return () => {
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      };
    }
  }, []);

  const handleLogin = async (user) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/user/login`,
        {
          privyId: user.id.split("did:privy:")[1],
        }
      );
      setLoginResponse(response.data);
    } catch (error) {
      console.log("the error is: ", error);
    }
  };

  return (
    <main
      className={`${comic.className}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <Head>
        <title>anky</title>
        <meta name="description" content="just write." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <meta name="application-name" content="Anky" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Anky" />
        <meta name="description" content="Tell us who you are" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#21152C" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />

        <link rel="apple-touch-icon" href="/images/touch/homescreen48.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/images/touch/homescreen168.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/touch/homescreen192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/images/touch/homescreen168.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/touch/homescreen48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="images/touch/homescreen48.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Righteous:300,400,500"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://anky.lat" />
        <meta name="twitter:title" content="Anky" />
        <meta name="twitter:description" content="Tell us who you are" />
        <meta
          name="twitter:image"
          content="https://anky.lat/images/touch/homescreen168.png"
        />
        <meta name="twitter:creator" content="@kithkui" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Anky" />
        <meta property="og:description" content="Tell us who you are" />
        <meta property="og:site_name" content="Anky" />
        <meta property="og:url" content="https://anky.lat" />
        <meta
          property="og:image"
          content="https://anky.lat/images/touch/homescreen144.png"
        />
        <script src="/main.js" defer></script>
      </Head>
      <ErrorBoundary>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
          onSuccess={handleLogin}
          config={{
            defaultChain: baseOverride,
            supportedChains: [base, baseOverride],
            embeddedWallets: {
              noPromptOnSignature: true,
            },
            loginMethods: ["email", "wallet"],
            appearance: {
              theme: "dark",
              accentColor: "#364CAC",
              logo: "",
            },
            embeddedWallets: {
              createOnLogin: "users-without-wallets",
              noPromptOnSignature: true,
            },
          }}
        >
          <UserProvider>
            <FarcasterProvider>
              <SettingsProvider>
                <GlobalApp alchemy={alchemy} loginResponse={loginResponse} />
              </SettingsProvider>
            </FarcasterProvider>
          </UserProvider>
        </PrivyProvider>
      </ErrorBoundary>
    </main>
  );
}

export default MyApp;
