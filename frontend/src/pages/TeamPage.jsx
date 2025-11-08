import React from 'react';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { Card } from '@ui';

const TeamPage = () => {
  const team = [
    {
      name: 'John Anderson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      bio: 'Visionary leader with 15+ years in the automotive and tech industries.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#',
      },
    },
    {
      name: 'Sarah Mitchell',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      bio: 'Tech innovator specializing in AI and machine learning solutions.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#',
      },
    },
    {
      name: 'Michael Chen',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      bio: 'Operations expert ensuring seamless service delivery worldwide.',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      bio: 'Creative designer crafting exceptional user experiences.',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: 'Full-stack engineer building robust and scalable platforms.',
      social: {
        linkedin: '#',
        github: '#',
      },
    },
    {
      name: 'Lisa Thompson',
      role: 'Customer Success Manager',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
      bio: 'Dedicated to ensuring every customer has an amazing experience.',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Meet Our <span className="text-gradient">Team</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A diverse group of passionate individuals working together to revolutionize car rental.
            We're united by our commitment to innovation and customer excellence.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="group hover:scale-105 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-60" />
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-primary-500 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm mb-4">{member.bio}</p>

                  {/* Social Links */}
                  <div className="flex justify-center gap-3">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        className="bg-dark-700 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-500 transition-all duration-300"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        className="bg-dark-700 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-500 transition-all duration-300"
                      >
                        <Twitter size={18} />
                      </a>
                    )}
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        className="bg-dark-700 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-500 transition-all duration-300"
                      >
                        <Github size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 bg-dark-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Team</h2>
          <p className="text-gray-400 text-lg mb-8">
            We're always looking for talented individuals who share our passion for innovation
            and customer excellence. If you're ready to make an impact, we'd love to hear from you.
          </p>
          <a
            href="mailto:careers@ekrini.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-primary-500/30"
          >
            <Mail size={20} />
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
