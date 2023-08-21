import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../components/Button';

const NewQuestion = () => {
  const [newQuestion, setNewQuestion] = useState('');
  const [questionMessage, setQuestionMessage] = useState('');
  const [loadingQuestionSubmitting, setLoadingQuestionSubmitting] =
    useState(false);

  const submitNewQuestion = async () => {
    if (!newQuestion) return setQuestionMessage('Question is empty');
    alert(newQuestion);
    setLoadingQuestionSubmitting(true);
  };
  return (
    <div className='w-full mt-32 my-2 flex flex-row  rounded-xl bg-black border-white border-2 shadow-orange-300 shadow-md'>
      <div className='w-1/4 flex items-center h-full justify-center '>
        <div className='w-11/12 aspect-square relative rounded-full m-2 overflow-hidden border-2 border-white'>
          <Image src={`/ankys/1.png`} fill />
        </div>
      </div>

      <div className='w-3/4 m-2 flex flex-col items-start space-y-2 justify-start w-2/3'>
        <input
          type='text'
          className='bg-gray-200 px-2 py-1 mb-0 rounded-xl w-full text-black mr-3'
          placeholder='how are you?'
          onChange={e => {
            setQuestionMessage('');
            setNewQuestion(e.target.value);
          }}
        />
        {questionMessage && (
          <small className='text-red-500 my-0'>{questionMessage}</small>
        )}
        <Button
          buttonAction={submitNewQuestion}
          buttonText={loadingQuestionSubmitting ? 'Loading...' : 'Submit'}
          buttonColor='bg-green-700'
        />
      </div>
    </div>
  );
};

export default NewQuestion;
