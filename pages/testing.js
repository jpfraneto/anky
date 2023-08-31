import { usePrivy, useWallets } from '@privy-io/react-auth';
import React, { useState, useEffect } from 'react';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';

const Testing = () => {
  const { login, ready, authenticated } = usePrivy();
  const [userWallet, setUserWallet] = useState(null);
  const [baseActive, setBaseActive] = useState(false);
  const wallets = useWallets();
  //   const { wallet: activeWallet, setActiveWallet } = usePrivyWagmi();
  const wallet = wallets.wallets[0];
  const changeChain = async () => {
    console.log('in here');
    if (wallet) {
      await wallet.switchChain(84531);
      setBaseActive(true);
      setUserWallet(wallet);
      console.log('the chain was changed', wallet);
    }
  };
  useEffect(() => {
    changeChain();
  }, [wallet]);

  const airdropCall = async () => {
    try {
      console.log('sending the call to the airdrop route', userWallet.address);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/airdrop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: userWallet.address,
          }),
        }
      );
      const data = await response.json();
      console.log('the response data is: ', data);
    } catch (error) {
      console.log('The airdrop was not successful', error);
    }
  };

  if (!ready) return null;

  if (!authenticated) {
    // Use Privy login instead of wagmi's connect
    return <button onClick={() => login()}>login</button>;
  }

  return (
    <div>
      <h2>Active Wallet </h2>
      <button onClick={airdropCall}>airdrop</button>
      {/* <ul>
        {wallets.map(wallet => (
          <li key={wallet.address}>
            <button onClick={() => setActiveWallet(wallet)}>
              Activate {wallet.address}
            </button>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default Testing;
