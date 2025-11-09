import React, { useState, useEffect } from 'react';
import { Menu, X, Car, User, LogOut, Zap, Sun, Moon } from 'lucide-react';
import { Button } from '@ui';
import { motion } from 'framer-motion';
import { useTheme } from '@context/ThemeContext';

const Navbar = ({ onAuthClick, isAuthenticated = false, user = null, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ['home', 'about', 'team', 'services', 'contact'];
      let currentSection = 'home';
      let minDistance = Infinity;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distanceFromTop = Math.abs(rect.top - 100); // 100px offset for navbar

          if (distanceFromTop < minDistance) {
            minDistance = distanceFromTop;
            currentSection = section;
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Team', id: 'team' },
    { name: 'Services', id: 'services' },
    { name: 'Contact', id: 'contact' },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500
        w-[95%] max-w-7xl
        ${isScrolled 
          ? 'bg-white/90 dark:bg-dark-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-primary-500/30 shadow-2xl shadow-gray-200/50 dark:shadow-primary-500/20' 
          : 'bg-white/70 dark:bg-dark-800/50 backdrop-blur-md border border-gray-200/30 dark:border-dark-700/50'
        }
        rounded-3xl
      `}
    >
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button onClick={() => scrollToSection('home')} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-cyan rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-accent-cyan p-2.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Car className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 via-accent-cyan to-primary-500 bg-clip-text text-transparent">
                E-Krini
              </span>
              <Zap className="w-4 h-4 text-accent-cyan animate-pulse" />
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 bg-gray-100/70 dark:bg-dark-900/50 rounded-full p-1.5 border border-gray-200/50 dark:border-dark-700/50">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <motion.button
                    key={link.name}
                    onClick={() => scrollToSection(link.id)}
                    className={`
                      px-6 py-2 rounded-full font-medium transition-all duration-300 relative overflow-hidden
                      ${isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-cyan rounded-full -z-10"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-dark-900/50 border border-gray-200 dark:border-dark-700/50 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:border-primary-500/50 hover:scale-110 transition-all duration-300"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-900/50 rounded-full border border-gray-200 dark:border-dark-700/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                    <User size={16} className="text-gray-900 dark:text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-full bg-gray-100 dark:bg-dark-900/50 border border-gray-200 dark:border-dark-700/50 text-gray-700 dark:text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-all duration-300"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                onClick={onAuthClick}
                className="rounded-full px-6"
              >
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-dark-900/50 border border-gray-200 dark:border-dark-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-primary-500/50 transition-all duration-300"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden pb-4 pt-2 space-y-2"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <motion.button
                  key={link.name}
                  onClick={() => scrollToSection(link.id)}
                  className={`
                    block w-full text-left px-4 py-3 rounded-2xl font-medium transition-all duration-300
                    ${isActive
                      ? 'bg-gradient-to-r from-primary-600 to-accent-cyan text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-900/50 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.name}
                </motion.button>
              );
            })}
            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-dark-700/50">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-900/50 border border-gray-200 dark:border-dark-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 mb-2"
              >
                <span className="font-medium">Theme</span>
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <>
                      <span className="text-sm">Light</span>
                      <Sun size={18} />
                    </>
                  ) : (
                    <>
                      <span className="text-sm">Dark</span>
                      <Moon size={18} />
                    </>
                  )}
                </div>
              </button>

              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-900/50 rounded-2xl border border-gray-200 dark:border-dark-700/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                      <User size={16} className="text-gray-900 dark:text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Welcome, {user?.username}</span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={onLogout}
                    className="w-full rounded-2xl"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={onAuthClick}
                  className="w-full rounded-2xl"
                >
                  Get Started
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
