import React from 'react';

const Button = ({ buttonAction, buttonText, buttonColor }) => {
  return (
    <div
      className={`${buttonColor} px-4 py-2 rounded-xl border border-black`}
      onClick={buttonAction}
    >
      {buttonText}
    </div>
  );
};

export default Button;
