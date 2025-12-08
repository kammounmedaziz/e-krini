import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@context/ThemeContext';

const AnimatedBackground = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${theme === 'dark' 
        ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900/20'
        : 'bg-gradient-to-br from-white via-gray-50 to-blue-50/20'
      }`} />

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${theme === 'dark' 
              ? 'bg-primary-500/30' 
              : 'bg-primary-500/20'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className={`absolute border ${theme === 'dark' 
              ? 'border-primary-500/20' 
              : 'border-primary-500/10'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Grid Overlay */}
      <div
        className={`absolute inset-0 ${theme === 'dark' ? 'opacity-10' : 'opacity-20'}`}
        style={{
          backgroundImage: `
            linear-gradient(${theme === 'dark' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.2)'} 1px, transparent 1px),
            linear-gradient(90deg, ${theme === 'dark' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.2)'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Smooth Gradient Radial Overlays with Enhanced Blending */}
      <div className={`absolute -top-32 -left-32 w-[800px] h-[800px] rounded-full blur-[150px] ${theme === 'dark' ? 'opacity-60' : 'opacity-90'} animate-pulse`} style={{
        background: `radial-gradient(circle, ${theme === 'dark' 
          ? 'rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0.08) 40%, rgba(14, 165, 233, 0.02) 70%, transparent 100%'
          : 'rgba(135, 206, 235, 0.4) 0%, rgba(173, 216, 230, 0.2) 40%, rgba(240, 248, 255, 0.1) 70%, transparent 100%'
        })`
      }} />
      <div className={`absolute -bottom-32 -right-32 w-[1000px] h-[1000px] rounded-full blur-[180px] ${theme === 'dark' ? 'opacity-60' : 'opacity-90'} animate-pulse`} style={{
        background: `radial-gradient(circle, ${theme === 'dark' 
          ? 'rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.08) 40%, rgba(6, 182, 212, 0.02) 70%, transparent 100%'
          : 'rgba(152, 251, 152, 0.4) 0%, rgba(144, 238, 144, 0.2) 40%, rgba(240, 255, 240, 0.1) 70%, transparent 100%'
        })`,
        animationDelay: '2s'
      }} />
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] ${theme === 'dark' ? 'opacity-50' : 'opacity-80'} animate-pulse`} style={{
        background: `radial-gradient(circle, ${theme === 'dark' 
          ? 'rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.08) 40%, rgba(147, 51, 234, 0.02) 70%, transparent 100%'
          : 'rgba(255, 182, 193, 0.4) 0%, rgba(255, 218, 221, 0.2) 40%, rgba(255, 245, 245, 0.1) 70%, transparent 100%'
        })`,
        animationDelay: '4s'
      }} />

      {/* Additional soft blending layers */}
      <div className={`absolute top-1/4 right-1/3 w-[600px] h-[600px] rounded-full blur-[120px] ${theme === 'dark' ? 'opacity-40' : 'opacity-70'} animate-float`} style={{
        background: `radial-gradient(circle, ${theme === 'dark' 
          ? 'rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0.04) 60%, transparent 100%'
          : 'rgba(173, 216, 230, 0.3) 0%, rgba(224, 255, 255, 0.15) 60%, transparent 100%'
        })`
      }} />
      <div className={`absolute bottom-1/3 left-1/4 w-[550px] h-[550px] rounded-full blur-[110px] ${theme === 'dark' ? 'opacity-40' : 'opacity-70'} animate-float`} style={{
        background: `radial-gradient(circle, ${theme === 'dark' 
          ? 'rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0.04) 60%, transparent 100%'
          : 'rgba(144, 238, 144, 0.3) 0%, rgba(240, 255, 240, 0.15) 60%, transparent 100%'
        })`,
        animationDelay: '1s'
      }} />
      <div className={`absolute top-2/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] ${theme === 'dark' ? 'opacity-40' : 'opacity-70'} animate-float`} style={{
        background: `radial-gradient(circle, ${theme === 'dark' 
          ? 'rgba(147, 51, 234, 0.12) 0%, rgba(147, 51, 234, 0.04) 60%, transparent 100%'
          : 'rgba(255, 218, 221, 0.3) 0%, rgba(255, 245, 245, 0.15) 60%, transparent 100%'
        })`,
        animationDelay: '3s'
      }} />
    </div>
  );
};

export default AnimatedBackground;