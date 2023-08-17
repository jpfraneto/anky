import React from 'react';
import { ConnectWallet } from '@thirdweb-dev/react';

const Navbar = () => {
  return (
    <div className='w-full h-20 px-4 py-2 flex items-center justify-between border-black border-b-2'>
      <p className='text-4xl'>anky</p>
      <ConnectWallet />
    </div>
  );
};

export default Navbar;
