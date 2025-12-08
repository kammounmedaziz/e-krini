import React from 'react';

const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`
        bg-white/80 dark:bg-dark-800/50 backdrop-blur-lg border border-gray-200 dark:border-dark-700 rounded-xl p-6
        shadow-xl transition-all duration-300
        ${hover ? 'hover:border-primary-500/50 hover:shadow-primary-500/20' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
