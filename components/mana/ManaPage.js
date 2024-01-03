import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import Button from "../Button";
import { useUser } from "../../context/UserContext";

const ManaPage = () => {
  const [userMana, setUserMana] = useState(0);
  const [displayInformation, setDisplayInformation] = useState(false);
  const { user, authenticated, ready, login } = usePrivy();
  const { userDatabaseInformation } = useUser();
  console.log("in ehre", userDatabaseInformation);

  const apiRoute =
    self.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://api.anky.lat";

  useEffect(() => {
    const fetchUserMana = async () => {
      console.log("in hereeee0, user", user);
      if (!authenticated || !ready || !user) return;
      console.log("the user is: ", user);
      const response = await axios.get(
        `${apiRoute}/mana/${user.id.replace("did:privy:", "")}`
      );
      console.log("the repsonse from the mana route is: ", response);
    };
    fetchUserMana();
  }, [ready, authenticated]);
  return (
    <div className="mt-4 h-full overflow-y-scroll text-white text-lg md:w-1/2 mx-auto">
      {authenticated ? (
        <div className="flex justify-center mb-4">
          <div className="mx-2 bg-green-400 border-white border-2 text-black p-3 rounded-xl">
            <p>$NEWEN balance:</p>
            <p className="text-4xl">
              {userDatabaseInformation.manaBalance || 0}
            </p>
          </div>
          <div className="mx-2 bg-purple-400 border-white border-2 text-black p-3 rounded-xl">
            <p>$ANKY balance:</p>
            <p className="text-4xl">tbd</p>
          </div>
          <div className="mx-2 bg-yellow-400 border-white border-2 text-black p-3 rounded-xl">
            <p>writing streak:</p>
            <p className="text-4xl">{userDatabaseInformation.streak || 0}</p>
          </div>
        </div>
      ) : (
        <div className="mb-16 bg-black bg-opacity-70 p-8">
          <p>
            if you were logged in, you would see here the balance of these two
            units in your case. you can login smoothly by clicking the following
            button. welcome. it is an honor to have you here.
          </p>
          <div className="w-48 mx-auto mt-8">
            <Button
              buttonAction={login}
              buttonText="login"
              buttonColor="bg-green-600"
            />
          </div>
        </div>
      )}
      <div className="my-2 w-36 mx-auto">
        <Button
          buttonAction={() => setDisplayInformation(!displayInformation)}
          buttonColor="bg-purple-600 text-white"
          buttonText="what is this?"
        />
      </div>

      {displayInformation && (
        <div className="md:w-2/3 mx-auto mt-4 overflow-y-scroll h-96 bg-black bg-opacity-70 p-8">
          <p className="mb-4">
            there are two kinds of tokenizations inside anky: time and energy
          </p>
          <p className="mb-4">
            the first one makes reference to the token we call $NEWEN. this is a
            representation to the life force that runs through your human
            experience. the old ones in the place where i live used to speak
            about this as newen. in other places it is called prana. anyway.
            this token seeks to be an integral representation of that basic unit
            of life force, measured in one second. one newen is one second. and
            it is the same for all of us. you can transform the relationship
            that you as a human being answer the questions that will be answered
            in the future through this system, but it will happen. and it will
            be needed.
          </p>
          <p className="mb-4">
            the second one makes the role of an vehicle for more of those that
            we would call economical transactions. the ones that have a clear
            relationship to the economy. and in this sense, this token is used
            to be able to use the app. this thing will run on top of ai, and
            that has a cost. all of that cost will be directly transfered to the
            end user through the code, so that everything that happens is clear
            and smooth. this needs to be as smooth as possible. also as cheap,
            but that will end up happening anyway. the relationship with energy
            came as a consequence of hearing someone say that money was
            christallized life force, in the context of a talk on which he was
            speaking about bitcoin. that opened a window for me, for sure.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManaPage;
