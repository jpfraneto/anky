import React, { useState, useEffect } from "react";

const AboutModal = () => {
  return (
    <div>
      <div className="absolute bg-black w-screen h-screen opacity-50 top-0 left-0"></div>
      <div className="absolute text-white pt-4 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black h-3/5 rounded-xl w-96 z-40 mt-4 text-white text-center overflow-y-scroll px-4 py-4">
        <h2 className="text-2xl">About Anky</h2>
        <p>first of all, welcome. it is great to have you here.</p>
      </div>
    </div>
  );
};

export default AboutModal;
