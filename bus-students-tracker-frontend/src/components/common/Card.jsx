import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        bg-white
        rounded-lg
        shadow-md
        p-6
        hover:shadow-lg
        transition-shadow
        duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
