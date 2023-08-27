import React from 'react';

const Button = ({ buttonAction, buttonText, buttonColor }) => {
  return (
    <div
      className={`${buttonColor} px-4 py-2 mx-auto hover:opacity-70 shadow shadow-slate-500 cursor-pointer rounded-xl border border-black`}
      onClick={buttonAction}
    >
      {buttonText}
    </div>
  );
};

export default Button;
