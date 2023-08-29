import React, { useState } from 'react';
import DesktopWritingGame from './DesktopWritingGame';
import { usePrivy } from '@privy-io/react-auth';

const DesktopApp = () => {
  const [lifeBarLength, setLifeBarLength] = useState(0);

  return (
    <div className='text-center text-white'>
      <div className='text-white w-full h-8 flex justify-between items-center px-2'>
        <div className='h-full w-full'>
          <div
            className='h-full opacity-50'
            style={{
              width: `${lifeBarLength}%`,
              backgroundColor: lifeBarLength > 30 ? 'green' : 'red',
            }}
          ></div>
        </div>
      </div>

      <DesktopWritingGame
        ankyverseDate='sojourn 1 - wink 20 - eleasis'
        userPrompt='How do you balance giving and receiving love in your relationships?'
        setLifeBarLength={setLifeBarLength}
      />
    </div>
  );
};

export default DesktopApp;
