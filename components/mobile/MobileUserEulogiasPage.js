import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

const MobileUserEulogiasPage = ({ userAnky }) => {
  const router = useRouter();
  return (
    <div className='w-full p-4'>
      {userAnky.userEulogias.map((eulogia, i) => {
        return (
          <Link href={`/m/user/eulogias/${eulogia.eulogiaId}`} passHref key={i}>
            <div className='bg-amber-400 w-5/6 mx-auto h-24 rounded-2xl mt-4 flex items-center text-center active:bg-lime-500'>
              <div className='w-1/3 flex justify-center'>
                <div className='rounded-xl overflow-hidden relative w-3/4 aspect-square'>
                  <Image
                    src={eulogia.metadata.coverImageUrl}
                    fill
                    alt='eulogia image'
                  />
                </div>
              </div>
              <div className='text-left w-2/3 px-2 py-3'>
                <p className='text-xl'>{eulogia.metadata.title}</p>
                <p className='text-sm'>
                  {eulogia.messages.length}/{eulogia.metadata.maxPages} pages
                  written.
                </p>
              </div>
            </div>
          </Link>
        );
      })}
      <Link passHref href='/m/eulogias/new'>
        <div className='bg-amber-600 w-4/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'>
          <p className='text-white text-3xl text-center w-9/12 mx-auto'>
            new eulogia
          </p>
        </div>
      </Link>

      <div
        onClick={() => router.back()}
        className='bg-red-400 w-4/6 mx-auto h-12 rounded-2xl mt-4 flex items-center'
      >
        <p className='text-white text-3xl text-center w-9/12 mx-auto'>back</p>
      </div>
    </div>
  );
};

export default MobileUserEulogiasPage;
