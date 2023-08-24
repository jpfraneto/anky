import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { usePWA } from '../context/pwaContext';

const Navbar = () => {
  const router = useRouter();
  const {
    isAnkyReady,
    setIsAnkyReady,
    isAnkyLoading,
    meditationReady,
    setMeditationReady,
    writingReady,
    setWritingReady,
    enteredTheAnkyverse,
  } = usePWA();
  const { login, user, authenticated, logout } = usePrivy();

  if (!meditationReady || !writingReady || !enteredTheAnkyverse) return;

  return (
    <div className='w-full h-24 px-4 bg-black relative flex flex-none items-center '>
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
              src={user.avatarUrl || '/ankys/anky.png'}
            />
          </Link>
          {isAnkyLoading ? (
            <>
              <button
                className='border border-white p-2 ml-4 my-auto h-fit rounded-xl text-black bg-purple-500'
                disabled
              >
                Anky in Process
              </button>
            </>
          ) : (
            <>
              {isAnkyReady ? (
                <button
                  className='border border-white p-2 ml-4 my-auto h-fit rounded-xl text-white'
                  onClick={() => router.push('/choose-anky')}
                >
                  Choose my Anky
                </button>
              ) : (
                <button
                  className='border border-white p-2 ml-4 my-auto h-fit rounded-xl text-white'
                  onClick={() => router.push('/get-new-anky')}
                >
                  Get my Anky
                </button>
              )}
            </>
          )}
          <button
            className='border border-white p-2 ml-4 my-auto h-fit rounded-xl bg-red-300 text-black'
            onClick={logout}
          >
            Logout
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
