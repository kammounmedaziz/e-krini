import React, { useEffect, useState } from 'react';
import { Car, Zap, Circle } from 'lucide-react';

const FuturisticLoading = ({ text = 'Initializing E-Krini...' }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(text);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const textMessages = [
      'Initializing E-Krini...',
      'Loading Vehicle Database...',
      'Connecting to Systems...',
      'Preparing Your Experience...',
      'Almost Ready...',
    ];

    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % textMessages.length;
      setLoadingText(textMessages[textIndex]);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50 overflow-hidden cursor-default">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-mesh">
        <div className="absolute inset-0 bg-cyber-grid opacity-10" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary-500 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-8">
        {/* Car Icon with Glow */}
        <div className="relative">
          {/* Outer Glow Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-2 border-primary-500/30 rounded-full animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-accent-cyan/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Central Car */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-cyan to-accent-purple rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-accent-cyan p-6 rounded-3xl shadow-2xl shadow-primary-500/50 animate-glow">
              <Car className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>

          {/* Speed Lines */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-16 flex gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-primary-500 animate-pulse" />
            <div className="w-6 h-0.5 bg-gradient-to-r from-transparent to-accent-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-4 h-0.5 bg-gradient-to-r from-transparent to-accent-purple animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-cyan to-primary-500 bg-clip-text text-transparent">
            E-Krini
          </span>
          <Zap className="w-6 h-6 text-accent-cyan animate-pulse" />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-gray-400 text-lg animate-pulse">{loadingText}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-3">
          <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden border border-dark-700">
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-cyan to-primary-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          
          {/* Progress Percentage */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-mono">{progress}%</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Circle
                  key={i}
                  className="w-2 h-2 text-primary-500 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tech Details */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">CPU</div>
            <div className="text-sm font-mono text-primary-500">{Math.floor(progress * 0.9)}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">RAM</div>
            <div className="text-sm font-mono text-accent-cyan">{Math.floor(progress * 0.7)}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">NET</div>
            <div className="text-sm font-mono text-accent-purple">{Math.floor(progress * 0.85)}%</div>
          </div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary-500/20 rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-accent-cyan/20 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-accent-purple/20 rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary-500/20 rounded-br-3xl" />
    </div>
  );
};

export default FuturisticLoading;