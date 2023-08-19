import React from 'react';
import Button from '../components/Button';
import { useLogout, usePrivy } from '@privy-io/react-auth';

const Chocapec = () => {
  const { login, logout, user, authenticated, createWallet } = usePrivy();
  const createWalletForUser = async () => {
    const response = await createWallet();
    console.log('the response is:', response);
  };
  return (
    <div className='h-full flex flex-col items-center justify-center'>
      <div className='flex flex-col space-y-2'>
        {!user ? (
          <Button
            buttonAction={login}
            buttonText='Privy Login'
            buttonColor='bg-purple-300'
          />
        ) : (
          <Button
            buttonAction={logout}
            buttonText='Logout'
            buttonColor='bg-purple-300'
          />
        )}

        <Button
          buttonAction={() => console.log(user)}
          buttonText='Get User info'
          buttonColor='bg-yellow-500'
        />
        <Button
          buttonAction={() => console.log(authenticated)}
          buttonText='Authenticated'
          buttonColor='bg-yellow-500'
        />
        {user && user.wallet ? (
          <Button
            buttonText='Print Wallet'
            buttonAction={() => console.log(user.wallet)}
            buttonColor='bg-orange-400'
          />
        ) : (
          <Button
            buttonAction={createWalletForUser}
            buttonText='Create Wallet'
            buttonColor='bg-yellow-500'
          />
        )}
      </div>

      {user && (
        <div className='flex flex-col space-y-2'>
          <p>{user.id}</p>
          <p>{user.phone.number}</p>
        </div>
      )}
    </div>
  );
};

export default Chocapec;
