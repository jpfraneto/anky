import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Chocapec = () => {
  const { login, user } = usePrivy();
  return (
    <div>
      <button onClick={login}>privy login</button>
      <button onClick={() => alert('wena compare!')}>get info</button>
      {user && (
        <div>
          <p>{user.wallet}</p>
          <p>{user.id}</p>
          <p>{user.createdAt}</p>
          <p>{user.phone}</p>
        </div>
      )}
    </div>
  );
};

export default Chocapec;
