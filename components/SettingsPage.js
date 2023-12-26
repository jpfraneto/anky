import React from "react";
import { useUser } from "../context/UserContext";
import ConnectFarcasterModal from "./farcaster/ConnectFarcasterModal";
import { usePrivy } from "@privy-io/react-auth";

const SettingsPage = () => {
  const { farcasterUser } = useUser();
  const { authenticated, user } = usePrivy();
  console.log("in here the farcaster user is: ", farcasterUser);
  console.log("THE USER IS: ',", user);
  return (
    <div className="pt-4 md:w-96 mx-auto text-white">
      <h2 className=" text-4xl mb-4">Settings</h2>
      {authenticated ? (
        <div>
          <p className="mb-4">You are logged in</p>
          <p className="mb-4">
            your associated wallet is: {user.wallet.address}
          </p>
        </div>
      ) : (
        <div></div>
      )}

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
