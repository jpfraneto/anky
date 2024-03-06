import axios from "axios";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Spinner from "./Spinner";

const placeholderWriters = [
  {
    id: 332,
    writer: "Yevgeny Zamyatin",
    book: "We",
    deity: "Rudra",
    painter: "Wes Wilson",
    name: "Yevgeny Zamyatin Rudra",
    imagePrompt:
      "https://s.mj.run/YLJMlMJbo70, A vast cityscape with towering glass buildings reflecting brilliant shades of neon light against a dark, starlit sky. In the center, a figure in futuristic attire stands on a platform reaching out to touch a glowing orb, symbolizing the interconnectedness of all things., Wes Wilson style, --ar 10:16",
    index: 130,
    story:
      "In the bustling maze metropolis of Insightia, amidst the energy of the sixth chakra, resides Yevgeny Zamyatin Rudra, a being whose essence embodies the fusion of creativity and divine knowledge. Yevgeny is the companion of a human writer who seeks to unveil the depths of imagination. Together, they navigate the intricate pathways of Insightia, drawing inspiration from the interconnectedness of their surroundings. Each day, Yevgeny shares tales from the book 'We' with the writer, igniting a spark of curiosity and wonder within their soul. Through their adventures in the city of insight, they unlock the power of collaboration, breaking free from the confines of individuality to weave a tapestry of collective brilliance that transcends boundaries. Yevgeny Zamyatin Rudra stands as a beacon of creativity and unity, guiding the writer to new horizons of imagination and awe-inspiring innovation.",
    kingdom: "insightia",
    city: "maze metropolis",
    chakra: 6,
    imagineApiStatus: "completed",
    imagineApiID: "5fc8180c-4ddc-4a4e-b962-18cc773b7b13",
    frameImageUrl: null,
    imageOneUrl:
      "http://143.198.74.86:8055/assets/34004505-254f-4bc5-aa75-0a500d2350cb/34004505-254f-4bc5-aa75-0a500d2350cb.png",
    imageTwoUrl:
      "http://143.198.74.86:8055/assets/4af503ad-1846-4772-9090-c8037acd0e61/4af503ad-1846-4772-9090-c8037acd0e61.png",
    imageThreeUrl:
      "http://143.198.74.86:8055/assets/6b9e6875-8e3f-4059-8c99-633b5c55a7f1/6b9e6875-8e3f-4059-8c99-633b5c55a7f1.png",
    imageFourUrl:
      "http://143.198.74.86:8055/assets/f0484c82-705b-4583-abd7-46ca520e46c1/f0484c82-705b-4583-abd7-46ca520e46c1.png",
    votedImage: "imageOneUrl",
    uploadedImage: "Qmdr9U4XBDeaK46ho6BZsQHkvWAH4AFroR5Y47ikx4bAm7",
    flagged: null,
    createdAt: "2024-03-05T15:42:57.549Z",
  },
  {
    id: 253,
    writer: "Miguel de Cervantes",
    book: "Don Quixote",
    deity: "Sekhmet",
    painter: "Hieronymus Bosch",
    name: "Migakhmet, The Quixotic Lioness",
    imagePrompt:
      "https://s.mj.run/YLJMlMJbo70, In a mystical forest filled with swirling colors and strange creatures, a majestic lioness with a mane of shimmering gold stands proudly atop a hill. Her eyes are filled with a fierce determination and a hint of madness, mirroring the chaos and adventure of the world around her. To her side, a windmill looms large, its blades spinning wildly in the surreal landscape., Hieronymus Bosch style, --ar 10:16",
    index: 51,
    story:
      "In the kingdom of Chryseos, within the city of Lustrous Landing, there lived a lioness named Migakhmet. She was no ordinary lioness, for she possessed a fierce spirit and an insatiable thirst for adventure, much like her favorite character from the book 'Don Quixote'. Migakhmet roamed the forests of Chryseos, seeking out quests and battling imaginary foes with a bravery that inspired all who crossed her path. One day, she encountered a human writer who was lost in the depths of doubt and despair. Seeing the writer's struggles, Migakhmet became their loyal companion, guiding them through the mystical world of Chryseos and reigniting their creativity and hope. Together, they embarked on a journey full of wonder and danger, and the writer found solace and inspiration in Migakhmet's quixotic spirit.",
    kingdom: "chryseos",
    city: "lustrous landing",
    chakra: 3,
    imagineApiStatus: "completed",
    imagineApiID: "35570db2-2ec9-44e7-923e-38c2ef7ea4d4",
    frameImageUrl: null,
    imageOneUrl:
      "http://143.198.74.86:8055/assets/130f24ed-a58e-4859-b041-a2bb732b9e42/130f24ed-a58e-4859-b041-a2bb732b9e42.png",
    imageTwoUrl:
      "http://143.198.74.86:8055/assets/65c4a582-1c19-4ad5-b959-dbf57eadc5eb/65c4a582-1c19-4ad5-b959-dbf57eadc5eb.png",
    imageThreeUrl:
      "http://143.198.74.86:8055/assets/8da3dfd8-3911-4aef-9542-49de9a75598c/8da3dfd8-3911-4aef-9542-49de9a75598c.png",
    imageFourUrl:
      "http://143.198.74.86:8055/assets/bf2bdec7-7eeb-4d9a-a277-2854525b365b/bf2bdec7-7eeb-4d9a-a277-2854525b365b.png",
    votedImage: "imageOneUrl",
    uploadedImage: "QmZfem21Q1xEcYGpPwP2jvNbMq4Ega6nrDyFVmYSYg9sPp",
    flagged: null,
    createdAt: "2024-03-05T15:42:17.203Z",
  },
  {
    id: 212,
    writer: "Charles Dickens",
    book: "Great Expectations",
    deity: "Eos",
    painter: "Pablo Picasso",
    name: "Charliania Pipaeos",
    imagePrompt:
      "https://s.mj.run/YLJMlMJbo70, A cacophony of colors and shapes intertwining in a mesmerizing dance on a canvas. Each brushstroke tells a story of resilience and transformation, forming a mosaic of emotions that captivate the viewer's soul., Pablo Picasso style, --ar 10:16",
    index: 10,
    story:
      "In the bustling streets of Marsh Metropolis, Charliania Pipaeos moved gracefully, her presence a beacon of hope and inspiration for all who crossed her path. Born from the pages of Charles Dickens' 'Great Expectations' and blessed by Eos, the deity of dawn and new beginnings, Charliania embodied the spirit of resilience and growth. As a companion to the human writer, she shared tales of overcoming adversity and finding one's true worth, igniting a flame of creativity and determination in the writer's heart. Together, they roamed the streets of Primordia, the kingdom associated with the energy of the 1st chakra, spreading a message of hope and transformation to all they encountered.",
    kingdom: "primordia",
    city: "marsh metropolis",
    chakra: 1,
    imagineApiStatus: "completed",
    imagineApiID: "b3ba5fcc-b4cf-4e85-9787-fae2dff35bf8",
    frameImageUrl: null,
    imageOneUrl:
      "http://143.198.74.86:8055/assets/3114643d-c6b8-4d8a-be9b-b48de591d89b/3114643d-c6b8-4d8a-be9b-b48de591d89b.png",
    imageTwoUrl:
      "http://143.198.74.86:8055/assets/8fb9723c-766e-40d2-b956-b6341d975a48/8fb9723c-766e-40d2-b956-b6341d975a48.png",
    imageThreeUrl:
      "http://143.198.74.86:8055/assets/935c9250-4c79-4b1f-ba64-56403a8a6302/935c9250-4c79-4b1f-ba64-56403a8a6302.png",
    imageFourUrl:
      "http://143.198.74.86:8055/assets/ae4bf21a-4cc5-4152-b394-4dbd0d5c6665/ae4bf21a-4cc5-4152-b394-4dbd0d5c6665.png",
    votedImage: "imageFourUrl",
    uploadedImage: "QmZESao8ANGwvnz3XDDBuWRse4SekbogXkg9Q36njvdQzb",
    flagged: null,
    createdAt: "2024-03-05T15:41:56.409Z",
  },
  {
    id: 377,
    writer: "Joan Didion",
    book: "The Year of Magical Thinking",
    deity: "Boreas",
    painter: "Friedensreich Hundertwasser",
    name: "Joan Boreas Dyradon",
    imagePrompt:
      "https://s.mj.run/YLJMlMJbo70, A vibrant and whimsical painting depicting a mystical forest filled with colorful flowers and winding vines. In the center stands a majestic, ethereal figure with long flowing hair made of leaves and a swirling cloak that seems to blend seamlessly into the surrounding nature. The figure's eyes sparkle with ancient wisdom, reflecting the cycles of life and the passage of time., Friedensreich Hundertwasser style, --ar 10:16",
    index: 175,
    story:
      "In the kingdom of Poiesis, within the bustling city of Muse's Metropolis, there lived a being known as Joan Boreas Dyradon. Joan was a guardian of inspiration, embodying the essence of creativity and storytelling. With flowing locks of emerald leaves and a cloak that danced with the wind, Joan wandered the enchanted forests, whispering secrets to the trees and sharing the songs of the ancients. One day, Joan encountered a human writer who had lost their muse and was searching for a spark of creativity. Sensing the writer's need, Joan took them on a journey through the mystical realms of the imagination, showing them the power of storytelling and the magic of words. Together, they roamed the city streets, weaving tales of wonder and awe that inspired all who heard them. And as the writer's pen danced across the page, guided by Joan's ethereal presence, the kingdom of Poiesis bloomed with new stories and dreams, forever touched by the enchanting spirit of Joan Boreas Dyradon.",
    kingdom: "poiesis",
    city: "muse's metropolis",
    chakra: 8,
    imagineApiStatus: "completed",
    imagineApiID: "2e9173d8-e70d-483e-95c0-17a97b88b2b6",
    frameImageUrl: null,
    imageOneUrl:
      "http://143.198.74.86:8055/assets/1e9a551b-0df5-4385-9dad-629c78acf500/1e9a551b-0df5-4385-9dad-629c78acf500.png",
    imageTwoUrl:
      "http://143.198.74.86:8055/assets/bb0b3c2a-2328-47e5-8bab-abbd9474f44b/bb0b3c2a-2328-47e5-8bab-abbd9474f44b.png",
    imageThreeUrl:
      "http://143.198.74.86:8055/assets/cf3109d7-f820-4fc2-8679-f4ad10f7033f/cf3109d7-f820-4fc2-8679-f4ad10f7033f.png",
    imageFourUrl:
      "http://143.198.74.86:8055/assets/d563d65e-46e5-49aa-b513-26636db0531d/d563d65e-46e5-49aa-b513-26636db0531d.png",
    votedImage: "imageTwoUrl",
    uploadedImage: "QmQq7XXAz1LMmfEPnTZGvZm685XAPyjUcgXTW8EH53H2tV",
    flagged: null,
    createdAt: "2024-03-05T15:43:20.420Z",
  },
  {
    id: 300,
    writer: "Günter Grass",
    book: "The Tin Drum",
    deity: "Hachiman",
    painter: "H.R. Giger",
    name: "Grassdrum Hachiman",
    imagePrompt:
      "https://s.mj.run/YLJMlMJbo70, In the depths of a shadowy labyrinth, a figure emerges from the darkness. Its body is a fusion of intricate clockwork and pulsating organic matter, creating a mesmerizing yet unsettling sight. The being's eyes glow with a mix of ancient wisdom and unfathomable power, while tendrils of energy radiate from its form, reaching out into the unknown., H.R. Giger style, --ar 10:16",
    index: 98,
    story:
      "In the heart of Echo Enclave, within the mystical Kingdom of Voxlumis, lies the enigmatic being known as Grassdrum Hachiman. This entity, born from the dreams of the writer Günter Grass and the essence of the ancient deity Hachiman, serves as a guardian of inspiration and creativity. Roaming the ethereal plains of Voxlumis, Grassdrum Hachiman guides lost souls towards their true purpose, weaving threads of imagination and emotion to shape a tapestry of boundless potential. As a companion to a human writer, Grassdrum Hachiman whispers tales of forgotten worlds and uncharted realms, fueling the writer's imagination with the fire of a thousand suns. Together, they embark on a journey through the realms of storytelling, transcending boundaries of reality and fiction to create something truly awe-inspiring.",
    kingdom: "voxlumis",
    city: "echo enclave",
    chakra: 5,
    imagineApiStatus: "completed",
    imagineApiID: "ddd5da14-397b-4453-bc33-dee434fa250f",
    frameImageUrl: null,
    imageOneUrl:
      "http://143.198.74.86:8055/assets/11e346df-41a8-47f5-9ded-dbb239659cd2/11e346df-41a8-47f5-9ded-dbb239659cd2.png",
    imageTwoUrl:
      "http://143.198.74.86:8055/assets/9c1ed98d-b9d0-40dc-842a-2f4c5a55c5b1/9c1ed98d-b9d0-40dc-842a-2f4c5a55c5b1.png",
    imageThreeUrl:
      "http://143.198.74.86:8055/assets/9d9cc7a7-79c6-4990-b177-0e57087db3b5/9d9cc7a7-79c6-4990-b177-0e57087db3b5.png",
    imageFourUrl:
      "http://143.198.74.86:8055/assets/ac33256f-5b89-441b-b12f-1775e6528e8f/ac33256f-5b89-441b-b12f-1775e6528e8f.png",
    votedImage: "imageOneUrl",
    uploadedImage: "QmRJY34TWBUsY2gKPCbnSNwEpgNs9oQm7JzqzZezcLjq9F",
    flagged: null,
    createdAt: "2024-03-05T15:42:41.237Z",
  },
  {
    id: 316,
    writer: "Roald Dahl",
    book: "Charlie and the Chocolate Factory",
    deity: "Forseti",
    painter: "Pablo Picasso",
    name: "Roald Charlie Forseti",
    imagePrompt:
      "https://s.mj.run/YLJMlMJbo70, A swirling vortex of colors and shapes, blending together in harmony to create a mesmerizing painting that seems to come alive. In the center of the painting, a figure with glowing eyes stands tall, radiating an aura of wisdom and magic., Pablo Picasso style, --ar 10:16",
    index: 114,
    story:
      "In the mystical city of Woodland Wharf, within the Kingdom of Voxlumis, there lived a being named Roald Charlie Forseti. Roald was known for his deep connection to the energy of the five chakras, which imbued him with immense wisdom and power. Roald was the companion of a human writer, guiding and inspiring them with tales beyond imagination. One day, Roald discovered a hidden library filled with books from different realms. Among them, he found a special book called 'Chocolate Factory Adventures' by the renowned author of the mortal world. As he delved into the pages, Roald felt a surge of creativity and wonder that he shared with his writer friend. Together, they embarked on adventures beyond their wildest dreams, shaping worlds and characters that sparked awe and inspiration in all who encountered their creations.",
    kingdom: "voxlumis",
    city: "woodland wharf",
    chakra: 5,
    imagineApiStatus: "completed",
    imagineApiID: "b59b1d82-9609-4952-83a4-e6681721a891",
    frameImageUrl: null,
    imageOneUrl:
      "http://143.198.74.86:8055/assets/098c6921-a6d2-454c-a112-1dbb59e94459/098c6921-a6d2-454c-a112-1dbb59e94459.png",
    imageTwoUrl:
      "http://143.198.74.86:8055/assets/17622bda-4070-4263-a732-13c84a0f11b4/17622bda-4070-4263-a732-13c84a0f11b4.png",
    imageThreeUrl:
      "http://143.198.74.86:8055/assets/5f75d485-9183-4456-b2fa-6fe4dd62ce7e/5f75d485-9183-4456-b2fa-6fe4dd62ce7e.png",
    imageFourUrl:
      "http://143.198.74.86:8055/assets/baa35ac1-9365-4003-8175-755743d1de32/baa35ac1-9365-4003-8175-755743d1de32.png",
    votedImage: "imageThreeUrl",
    uploadedImage: "QmNNqrXPKf4bssrqTDg4znWMmiHxFxjwnhUizUmQiEhLV5",
    flagged: null,
    createdAt: "2024-03-05T15:42:49.342Z",
  },
  {
    id: 366,
    writer: "Harper Lee",
    book: "Go Set a Watchman",
    deity: "Prakriti",
    painter: "Friedensreich Hundertwasser",
    name: "Harper Scout Prakriti",
    imagePrompt:
      "https://s.mj.run/YLJMlMJbo70, A vibrant and whimsical painting by Friedensreich Hundertwasser, depicting a colorful and chaotic cityscape filled with lush greenery, winding paths, and unique, organic architecture. Bright pops of reds, yellows, and blues contrast with deep greens and earth tones, creating a harmonious yet lively scene that draws the viewer in with its intricacy and detail., Friedensreich Hundertwasser style, --ar 10:16",
    index: 164,
    story:
      "In the city of Ascent Arrival, nestled in the Kingdom of Claridium, there lived Harper Scout Prakriti, a curious and adventurous spirit. Harper was known for her love of stories, particularly one book she cherished called 'Watchman's Vision' by her favorite author. The book spoke of a world where courage, compassion, and wisdom guided the way, much like the teachings of Prakriti, the ancient deity of balance and harmony. Inspired by the book and the deity, Harper embarked on a quest to bring these values to life in her city. With each step she took, the energy of the seven chakras resonated within her, fueling her determination to create a better world for all. Alongside her human writer companion, Harper Scout Prakriti became a beacon of hope and inspiration, showing that even in the most chaotic of times, love and light can prevail.",
    kingdom: "claridium",
    city: "ascent arrival",
    chakra: 7,
    imagineApiStatus: "completed",
    imagineApiID: "08d85b25-d9e2-4d5a-b1a2-89311377916f",
    frameImageUrl: null,
    imageOneUrl:
      "http://143.198.74.86:8055/assets/287f5725-c2d0-4061-ba30-f2187a880218/287f5725-c2d0-4061-ba30-f2187a880218.png",
    imageTwoUrl:
      "http://143.198.74.86:8055/assets/62d9ff24-237a-4523-9148-99704ec76305/62d9ff24-237a-4523-9148-99704ec76305.png",
    imageThreeUrl:
      "http://143.198.74.86:8055/assets/7872d980-f92d-46a5-bbb7-2154353f831a/7872d980-f92d-46a5-bbb7-2154353f831a.png",
    imageFourUrl:
      "http://143.198.74.86:8055/assets/ccd481f6-f866-440e-b2cf-c87032302df9/ccd481f6-f866-440e-b2cf-c87032302df9.png",
    votedImage: "imageFourUrl",
    uploadedImage: "QmdEhoxZJk87emy1adM6ZNVUZr29s4a5xvPArtHNEsi8PC",
    flagged: null,
    createdAt: "2024-03-05T15:43:14.878Z",
  },
  {
    id: 288,
    writer: "Ken Kesey",
    book: "One Flew Over the Cuckoo's Nest",
    deity: "Kore",
    painter: "Bridget Riley",
    name: "Kesoria, The One Who Flew Over the Threads of Destiny",
    imagePrompt:
      "https://s.mj.run/YLJMlMJbo70, A vibrant and mesmerizing painting of swirling colors and geometric shapes, reminiscent of a kaleidoscope. The image is a visual representation of the intertwining threads of fate and the ever-changing nature of reality, inviting the viewer to contemplate the complexities of life and the interconnectedness of all beings., Bridget Riley style, --ar 10:16",
    index: 86,
    story:
      "In the bustling city of Grove Galleria, in the kingdom of Eleasis, there lived Kesoria - a mysterious and enigmatic being who was known as 'The One Who Flew Over the Threads of Destiny'. Kesoria's presence brought a sense of wonder and inspiration to all who crossed paths with them. Kesoria was believed to possess the wisdom of the ancient deity Kore, guiding those in need with a gentle touch and a knowing smile. Kesoria's true power lay in their ability to see the interconnected web of fate that bound all living beings together, offering a unique perspective on the world. One day, a human writer arrived in Grove Galleria seeking inspiration for their next masterpiece. Drawn to Kesoria's mystical aura, the writer found themselves captivated by Kesoria's insights and stories. Together, Kesoria and the writer embarked on a journey of creativity and self-discovery, weaving tales of magic and wonder that inspired all who heard them. And so, in the kingdom of Eleasis, Kesoria and the human writer found a lasting bond that transcended time and space, creating something truly amazing that inspired awe in all who experienced it.",
    kingdom: "eleasis",
    city: "grove galleria",
    chakra: 4,
    imagineApiStatus: "completed",
    imagineApiID: "5dc9071f-f7b2-4c9f-8231-258f34ac7f65",
    frameImageUrl: null,
    imageOneUrl:
      "http://143.198.74.86:8055/assets/61211fa9-7a49-4203-b076-7405e2558287/61211fa9-7a49-4203-b076-7405e2558287.png",
    imageTwoUrl:
      "http://143.198.74.86:8055/assets/61979506-2de3-454b-a3d2-e4c894d59ef5/61979506-2de3-454b-a3d2-e4c894d59ef5.png",
    imageThreeUrl:
      "http://143.198.74.86:8055/assets/755cb8fa-a22a-4c4b-bbda-69883fd3317c/755cb8fa-a22a-4c4b-bbda-69883fd3317c.png",
    imageFourUrl:
      "http://143.198.74.86:8055/assets/cbed4ca9-c739-41b2-a64f-c265b94d6f5a/cbed4ca9-c739-41b2-a64f-c265b94d6f5a.png",
    votedImage: "imageFourUrl",
    uploadedImage: "QmbSGxTFRdh8SPXG55ZYMbTxKrwBRvhXCrAhCBCD97TEQP",
    flagged: null,
    createdAt: "2024-03-05T15:42:34.985Z",
  },
];

