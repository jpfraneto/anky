import React from 'react';
import Button from './Button';
import { usePrivy, useWallets } from '@privy-io/react-auth';

const LoginPage = () => {
  const { login, authenticated, user } = usePrivy();
  const wallets = useWallets();
  const wallet = wallets.wallets[0];

  const changeChain = async () => {
    if (authenticated && wallet) {
      await wallet.switchChain(8453);
      console.log('THE CHAIN WAS UPDATED');
    }
  };

  async function getUsersAnky() {
    if (!wallet.chainId.includes('8453')) {
      await changeChain();
    }
    console.log('the wallet is: ', wallet);
  }
  return (
    <div className='text-white pt-2'>
      <h2 className='text-3xl'>welcome to anky</h2>

      {authenticated ? (
        <div className='mt-2 text-purple-400'>
          <p>congratulations. you now have an account and are logged in.</p>
          <p>
            the next step is getting your anky, which is your companion on this
            journey.
          </p>
          <div className='w-36 mx-auto my-2'>
            <Button
              buttonAction={getUsersAnky}
              buttonColor='bg-green-600 text-white'
              buttonText='i already have one'
            />
          </div>
        </div>
      ) : (
        <div>
          <p>to create an account here, you need an email. whatever email. </p>
          <p>
            once you are ready, click this button and you&apos;ll receive the
            login code.
          </p>
          <div className='w-24 mx-auto my-2'>
            <Button
              buttonAction={login}
              buttonColor='bg-purple-600'
              buttonText='login'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
