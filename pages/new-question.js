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
    <div className='h-full '>
      <h2 className='text-center text-xl '>ask the ankyverse</h2>
      <p className='mt-16 p-2'>
        Here you will be able to ask a question for the community to answer
      </p>
    </div>
  );

  return (
    <>
      <h2 className='text-center text-xl '>ask the ankyverse</h2>
      <div className=' mt-32 px-2 my-2 w-9/11 flex flex-row  rounded-xl bg-black border-white border-2 shadow-orange-300 shadow-md'>
        <div className='w-1/4 flex items-center h-full justify-center '>
          <div className='w-11/12 aspect-square relative rounded-full m-2 overflow-hidden border-2 border-white'>
            <Image src={`/ankys/1.png`} fill />
          </div>
        </div>

        <div className='w-3/4 m-2 flex flex-col items-start space-y-2 justify-start'>
          <input
            type='text'
            className='bg-gray-200 px-2 py-1 mb-0 rounded-xl w-full text-black mr-3'
            placeholder='wtf is life?'
            onChange={e => {
              setQuestionMessage('');
              setNewQuestion(e.target.value);
            }}
          />
          {questionMessage && (
            <small className='text-red-500 my-0'>{questionMessage}</small>
          )}
          <div>
            <Button
              buttonAction={submitNewQuestion}
              buttonText={loadingQuestionSubmitting ? 'Loading...' : 'Submit'}
              buttonColor='bg-green-700'
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NewQuestion;