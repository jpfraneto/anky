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
        ankyverseDate='sojourn 1 - wink 19 - chryseos'
        userPrompt='What aspects of your life would you like to transform, and why?'
        setLifeBarLength={setLifeBarLength}
      />
    </div>
  );
};

export default DesktopApp;
