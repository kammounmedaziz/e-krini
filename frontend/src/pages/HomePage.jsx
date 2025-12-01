import React from 'react';
import { Car, Shield, Clock, Star, ArrowRight, Zap, Users, Award } from 'lucide-react';
import { Button, Card } from '@ui';
import { useTheme } from '../context/ThemeContext';

const LandingPage = ({ onGetStarted, onAuthClick }) => {
  const { theme } = useTheme();
  const features = [
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Advanced security measures to protect your journey',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock assistance whenever you need',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Star,
      title: 'Premium Fleet',
      description: 'Wide selection of luxury and comfort vehicles',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Book your ride in seconds with our smart system',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const stats = [
    { icon: Users, value: '50K+', label: 'Happy Customers' },
    { icon: Car, value: '1000+', label: 'Vehicles Available' },
    { icon: Award, value: '100+', label: 'Awards Won' },
    { icon: Clock, value: '24/7', label: 'Support Available' },
  ];

  return (
    <section id="home" className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-mesh">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating Elements with Enhanced Blending */}
        <div className="absolute -top-10 -left-10 w-[400px] h-[400px] rounded-full blur-[120px] opacity-50 animate-float" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(14, 165, 233, 0.18) 0%, rgba(14, 165, 233, 0.08) 40%, rgba(14, 165, 233, 0.02) 70%, transparent 100%'
            : 'rgba(135, 206, 235, 0.35) 0%, rgba(173, 216, 230, 0.18) 40%, rgba(240, 248, 255, 0.1) 70%, transparent 100%'
          })`
        }} />
        <div className="absolute -bottom-10 -right-10 w-[500px] h-[500px] rounded-full blur-[140px] opacity-50 animate-float" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(147, 51, 234, 0.18) 0%, rgba(147, 51, 234, 0.08) 40%, rgba(147, 51, 234, 0.02) 70%, transparent 100%'
            : 'rgba(255, 182, 193, 0.35) 0%, rgba(255, 218, 221, 0.18) 40%, rgba(255, 245, 245, 0.1) 70%, transparent 100%'
          })`,
          animationDelay: '2s'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gray-900 dark:text-white">Drive Into The</span>
              <br />
              <span className="text-gradient">Future of Mobility</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Experience next-generation car rental with cutting-edge technology,
              premium vehicles, and seamless booking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={onAuthClick}
                className="group"
              >
                Get Started
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
              <Button variant="outline" size="lg">
                Explore Fleet
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center hover:scale-105 transition-transform duration-300"
              >
                <stat.icon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose <span className="text-gradient">E-Krini</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Advanced features designed to make your journey extraordinary
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-purple/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of satisfied customers and experience the future of car rental
          </p>
          <Button variant="primary" size="lg" onClick={onAuthClick}>
            Create Your Account
          </Button>
        </div>
      </section>
    </section>
  );
};

export default LandingPage;
