import React from 'react';
import { ConnectWallet } from '@thirdweb-dev/react';

const Navbar = () => {
  return (
    <div className='w-full h-20 px-8 py-2 flex justify-between'>
      <p>anky</p>
      <ConnectWallet />
    </div>
  );
};

export default Navbar;
