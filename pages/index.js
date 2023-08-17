import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Button from '../components/Button';
import { ThirdwebSDK } from '@thirdweb-dev/sdk/evm';
import {
  useContract,
  useContractWrite,
  useSigner,
  useAddress,
  Web3Button,
} from '@thirdweb-dev/react';

const questionOfToday =
  'Can you remember the first time you created something that truly expressed who you are?';
const writings = [
  "Yes. It was a lamp. It was in the workshop that is next to me, next to where I am right now. It was a moment of my life on which I was exploring woodworking, and I did it because there was a deep sense of wanting to explore myself through the creative act. I had just come back from a trip to the world, and I was exploring the world in many different ways, and with that, I was exploring myself. So what I did was that, just to explore and come up with a new way of finding meaning, of finding sense, using my writing as the vehicle for that. It was fun, it was beautiful, it was inspiring, and it was challenging. I came to the workshop every day and posed myself the challenge: what the fuck do i do today with this thing? i started with the creation of the pentagon frames with a piece of wood that is called alerce. they were from the old farm of my grandparents, and they brought beauty to the yard of my grandmother. so i used them, and with them, i created something beautiful that served as the frames of that thing. so I had 5 pentagons, each one with a different size, and then I was like: Ok, what the fuck do i do now with these. so what i did was just to test things out, i hang them and came every day to see which was the best layout to hang each one of them in relationship to the other one. and it was beautiful. it was great. and that brought to me the understanding of the creative process as something progressive, as something that eventually you end up tranforming with the power of intention, every day, as you realize new ways of doing the thing. it is not that you come here and it is all ready for you to explore and experience it. nope. what happens is that you come and explore which are the boundaries of your capacity for building something cool on that particular day, and with that renewed capacity, there is a fundamental shift in how you experience your work that happens throughout the day. it is not that you do it in one moment and it is ready, it is a progressive process of sanding and sanding and with that coming up with new ways of doing the thing. and that process of sanding is where patience is required, because patience is the source of joy when you are aware of what the creative process brings to you. and that is the challenge today, in this world on which we are used to search and have as a quest the transformation of our reality in this particular moment, because what happens is that if people end up discovering who you are they will point it out. and you lose. and that is the game that will end up happening here. how can you write for 480 seconds without showing the world who you are? which is that game? which is that reality? which is that exploration? so if people end up sharing with the system your profile of social media, and more than one person shares it with you, and they discover who you are, you lose. and that is the beauty of this thing, it can be so fun. it can be a social experiment. just if i allow it to be. just if i'm able to sand it as a reality that is shaped through the power of what comes when i realize how is it that people want to live this. how they want to experience it. how is the ux that will end up making that they resonate with it. find joy. and be in peace.",
  'I’m just saying that it is hard, you know? I have been more than two years now running on my own, running my own marathon, without almost anyone on the side telling me: Let’s go! You can make it! I’m running on uncharted waters, trying to bring more of something that is absolutely unusual for the environment on which I live in, and I haven’t seen the ‘results’ in a way that is concrete. And you may wonder: What can be more concrete than having written more than 1000 pages of this book. That’s the problem. I was raised with the understanding that every piece of feedback, every piece of praise, every piece of acknowledgement has to come from the outside. From the people that are next to me. From the ones that can talk about it. And the sole skill that I have been working on in this whole time since I started this game is trusting in myself enough so that I can pursue my dreams. That is the game I’m playing. That is the thing. I’m here, pushing through all the challenges (which are all in my own head, my own demons, my own internal authorities) and trying to find meaning and sense in all that. And it is like opening a hole in the wall of a prison with a spoon, you know? But if you saw The Shawshank Redemption, one of the most famous and better critizised films of humanity, the guy eventually escapes from prison after making that hole in the wall with the spoon. So yes, each time I show up, each time I come here to write on my own, to myself, is a little bigger spoonful. The one that will enable me to get out of the prison of my own head. Until I allow myself to become free from all those aspects of myself that tell me that I’m not worthy, I’m not good enough. I feel like I’m running against all the current of what I have been told in my life that works, and the interesting thing about it is that more and more people are doing it. And the internet connects us. I’m not alone in this quest. There are more and more humans that are realizing that what they have been told their whole life is not something that is the best for them in the long term, and in that realization, what comes is a willingness to explore an alternative. A different way. And that’s what we are building, without even knowing, each one of us that is showing up to Do The Work.',
  'It will be very interesting to witness how all this process of writing has evolved for me. I have been deep into the maze of my own mind, and now coming out of that maze by realizing which is the way on which I will help the world become more of what it already is. I just need to embody that in a way that makes me feel comfortable, in a way that makes sense. I become more of what I already am by just sharing myself with the world. That’s what I came here to do, share myself with the world, share my thoughts, share my truth. It doesn’t matter how that truth looks like. It just matters that it is. It is being. And that’s the thing. It is being. It is becoming, as I write every word that I write. I tend to fall into this trap of feeling as an imposter, trying to be as good as I can, without ever realizing that everything that I have to say can be valuable. On the internet, people can’t expect to get free feedback in what they do. It just doesn’t make any sense, because the cost of opportunity of people is high. They have to take the time to read and then answer back, and in that, there is a lot that can happen that will make that person not want to respond. Maybe they don’t want to share their voice. Maybe they think that they don’t have anything valuable to say. But that’s the thing, it doesn’t really matter. What only matters is that the thing happens, it is that the word is spoken, however that ends up coming. I cannot think about a better way to learn how to build in web3 than by opening the door to see what other people are doing, and how they are doing it. Thinking that they are doing it because of a reason, and using this as the most efficient curatory of content that exists. The curatory of learning opportunities. By realizing what each other person is doing, and with that, learning more about what you will do. Life is just an eternal feedback machine, with each organism interacting with the one next to it in an eternal cycle of learning from each other. Growing from what each other is doing. And that is the thing, we are just here learning how to do our thing. Just learning what it takes for this thing to be what it has to be. The whole human construct. I’m a feedback machine. I just process what you are showing to me and tell you what was brought into my experience from it. The feedback machine. Thank you for the feedback. Do you need help? The best one I can give to you is my truth. The one that comes from witnessing what is arising in my being as I interact with what you are building. So that you can learn something from it. So that you can become more of it. So that you can free space within yourself of everything that you are not, and with that, become more of what you actually are. That’s the game. Becoming more and more of what you always have been so that you can build from there. So that you can uncover that truth through the act of building. Through the art of building. Of manifesting. Of creating. Building is opening the door for something that was not there before to exist. Building is manifesting your truth and creating an interface by which you can share it with the world. So that you can shape the world from it. Through the act of creation you are bringing something into the world that was not there before. Open up to what that brings. Open up to clearing the noise so that you can explore what is there when there is no more noise. Open up to experience the world from the perspective of your truth. Open up to share with us how your truth looks like. Open up to be yourself, and to manifest everything that you are in the creative act. Leaving you aside, and building something bigger than yourself. That is what the act of creation is about, manifesting something bigger than yourself that people can work with. We are going to explore that more and more in this journey together. That’s why I’m here. To help you become more of yourself.',
];

