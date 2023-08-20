import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';

const Navbar = () => {
  const router = useRouter();
  const { login, user, authenticated } = usePrivy();
  console.log('the user is: ', user);

  return (
    <div className='w-full h-24 px-4 bg-black relative flex items-center '>
      {authenticated && user ? (
        // If the user is authenticated and user object is available
        <div className='flex space-x-2'>
          {' '}
          <Link
            passHref
            className='rounded-full overflow-hidden border border-white'
            href='/profile'
          >
            <Image
              width={55}
              height={55}
              alt='Profile picture'
              src={
                user.avatarUrl || '/ankys/get-my-anky.png' || '/ankys/anky.png'
              }
            />
          </Link>
          <button
            className='border border-white p-2 rounded-xl text-white'
            onClick={() => router.push('/get-new-anky')}
          >
            Get my Anky
          </button>
        </div>
      ) : (
        // If the user is not authenticated, show a login button
        <button
          className='border border-white p-2 rounded-xl text-white'
          onClick={login}
        >
          Enter the Ankyverse
        </button>
      )}
    </div>
  );
};

export default Navbar;
