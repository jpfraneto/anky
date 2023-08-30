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
      await wallet.switchChain(8453);
      setBaseActive(true);
      setUserWallet(wallet);
      console.log('the chain was changed');
    }
  };
  useEffect(() => {
    changeChain();
  }, [wallet]);

  if (!ready) return null;

  if (!authenticated) {
    // Use Privy login instead of wagmi's connect
    return <button onClick={() => login()}>login</button>;
  }

  return (
    <div>
      <h2>Active Wallet {activeWallet?.address}</h2>
      <ul>
        {wallets.map(wallet => (
          <li key={wallet.address}>
            <button onClick={() => setActiveWallet(wallet)}>
              Activate {wallet.address}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Testing;
