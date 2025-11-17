import React from 'react';
import { Car, Shield, Clock, Star, Users, Zap } from 'lucide-react';
import { Button } from '@ui';
import { useTheme } from '@context/ThemeContext';

const ServicePage = () => {
  const { theme } = useTheme();
  const services = [
    {
      icon: Car,
      title: 'Vehicle Rental',
      description: 'Wide range of vehicles from economy to luxury, available 24/7 with flexible booking options.',
      features: ['Instant booking', 'GPS tracking', '24/7 support', 'Flexible terms']
    },
    {
      icon: Shield,
      title: 'Insurance Coverage',
      description: 'Comprehensive insurance packages to protect your rental vehicle and ensure peace of mind.',
      features: ['Full coverage', 'Theft protection', 'Accident coverage', 'Emergency assistance']
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support with multilingual assistance and roadside help.',
      features: ['Phone support', 'Live chat', 'Roadside assistance', 'Emergency towing']
    },
    {
      icon: Users,
      title: 'Corporate Solutions',
      description: 'Tailored rental solutions for businesses with fleet management and corporate accounts.',
      features: ['Fleet management', 'Corporate rates', 'Dedicated account manager', 'Invoice management']
    },
    {
      icon: Star,
      title: 'Premium Services',
      description: 'Exclusive premium services including chauffeur-driven vehicles and luxury experiences.',
      features: ['Chauffeur service', 'Luxury vehicles', 'Airport transfers', 'Event transportation']
    },
    {
      icon: Zap,
      title: 'Digital Experience',
      description: 'Seamless digital booking platform with real-time updates and mobile app integration.',
      features: ['Mobile app', 'Real-time tracking', 'Digital payments', 'Booking history']
    }
  ];

  return (
    <section id="services" className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute inset-0 bg-cyber-grid opacity-5" />
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
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-50 animate-float" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0.08) 40%, rgba(6, 182, 212, 0.02) 70%, transparent 100%'
            : 'rgba(144, 238, 144, 0.35) 0%, rgba(240, 255, 240, 0.18) 40%, rgba(255, 255, 255, 0.1) 70%, transparent 100%'
          })`
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-purple bg-clip-text text-transparent">
                Our Services
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience unparalleled vehicle rental services with cutting-edge technology,
              comprehensive coverage, and exceptional customer care.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="card-futuristic group hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary-600 to-accent-cyan rounded-xl shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300">
                    <service.icon className="w-8 h-8 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{service.description}</p>

                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-100 dark:bg-dark-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-400 to-accent-cyan bg-clip-text text-transparent">
              Ready to Experience Excellence?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of satisfied customers who trust E-Krini for their vehicle rental needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg">
              Book Now
            </Button>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default ServicePage;