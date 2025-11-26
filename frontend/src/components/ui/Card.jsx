import React from 'react';

const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`
        bg-white/5 dark:bg-dark-800/70 backdrop-blur-sm border border-gray-200/40 dark:border-dark-700 rounded-xl p-6
        shadow-sm transition-all duration-300
        ${hover ? 'hover:border-primary-500/40 hover:shadow-lg' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
