import React from "react";
import { useUser } from "../context/UserContext";
import ConnectFarcasterModal from "./farcaster/ConnectFarcasterModal";

const SettingsPage = () => {
  const { farcasterUser } = useUser();
  console.log("in here the farcaster user is: ", farcasterUser);
  return (
    <div className="pt-4 md:w-96 mx-auto text-white">
      <h2 className=" text-4xl mb-4">Settings</h2>
      {farcasterUser && farcasterUser.status == "approved" ? (
        <div>
          <p className="mb-2">
            you are connected to farcaster as #{farcasterUser.fid}
          </p>
          <p>
            this means that every time that you finish writing you will be able
            to cast it. as you, or anonymously.
          </p>
        </div>
      ) : (
        <ConnectFarcasterModal />
      )}
    </div>
  );
};

export default SettingsPage;
