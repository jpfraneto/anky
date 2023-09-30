import React from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import LandingQuestionCard from '../../components/LandingQuestionCard';
import AnswerToQuestionCard from '../../components/AnswerToQuestionCard';

const QuestionById = () => {
  const router = useRouter();
  const answers = [
    'And that is why the relationship that AI will have with time is very important and informative about our own relationship with it. In a sense, AI is static because it is encapsulated in computers. But (from the pure basic understanding that I have of it) it evolves by bringing in more and more information related to inputs that they feed it with. So isn’t that as it is evolved with all these different inputs there is also a passing of time that happens? Isn’t it that that is how we frame time as passing? As more and more changing inputs come through our system there is a perception that there is something that is changed and that something is called time. If there is a car that is passing by in front of me right now, there is a perception that there is an input that is changing, and because of that, there is a conceptual understanding that time went by. I can’t relate this to the experience of no-time that happens in deep trance states because I can’t relate to them now, but I wonder these two things: How will AI perceive time, which will be it’s interpretation of it on a conceptual level, and also what is time ultimately in the sense of all this what goes on when there is no inputs that are changed in our whole perception system.',
    'The future is bright, and humanity will wake up to the truth of our nature just by being creative. Just by allowing ourselves to be. We came here to just be. ',
    'But yesterday I realized that that can also be an experience of the present moment. The way on which he was deriving the most out of that moment, was through recording it with his phone, so that he could send it to his friends, or whatever he wanted to do with it. That IS a valid way of spending his time as we were singing her happy birthday. It IS the way that makes more sense to him, in that moment, and that is why he is doing it. Who am I to judge that? Who am I to blame? No one. It doesn’t matter. If I find more value just by being a witness and enjoying it without the meditation of technology, it is perfect like that. Just do it. But make sure you respect the way on which other people decide to do things also. This was a big eye opener yesterday, because now I realize how much I have judged other people because of doing something like this. And what is the use of it? Why do I even care? I can only control my own life experience, the things that I do, what I care about, and caring about what other person decides to do in a particular moment doesn’t help at all. It is just noise. And I want to break free of that noise. I want to integrate it fully, and move towards the rest of my life without it. It ends up being a burden. And I don’t want that burden on top of myself. I just want to be able to enjoy every second of my experience as a human being, to be present with what is, and if I’m there judging him because he is recording, or even worse, telling him to stop, I’m just being the asshole that I have been for a big part of my life.',
  ];
  return (
    <div className='flex flex-col w-full px-4 mt-12 pb-24'>
      <LandingQuestionCard
        question='What does personal transformation mean to you, and how have you pursued it?'
        avatar='anky'
        id='1'
      />

      {answers.map((answer, i) => (
        <AnswerToQuestionCard answer={answer} key={i} index={i} />
      ))}
      <div className='mt-2'>
        <Button
          buttonAction={() =>
            alert(
              'Open the WritingGame component so that you can write in Anky in there.'
            )
          }
          buttonText='Write your answer'
          buttonColor='bg-green-700'
        />
      </div>
    </div>
  );
};

export default QuestionById;
