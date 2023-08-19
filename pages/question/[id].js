import React from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import LandingQuestionCard from '../../components/LandingQuestionCard';

const QuestionById = () => {
  const router = useRouter();
  const writing =
    "The first thing that comes is a certain resentment or criticism towards myself for 'not being able to channel my emotions and passions constructively. That is something that is deeply present today, right now, as yesterday I had a dream on which the only thing that I thought about throughout the dream was to make love to my partner. And more than making love it was about oral sex, and it was like a very strong way on which i felt that passion canalyzed through the dream. And I woke up in the middle of the night and i hugged her and i was grateful for her being there, next to me, giving me her heat. Giving me her warmth. It was beautiful to wake up and see her there, and to listen to my daughters breathing as she slept next to us. And how is that emotion channeled? Right now I don't have a strong way, more than this. Which is actually a very strong way lol. Writing about it, allowing it to come out and be set free. That is the thing. It is not about the consequences of doing it, it is about the importance of doing it. The act itself. So yes, this is a very strong way of doing it. And also sitting in meditation. Going into the introspection of how an why and where are those passions and emotions, so that there can be a new relationship built from there. From me to there. That is the thing. It is beautiful. It is wonderful. And it is the way that i discovered yesterday that i do it, actually. Because there was a lot of nervousness, and there was a recognition that the most important action that could be undertaken in that moment was to just sit in meditation and feel what was going on. These last days have been incredibly intense in relationship to these 'awakening symptoms' that are going on inside this body. There are intense sensations mainly in the area of the head, and there is a strong sensation as if the head was going to be opened in two. As if the head was going to explode. So the answer to that was just to sit in meditation, and to observe it. And then to go to sleep. Not engage too much more in what was going on in the world through social media - trying to be as social as i could - but just about being sincere with what was happening and going on with that. Moving with that. Evolving with that. That was the mission that i had, and i keep observing it. Being with it. There are ways on which i project that it could be great to channel those emotions, but that is not as present as it could be right now. For example, there is a deep willingness to do a course with my partner of sacred sexuality, to learn about ourselves, about our bodies, about our sexual life, together. Perhaps that is something beautiful that I can offer her in this transition that we are making towards living back in santiago. Starting that 'new life' with a course like that. Honoring ourselves, honoring our journey, honoring our life, and everything that we have done to get to where we are at. It is time to honor that. I guess that a good way of honoring those sensations is just to open them, and gift them as a present to each other. Being present with each other. Being there. I channel my emotions and passions by being with them, as deep as I can.";
  return (
    <div className='flex flex-col w-full px-4 mt-24 pb-24'>
      <LandingQuestionCard question='Wtf?' avatar='8' />
      <div className='my-4 px-2'>
        {writing &&
          writing.split('\n').map((x, i) => {
            return <p key={i}>{x}</p>;
          })}
      </div>
      <Button
        buttonAction={() => router.back()}
        buttonText='Go Back'
        buttonColor='bg-green-700'
      />
    </div>
  );
};

export default QuestionById;
