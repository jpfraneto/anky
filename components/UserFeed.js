import React, { useEffect, useState } from 'react';
import { getThisUserWritings } from '../lib/irys';

const UserFeed = ({ thisWallet }) => {
  console.log('this walet is: ', thisWallet);
  const [userWritings, setUserWritings] = useState([]);
  useEffect(() => {
    const fetchUserWritings = async () => {
      if (!thisWallet) return;
      const thisUserWritings = await getThisUserWritings(thisWallet.address);
      console.log('the user writings are: ', thisUserWritings);
      setUserWritings(thisUserWritings);
    };
    fetchUserWritings();
  }, [thisWallet]);

  return (
    <div className='w-1/2 mx-auto'>
      {userWritings.map((x, i) => {
        return <UserWriting writing={x} />;
      })}
    </div>
  );
};

const UserWriting = ({ writing }) => {
  return (
    <div className='p-2 m-2 rounded-xl border-white border-2 bg-black text-white'>
      {writing.text && writing.text ? (
        writing.text.includes('\n') ? (
          writing.text.split('\n').map((x, i) => (
            <p className='my-2' key={i}>
              {x}
            </p>
          ))
        ) : (
          <p className='my-2'>{writing.text}</p>
        )
      ) : null}
    </div>
  );
};

export default UserFeed;
