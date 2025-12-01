import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';
import WelcomeScreen from '@components/WelcomeScreen';
import AnimatedBackground from '@components/AnimatedBackground';
import Navbar from '@components/shared/Navbar';
import HomePage from '@pages/HomePage';
import AboutPage from '@pages/AboutPage';
import TeamPage from '@pages/TeamPage';
import ServicePage from '@pages/ServicePage';
import ContactPage from '@pages/ContactPage';

const LandingPage = ({ 
  showWelcome, 
  setShowWelcome, 
  onAuthClick, 
  isAuthenticated, 
  user, 
  onLogout 
}) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <div className="relative">
          {/* Background with lower z-index */}
          <div className="absolute inset-0 z-0">
            <AnimatedBackground />
          </div>

          <div className="relative z-10">
            <Navbar 
              onAuthClick={onAuthClick}
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={onLogout}
            />
            <HomePage onAuthClick={onAuthClick} />
            <AboutPage />
            <TeamPage />
            <ServicePage />
            <ContactPage />
          </div>
        </div>
      )}
    </>
  );
};

LandingPage.propTypes = {
  showWelcome: PropTypes.bool.isRequired,
  setShowWelcome: PropTypes.func.isRequired,
  onAuthClick: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
};

export default LandingPage;
