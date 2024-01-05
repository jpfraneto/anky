import React, { useState, useEffect } from "react";
import Button from "./Button";

const InstallPwaModal = ({ setDisplayInstallPWA }) => {
  const [chooseOs, setChooseOs] = useState("");
  const renderInstructions = () => {
    switch (chooseOs) {
      case "ios":
        return (
          <div>
            <ol>
              <li>1. open this website on safari</li>
              <li>2. tap the options button on the navbar below</li>
              <li>
                3. scroll down until you see &quot;add to home screen&quot;. tap
                that.
              </li>
              <li>4. add</li>
              <li>5. write</li>
              <li>6. write every day through this app, at least 8 minutes. </li>
            </ol>
          </div>
        );
      case "android":
        return (
          <div>
            <p>android instructions</p>
            <ol>
              <li>1. open this website on chrome</li>
              <li>2. tap the three dot icon at the top right</li>
              <li>
                3. find the &quot;add to home screen&quot; option. tap that.
              </li>
              <li>4. add</li>
              <li>5. write</li>
              <li>6. write every day through this app, at least 8 minutes. </li>
            </ol>
          </div>
        );
    }
  };
  return (
    <div>
      <div className="fixed bg-black w-screen h-screen opacity-50 top-0 left-0"></div>
      <div className="fixed text-left pt-4 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black h-3/5 rounded-xl w-96 z-40 mt-4 text-white overflow-y-scroll px-4 py-4">
        <span
          onClick={() => setDisplayInstallPWA(false)}
          className="absolute top-0 right-2 text-red-500"
        >
          close
        </span>
        <p className="text-2xl mb-0">
          Installing the PWA{" "}
          <span className="text-xs text-purple-600 ">
            (Progressive Web App)
          </span>
        </p>

        <p className="mb-2">
          this place is designed as to be experienced as a native app, but with
          the speed of iteration (and without the boundaries) of app stores.
        </p>
        <p className="mb-2">
          if you know how to do this, please do it. if you don&apos;t... which
          is the OS of your phone?
        </p>
        <div className="flex justify-center w-48 mx-auto mb-4">
          <Button
            buttonText="iOS"
            buttonAction={() => setChooseOs("ios")}
            buttonColor={`${
              chooseOs == "ios" && "border-yellow-500 border-2"
            } bg-white text-black`}
          />
          <Button
            buttonText="android"
            buttonAction={() => setChooseOs("android")}
            buttonColor={`${
              chooseOs == "android" && "border-yellow-500 border-2"
            } bg-green-600`}
          />
        </div>
        {chooseOs.length > 0 && renderInstructions()}
      </div>
    </div>
  );
};

export default InstallPwaModal;
