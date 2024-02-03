import React from "react";

const CryptoTheGame = () => {
  const emojis = [
    "\u{1F948}", // Second Place Medal
    "\u{1F9E1}", // Orange Heart
    "\u{1F495}", // Two Hearts
    "\u{1F499}", // Blue Heart
    "\u{1F947}", // First Place Medal
    "\u{1F49A}", // Green Heart
    "\u{1F49B}", // Yellow Heart
    "\u{1F495}", // Two Hearts
    "\u{1F9E1}", // Orange Heart
    "\u{1F499}", // Blue Heart
    "\u{1F49B}", // Yellow Heart
    "\u{1F948}", // Second Place Medal
  ];

  return (
    <div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
      <div
        style={{
          display: "inline-block",
          animation: "marquee 20s linear infinite",
        }}
      >
        {emojis.map((emoji, index) => (
          <span key={index} style={{ fontSize: "2rem", marginRight: "10px" }}>
            {emoji}
          </span>
        ))}
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default CryptoTheGame;
