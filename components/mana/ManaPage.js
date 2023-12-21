import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import Button from "../Button";
import { useUser } from "../../context/UserContext";

const ManaPage = () => {
  const [userMana, setUserMana] = useState(0);
  const { user, authenticated, ready, login } = usePrivy();
  const { userDatabaseInformation } = useUser();

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
    <div className="mt-4 text-white md:w-1/2 mx-auto">
      <h2>MANÁ</h2>
      <p>
        the tokenization in anky plays an important role. because every time
        unit that you spend writing in here, is the same time unit that another
        person spends.
      </p>
      {authenticated ? (
        <div>
          <p>your total mana:</p>
          <p className="text-4xl">{userDatabaseInformation.manaBalance}</p>
        </div>
      ) : (
        <div>
          <p>you are not logged in</p>
          <Button
            buttonAction={login}
            buttonText="login"
            buttonColor="bg-green-600"
          />
        </div>
      )}
    </div>
  );
};

export default ManaPage;
