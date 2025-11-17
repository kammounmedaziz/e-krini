import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@ui';
import { useTheme } from '@context/ThemeContext';
import toast from 'react-hot-toast';
import FreeMap from '../components/FreeMap';

const ContactPage = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+216 71 123 456', '+216 71 987 654'],
      description: 'Call us anytime'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['support@e-krini.com', 'sales@e-krini.com'],
      description: 'Send us an email'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: ['123 Tech Street', 'Tunis, Tunisia'],
      description: 'Visit our headquarters'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon-Fri: 9AM-6PM', 'Sat-Sun: 10AM-4PM'],
      description: 'When you can reach us'
    }
  ];

  return (
    <section id="contact" className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute inset-0 bg-cyber-grid opacity-5" />
        {/* Smooth Gradient Overlays with Enhanced Blending */}
        <div className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full blur-[150px] opacity-60 animate-pulse" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.08) 40%, rgba(6, 182, 212, 0.02) 70%, transparent 100%'
            : 'rgba(144, 238, 144, 0.4) 0%, rgba(240, 255, 240, 0.2) 40%, rgba(255, 255, 255, 0.1) 70%, transparent 100%'
          })`
        }} />
        <div className="absolute -bottom-32 -left-32 w-[900px] h-[900px] rounded-full blur-[170px] opacity-60 animate-pulse" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.08) 40%, rgba(147, 51, 234, 0.02) 70%, transparent 100%'
            : 'rgba(255, 182, 193, 0.4) 0%, rgba(255, 218, 221, 0.2) 40%, rgba(255, 245, 245, 0.1) 70%, transparent 100%'
          })`,
          animationDelay: '2s'
        }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-50 animate-pulse" style={{
          background: `radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(14, 165, 233, 0.18) 0%, rgba(14, 165, 233, 0.08) 40%, rgba(14, 165, 233, 0.02) 70%, transparent 100%'
            : 'rgba(135, 206, 235, 0.35) 0%, rgba(173, 216, 230, 0.18) 40%, rgba(240, 248, 255, 0.1) 70%, transparent 100%'
          })`,
          animationDelay: '4s'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-purple bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions or need assistance? We're here to help. Reach out to our team
              and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Get In Touch</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="card-futuristic">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary-600 to-accent-cyan rounded-xl shadow-lg">
                        <info.icon className="w-6 h-6 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600 dark:text-gray-300">{detail}</p>
                        ))}
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="card-futuristic">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-futuristic"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-futuristic"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="input-futuristic"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="input-futuristic resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  <Send className="w-5 h-5" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-100 dark:bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-accent-cyan bg-clip-text text-transparent">
                Find Us
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Visit our headquarters in the heart of Tunis, Tunisia
            </p>
          </div>

          <div className="card-futuristic h-96 overflow-hidden">
            <FreeMap
              center={[36.8065, 10.1815]} // Tunis, Tunisia coordinates (Leaflet uses array format)
              zoom={13}
              markers={[
                {
                  position: [36.8065, 10.1815],
                  title: 'E-Krini Headquarters',
                  description: '123 Tech Street, Tunis, Tunisia'
                }
              ]}
              className="w-full h-full"
              enableUserLocation={true} // show 'Locate me' button
            />
          </div>
        </div>
      </section>
    </section>
  );
};

export default ContactPage;