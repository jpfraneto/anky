import { usePrivy } from "@privy-io/react-auth";
import Button from "./Button";
import { useSettings } from "../context/SettingsContext";
import React, { useState, useEffect } from "react";

const TimerSettingsModal = ({
  displaySettingsModal,
  setDisplaySettingsModal,
}) => {
  const { login } = usePrivy();
  const { userSettings, setUserSettings } = useSettings();
  const [maxTimeBetweenKeystrokes, setMaxTimeBetweenKeystrokes] = useState(
    userSettings.secondsBetweenKeystrokes
  );

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        setDisplaySettingsModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [displaySettingsModal]);

  return (
    <div>
      <div
        onClick={() => setDisplaySettingsModal(false)}
        className="fixed bg-black w-screen h-screen opacity-80 top-0 left-0"
      ></div>
      <div className="fixed text-left pt-4 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black h-4/5 rounded-xl w-5/6 md:w-1/3 z-40 mt-4 text-white overflow-y-scroll px-4 py-4">
        <span
          className="fixed right-4 top-2 text-red-600 cursor-pointer"
          onClick={() => setDisplaySettingsModal(false)}
        >
          close
        </span>
        <h2 className="text-2xl">customize your writing experience</h2>
        <ol className="flex flex-col w-full space-y-2">
          <li className="flex flex-col">
            <span className="text-purple-200 mb-2">
              <span className="text-xl text-yellow-600">
                {maxTimeBetweenKeystrokes}
              </span>{" "}
              seconds between keystrokes before your writing session ends
            </span>
            <input
              className="w-full"
              type="range"
              min={1}
              max={8}
              value={maxTimeBetweenKeystrokes}
              onChange={(e) => setMaxTimeBetweenKeystrokes(e.target.value)}
            />
            <span className="text-purple-200 mb-2">
              you will earn{" "}
              <span className="text-xl text-yellow-600">
                {Math.floor(300 / maxTimeBetweenKeystrokes)}%
              </span>{" "}
              of the amount of newen for each second written.
            </span>
          </li>
        </ol>
        <div className="mt-2 w-24 flex ">
          <div className="">
            <Button
              buttonAction={() => {
                setUserSettings((x) => {
                  return {
                    ...x,
                    secondsBetweenKeystrokes: maxTimeBetweenKeystrokes,
                  };
                });
                setDisplaySettingsModal(false);
              }}
              buttonColor="bg-green-600 text-center"
              buttonText="save"
            />
          </div>
          <div className="ml-2">
            <Button
              buttonAction={() => setDisplaySettingsModal(false)}
              buttonColor="bg-red-600 text-center"
              buttonText="cancel"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerSettingsModal;
