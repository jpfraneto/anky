import React, { useState } from "react";

const RightNavbar = ({ isModalOpen }) => {
  if (!isModalOpen) return <></>;
  return (
    <div className="position fixed right-0 bg-black w-96 h-screen z-60"></div>
  );
};

export default RightNavbar;