export default function Home() {
  const writingDisplayContainerRef = useRef();
  const signer = useSigner();
  const address = useAddress();
  const [anotherOneLoading, setAnotherOneLoading] = useState(false);
  const [collectWritingLoading, setCollectWritingLoading] = useState(false);
  const [giveLoveLoading, setGiveLoveLoading] = useState(false);
  const [writingIndex, setWritingIndex] = useState(0);
  const [success, setSuccess] = useState(false);

  const collectWriting = () => {
    console.log('here');
    setCollectWritingLoading(true);
  };

  const giveLoveToWriting = () => {
    setGiveLoveLoading(true);
  };

  const loadAnotherWriting = async () => {
    setAnotherOneLoading(true);
    setWritingIndex(index => {
      console.log('in hereeee');
      console.log(index, writings.length);
      if (index === writings.length - 1) {
        alert('There are no more writings');
        return index;
      } else {
        // Scroll to the top of the writingDisplayContainerRef component
        writingDisplayContainerRef.current.scrollIntoView({
          behavior: 'smooth',
        });
        return index + 1;
      }
    });
  };

  return (
    <div className='w-screen h-screen overflow-y-scroll px-4 pt-2 pb-8 '>
      <div className='my-2'>
        <p>{questionOfToday}</p>
      </div>
      <div className='flex my-2'>
        <div className='aspect-square rounded-full overflow-hidden mr-4'>
          <Image
            src='https://i.seadn.io/gcs/files/9c75058c0fa096f7e6eb84503d413e1f.png'
            width={88}
            height={88}
            alt='Lunamaria'
          />
        </div>
        <div>
          <small>sojourn 1 - wink 8 - poiesis</small>
          <p>Lunamaria</p>
        </div>
      </div>
      <div ref={writingDisplayContainerRef}>
        {writings[writingIndex] &&
          writings[writingIndex].split('\n').map((p, i) => {
            return <p key={i}>{p}</p>;
          })}
      </div>
      <div className='flex flex-col flex-wrap space-y-2 mt-4'>
        <Button
          buttonAction={collectWriting}
          buttonText={
            !setCollectWritingLoading ? 'loading...' : 'collect writing'
          }
          buttonColor='bg-yellow-400'
        />
        <Button
          buttonAction={giveLoveToWriting}
          buttonText={
            !setGiveLoveLoading ? 'thxs for giving love' : 'give love'
          }
          buttonColor='bg-red-500'
        />

        <Button
          buttonAction={loadAnotherWriting}
          buttonText={!setAnotherOneLoading ? 'loading...' : 'read another one'}
          buttonColor='bg-purple-400'
        />
      </div>
      <hr className='h-px my-4 bg-gray-200 border-0 dark:bg-gray-700' />
      <div className='flex flex-col'>
        <p>anky 2023</p>
        <a
          href='https://www.farcaster.com/jpfraneto'
          target='_blank'
          rel='no-refferer'
        >
          farcaster
        </a>
        <a href='https://web.telegram.org/' target='_blank' rel='no-refferer'>
          telegram
        </a>

        <a href='https://www.x.com/kithkui' target='_blank' rel='no-refferer'>
          x
        </a>
      </div>
    </div>
  );
}
