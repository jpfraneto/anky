import React, { useEffect } from "react";
import Button from "./Button";

var options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
};

export const IndividualWritingDisplayModal = ({
  writingForDisplay,
  setWritingForDisplay,
}) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape" && writingForDisplay) {
        setWritingForDisplay(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [writingForDisplay]);
  if (!writingForDisplay) return;

  return (
    <div className="fixed top-0 left-0 bg-black w-full h-full flex items-center justify-center z-50">
      <div className="bg-purple-300 overflow-y-scroll text-black rounded relative p-6 w-11/12 h-3/4 md:w-2/3 md:h-2/3">
        <p
          onClick={() => setWritingForDisplay(null)}
          className="absolute w-fit top-1 cursor-pointer right-2 text-red-600"
        >
          close
        </p>
        <div className="overflow-y-scroll h-9/12">
          {writingForDisplay ? (
            writingForDisplay.text.includes("\n") ? (
              writingForDisplay.text.split("\n").map((x, i) => (
                <p className="my-2" key={i}>
                  {x}
                </p>
              ))
            ) : (
              <p className="my-2">{writingForDisplay.text}</p>
            )
          ) : null}
        </div>
        <span className="text-sm absolute w-96 top-1 left-1/2 -translate-x-1/2">
          {new Date(writingForDisplay.timestamp).toLocaleDateString(
            "en-US",
            options
          )}
        </span>
        <div className="w-48 mx-auto mt-2">
          <Button
            buttonAction={() => setWritingForDisplay(null)}
            buttonText="close"
            buttonColor="bg-red-600"
          />
        </div>
      </div>
    </div>
  );
};
