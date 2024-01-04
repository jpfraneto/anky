import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";
import Button from "../../components/Button";

const writing =
  "Yes. It was a lamp. It was in the workshop that is next to me, next to where I am right now. It was a moment of my life on which I was exploring woodworking, and I did it because there was a deep sense of wanting to explore myself through the creative act. I had just come back from a trip to the world, and I was exploring the world in many different ways, and with that, I was exploring myself. So what I did was that, just to explore and come up with a new way of finding meaning, of finding sense, using my writing as the vehicle for that. It was fun, it was beautiful, it was inspiring, and it was challenging. I came to the workshop every day and posed myself the challenge: what the fuck do i do today with this thing? i started with the creation of the pentagon frames with a piece of wood that is called alerce. they were from the old farm of my grandparents, and they brought beauty to the yard of my grandmother. so i used them, and with them, i created something beautiful that served as the frames of that thing. so I had 5 pentagons, each one with a different size, and then I was like: Ok, what the fuck do i do now with these. so what i did was just to test things out, i hang them and came every day to see which was the best layout to hang each one of them in relationship to the other one. and it was beautiful. it was great. and that brought to me the understanding of the creative process as something progressive, as something that eventually you end up tranforming with the power of intention, every day, as you realize new ways of doing the thing. it is not that you come here and it is all ready for you to explore and experience it. nope. what happens is that you come and explore which are the boundaries of your capacity for building something cool on that particular day, and with that renewed capacity, there is a fundamental shift in how you experience your work that happens throughout the day. it is not that you do it in one moment and it is ready, it is a progressive process of sanding and sanding and with that coming up with new ways of doing the thing. and that process of sanding is where patience is required, because patience is the source of joy when you are aware of what the creative process brings to you. and that is the challenge today, in this world on which we are used to search and have as a quest the transformation of our reality in this particular moment, because what happens is that if people end up discovering who you are they will point it out. and it is over. and that is the game that will end up happening here. how can you write for 480 seconds without showing the world who you are? which is that game? which is that reality? which is that exploration? so if people end up sharing with the system your profile of social media, and more than one person shares it with you, and they discover who you are, the session is over. and that is the beauty of this thing, it can be so fun. it can be a social experiment. just if i allow it to be. just if i'm able to sand it as a reality that is shaped through the power of what comes when i realize how is it that people want to live this. how they want to experience it. how is the ux that will end up making that they resonate with it. find joy. and be in peace.";

const ReadThisId = () => {
  const router = useRouter();
  return (
    <div className="pt-4 px-4">
      <div className="aspect-square relative rounded-full overflow-hidden border-2 border-white m-2">
        <Image
          src={`/ankys/${router.query.id}.png`}
          fill
          alt={`${router.query.id} image`}
        />
      </div>
      <h2 className="text-4xl text-center">Lunamaria</h2>

      <div className="my-4">
        {writing.split("\n").map((x, i) => {
          return <p key={i}>{x}</p>;
        })}
      </div>
      <div className="my-4 w-fit">
        <Button
          buttonAction={() => router.back()}
          buttonText="go back"
          buttonColor="bg-purple-500"
        />
      </div>
    </div>
  );
};

export default ReadThisId;
