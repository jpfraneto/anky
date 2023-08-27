import React, { useState } from 'react';
import DesktopWritingGame from './DesktopWritingGame';

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
        ankyverseDate='sojourn 1 - wink 18 - emblazion'
        userPrompt='How does your emotional and passionate energy drive your relationships?'
        setLifeBarLength={setLifeBarLength}
      />
    </div>
  );
};

export default DesktopApp;
