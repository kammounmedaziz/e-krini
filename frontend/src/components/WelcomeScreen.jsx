import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Car, Zap, Star } from 'lucide-react';

const WelcomeScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = [
    "Initializing E-Krini...",
    "Loading premium fleet...",
    "Preparing your experience...",
    "Almost ready..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadingComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const textInterval = setInterval(() => {
      setCurrentText(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, [onLoadingComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900"
    >
      <div className="text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-accent-purple rounded-full flex items-center justify-center shadow-2xl"
            >
              <Car className="w-12 h-12 text-gray-900 dark:text-white" />
            </motion.div>

            {/* Floating Icons */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
                x: [-5, 5, -5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center"
            >
              <Zap className="w-4 h-4 text-gray-900 dark:text-white" />
            </motion.div>

            <motion.div
              animate={{
                y: [10, -10, 10],
                x: [5, -5, 5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-2 -left-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center"
            >
              <Star className="w-4 h-4 text-gray-900 dark:text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          <span className="text-gray-900 dark:text-white">E-</span>
          <span className="text-gradient">Krini</span>
        </motion.h1>

        {/* Loading Text */}
        <motion.p
          key={currentText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-gray-600 dark:text-gray-400 text-lg mb-8 min-h-[1.5rem]"
        >
          {loadingTexts[currentText]}
        </motion.p>

        {/* Progress Bar */}
        <div className="w-80 max-w-sm mx-auto">
          <div className="w-full bg-dark-700 rounded-full h-2 mb-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full"
            />
          </div>
          <div className="text-center text-sm text-gray-500">
            {progress}%
          </div>
        </div>

        {/* Loading Dots */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex justify-center space-x-2 mt-6"
        >
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          <div className="w-2 h-2 bg-accent-purple rounded-full"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

WelcomeScreen.propTypes = {
  onLoadingComplete: PropTypes.func.isRequired,
};

export default WelcomeScreen;