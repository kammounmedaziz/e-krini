import React from 'react';
import { Target, Eye, Award, TrendingUp } from 'lucide-react';
import { Card } from '@ui';
import { useTheme } from '@context/ThemeContext';

const AboutPage = () => {
  const { theme } = useTheme();
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To revolutionize the car rental industry through innovative technology and exceptional customer service.',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To be the leading global platform for seamless and sustainable mobility solutions.',
    },
    {
      icon: Award,
      title: 'Our Values',
      description: 'Integrity, innovation, customer-centricity, and sustainability guide everything we do.',
    },
    {
      icon: TrendingUp,
      title: 'Our Growth',
      description: 'Expanding rapidly while maintaining the highest standards of service and reliability.',
    },
  ];

  const milestones = [
    { year: '2020', event: 'Company Founded', description: 'Started with a vision to transform car rental' },
    { year: '2021', event: 'First 1000 Vehicles', description: 'Expanded our fleet to 1000+ vehicles' },
    { year: '2023', event: '50K+ Customers', description: 'Reached 50,000 satisfied customers' },
    { year: '2025', event: 'Global Expansion', description: 'Launched services in 20+ countries' },
  ];

  return (
    <section id="about" className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        {/* Smooth Gradient Overlays with Enhanced Blending */}
        <div className="absolute -top-32 -left-32 w-[800px] h-[800px] rounded-full blur-[150px] opacity-60 animate-pulse" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0.08) 40%, rgba(14, 165, 233, 0.02) 70%, transparent 100%'
            : 'rgba(135, 206, 235, 0.4) 0%, rgba(173, 216, 230, 0.2) 40%, rgba(240, 248, 255, 0.1) 70%, transparent 100%'
          })`
        }} />
        <div className="absolute -bottom-32 -right-32 w-[900px] h-[900px] rounded-full blur-[170px] opacity-60 animate-pulse" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.08) 40%, rgba(147, 51, 234, 0.02) 70%, transparent 100%'
            : 'rgba(255, 182, 193, 0.4) 0%, rgba(255, 218, 221, 0.2) 40%, rgba(255, 245, 245, 0.1) 70%, transparent 100%'
          })`,
          animationDelay: '2s'
        }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-50 animate-pulse" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0.08) 40%, rgba(6, 182, 212, 0.02) 70%, transparent 100%'
            : 'rgba(144, 238, 144, 0.35) 0%, rgba(240, 255, 240, 0.18) 40%, rgba(255, 255, 255, 0.1) 70%, transparent 100%'
          })`,
          animationDelay: '4s'
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="text-gradient">E-Krini</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We're on a mission to make car rental simple, accessible, and enjoyable for everyone.
            With cutting-edge technology and a commitment to excellence, we're driving the future of mobility.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  Founded in 2020, E-Krini emerged from a simple idea: car rental should be as easy
                  as ordering a ride. We recognized that traditional car rental was plagued with
                  long wait times, complicated processes, and hidden fees.
                </p>
                <p>
                  Our founders, a team of tech entrepreneurs and automotive enthusiasts, set out to
                  create a platform that would leverage modern technology to deliver a seamless,
                  transparent, and delightful rental experience.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers worldwide, offering a diverse
                  fleet of vehicles, competitive pricing, and unparalleled customer service. Our
                  journey has just begun, and we're excited about the road ahead.
                </p>
              </div>
            </div>
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gradient">50K+</div>
                  <div className="text-gray-600 dark:text-gray-400">Happy Customers Worldwide</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gradient">1000+</div>
                  <div className="text-gray-600 dark:text-gray-400">Premium Vehicles</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gradient">20+</div>
                  <div className="text-gray-600 dark:text-gray-400">Countries Served</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gradient">99.9%</div>
                  <div className="text-gray-600 dark:text-gray-400">Customer Satisfaction</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">The principles that drive us forward</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Journey</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Key milestones in our growth story</p>
          </div>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary-500 to-accent-purple" />
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <Card>
                      <div className="text-3xl font-bold text-gradient mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{milestone.event}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                    </Card>
                  </div>
                  <div className="relative z-10 w-4 h-4 bg-primary-500 rounded-full border-4 border-white dark:border-dark-900" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default AboutPage;
