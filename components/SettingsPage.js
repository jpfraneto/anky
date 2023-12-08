import React from "react";

const SettingsPage = () => {
  return (
    <div className="pt-4 text-white">
      <h2 className=" text-4xl mb-4">Settings</h2>
      <p className="mb-4">What settings should be added here?</p>
      <p className="mb-4">
        Please help me figure it out by adding your feedback here:{" "}
        <a
          className="hover:text-purple-400"
          href="https://anky.canny.io"
          target="_blank"
        >
          https://anky.canny.io
        </a>
      </p>
    </div>
  );
};

export default SettingsPage;
