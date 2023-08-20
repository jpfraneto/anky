import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BottomNavbar = () => {
  return (
    <nav className='w-full md:w-96  bottom-0 fixed py-2 bg-white flex space-x-4 justify-between px-8'>
      <Link passHref href='/'>
        <Image width={36} height={36} src='/icons/home.svg' />
      </Link>
      <Link passHref href='/new-question'>
        <Image width={36} height={36} src='/icons/plus.svg' />
      </Link>
      <Link passHref href='/notifications'>
        <Image width={36} height={36} src='/icons/notification.svg' />
      </Link>
    </nav>
  );
};

export default BottomNavbar;
