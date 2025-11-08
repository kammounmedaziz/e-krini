import React from 'react';
import { Car, Shield, Clock, Star, ArrowRight, Zap, Users, Award } from 'lucide-react';
import { Button, Card } from '@ui';

const LandingPage = ({ onGetStarted }) => {
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-mesh">
          <div className="absolute inset-0 bg-cyber-grid bg-cyber-grid opacity-20" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Drive Into The</span>
              <br />
              <span className="text-gradient">Future of Mobility</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Experience next-generation car rental with cutting-edge technology,
              premium vehicles, and seamless booking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={onGetStarted}
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
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-500 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-primary-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-gradient">E-Krini</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-purple/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of satisfied customers and experience the future of car rental
          </p>
          <Button variant="primary" size="lg" onClick={onGetStarted}>
            Create Your Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
