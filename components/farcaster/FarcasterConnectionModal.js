import { usePrivy } from "@privy-io/react-auth";
import Button from "../Button";
import React, { useState, useEffect } from "react";
import ConnectFarcasterModal from "./ConnectFarcasterModal";
import { useUser } from "../../context/UserContext";

const FarcasterConnectionModal = ({
  setDisplayFarcasterConnectionModalState,
}) => {
  const { login, authenticated } = usePrivy();

  const [displayConnectFarcaster, setDisplayConnectFarcaster] = useState(false);
  return (
    <div>
      <div
        onClick={() => setDisplayFarcasterConnectionModalState(false)}
        className="fixed bg-black w-screen h-screen opacity-80 top-0 left-0"
      ></div>
      <div className="fixed text-left pt-4 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black h-4/5 rounded-xl w-5/6 md:w-2/3 lg:w-1/3 z-40 mt-4 text-white text-xl overflow-y-scroll px-4 py-4">
        <span
          className="fixed right-4 top-2 text-red-600 cursor-pointer"
          onClick={() => setDisplayFarcasterConnectionModalState(false)}
        >
          close
        </span>
        <h2 className="text-2xl">Connect your farcaster account</h2>
        <p className="mb-2 mt-2">
          anky is a farcaster client. if you want to make the best use of this
          place:
        </p>
        {authenticated ? (
          <div>
            <p className="mb-2 mt-2">connect your farcaster account</p>
            {displayConnectFarcaster ? (
              <div>
                <ConnectFarcasterModal />
              </div>
            ) : (
              <div className="mt-4 w-full mx-auto flex flex-col md:flex-row">
                <div className="">
                  <Button
                    buttonAction={() => {
                      setDisplayConnectFarcaster(true);
                    }}
                    buttonColor="bg-green-600 text-center"
                    buttonText="connect"
                  />
                </div>
                <div className="mt-2 md:mt-0">
                  <Button
                    buttonAction={() =>
                      setDisplayFarcasterConnectionModalState(false)
                    }
                    buttonColor="bg-red-600 text-center"
                    buttonText="dont show again"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-2 mt-2">
              login using any email or wallet you control.
            </p>
            <div className="mt-2 md:mt-0">
              <Button
                buttonAction={login}
                buttonColor="bg-green-600 text-center"
                buttonText="login"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarcasterConnectionModal;