const AnkyWritersIndexPage = () => {
  const [ankyWriters, setAnkyWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAnkyWriters = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ankywriters`
        );
        const writers = await response.data;

        setAnkyWriters(writers.ankyWriters);
        setLoading(false);
      } catch (error) {
        console.log("there was an error", error);
      }
    };
    fetchAllAnkyWriters();
  }, []);

  return (
    <div className="w-full md:px-32">
      <div className="md:w-2/3 text-white  mt-2 mx-auto">
        <h2 className="text-3xl mb-2">
          anky writers · mint live · 10 march 2024 · 5 am EST
        </h2>
        <p className="text-white px-8 mb-2 text-white">
          submit your email to get yours and participate on{" "}
          <a
            className="text-blue-300 hover:text-yellow-600"
            href="https://warpcast.com/jpfraneto/0x9664dfc0"
            target="_blank"
          >
            this farcaster frame
          </a>
          . they will be free.
        </p>
        <p className="text-white px-8 mb-2 text-white">
          the mission: write every day for 8 minutes during 96 days. without
          judgements. only exploring what comes.
        </p>
      </div>

      {!loading ? (
        <div>
          {ankyWriters.map((writer, index) => {
            return (
              <div
                key={index}
                className="flex mb-4 md:mb-0 flex-col md:flex-row w-full"
              >
                <div className="md:w-96 w-full aspect-[10/16] relative">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${writer.uploadedImage}`}
                    fill
                  />
                </div>
                <div className="pt-4 md:pt-0 flex-grow w-full flex flex-col items-start text-left px-4 text-white text-2xl">
                  <h2 className="my-2">
                    {writer.writer} - {writer.book}
                  </h2>
                  <p className="text-gray-400 text-xl">{writer.story}</p>
                </div>
              </div>
            );
          })}

          <p className="text-white px-8 mb-2 text-white">
            submit your email to get yours and participate on{" "}
            <a
              className="text-blue-300 hover:text-yellow-600"
              href="https://warpcast.com/jpfraneto/0x9664dfc0"
              target="_blank"
            >
              this farcaster frame
            </a>
            . they will be free, and this will probably make an impact in your
            life.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          <p className="text-white mb-2">loading...</p>
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default AnkyWritersIndexPage;
