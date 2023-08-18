import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Chocapec = () => {
  const { login } = usePrivy();
  return (
    <div>
      <button onClick={login}>privy login</button>
      <button onClick={() => alert('wena compare!')}>get info</button>
    </div>
  );
};

export default Chocapec;
