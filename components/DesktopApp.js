import React, { useState } from 'react';
import DesktopWritingGame from './DesktopWritingGame';
import { usePrivy } from '@privy-io/react-auth';
import { getAnkyverseDay, getAnkyverseQuestion } from '../lib/ankyverse';

const DesktopApp = () => {
  const [lifeBarLength, setLifeBarLength] = useState(0);
  const ankyverseToday = getAnkyverseDay(new Date());
  const ankyverseQuestion = getAnkyverseQuestion(ankyverseToday.wink);
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
        ankyverseDate={`sojourn ${ankyverseToday.currentSojourn} - wink ${
          ankyverseToday.wink
        } - ${ankyverseToday.currentKingdom.toLowerCase()}`}
        userPrompt={ankyverseQuestion}
        setLifeBarLength={setLifeBarLength}
      />
    </div>
  );
};

export default DesktopApp;
