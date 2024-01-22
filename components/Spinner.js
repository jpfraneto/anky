import React from "react";

const Spinner = () => {
  const styles = {
    ldsEllipsis: {
      display: "inline-block",
      position: "relative",
      width: "80px",
      height: "80px",
    },
    ldsEllipsisDiv: {
      position: "absolute",
      top: "33px",
      width: "13px",
      height: "13px",
      borderRadius: "50%",
      background: "#fff",
      animationTimingFunction: "cubic-bezier(0, 1, 1, 0)",
    },
    ldsEllipsisDiv1: {
      left: "8px",
      animation: "lds-ellipsis1 0.6s infinite",
    },
    ldsEllipsisDiv2: {
      left: "8px",
      animation: "lds-ellipsis2 0.6s infinite",
    },
    ldsEllipsisDiv3: {
      left: "32px",
      animation: "lds-ellipsis2 0.6s infinite",
    },
    ldsEllipsisDiv4: {
      left: "56px",
      animation: "lds-ellipsis3 0.6s infinite",
    },
    "@keyframes ldsEllipsis1": {
      "0%": {
        transform: "scale(0)",
      },
      "100%": {
        transform: "scale(1)",
      },
    },
    "@keyframes ldsEllipsis3": {
      "0%": {
        transform: "scale(1)",
      },
      "100%": {
        transform: "scale(0)",
      },
    },
    "@keyframes ldsEllipsis2": {
      "0%": {
        transform: "translate(0, 0)",
      },
      "100%": {
        transform: "translate(24px, 0)",
      },
    },
  };

  return (
    <div className="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Spinner;
