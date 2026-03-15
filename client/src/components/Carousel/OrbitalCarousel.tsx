import React, { useState, useEffect } from 'react';

interface Photo {
  id: number;
  src: string;
  alt: string;
}

const OrbitalCarousel: React.FC = () => {
  const [rotation, setRotation] = useState(0);

  const photos: Photo[] = [
    { id: 1, src: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=150&h=150&fit=crop&crop=face', alt: 'Person 1' },
    { id: 2, src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', alt: 'Person 2' },
    { id: 3, src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', alt: 'Person 3' },
    { id: 4, src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', alt: 'Person 4' },
    { id: 5, src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', alt: 'Person 5' },
    { id: 6, src: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150&h=150&fit=crop&crop=face', alt: 'Person 6' },
    { id: 7, src: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face', alt: 'Person 7' },
    { id: 8, src: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face', alt: 'Person 8' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.5);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getPhotoStyle = (index: number): React.CSSProperties => {
    const angle = (360 / photos.length) * index + rotation;
    const radius = 280;
    const radian = (angle * Math.PI) / 180;
    
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;
    
    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(${x - 40}px, ${y - 40}px)`,
      transition: 'none',
      zIndex: 10
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <div className="text-2xl font-bold text-gray-800">CoreShift</div>
        <div className="hidden md:flex space-x-8 text-gray-600">
          <a href="#" className="hover:text-gray-800">Product</a>
          <a href="#" className="hover:text-gray-800">Features</a>
          <a href="#" className="hover:text-gray-800">Pricing</a>
          <a href="#" className="hover:text-gray-800">Resources</a>
          <a href="#" className="hover:text-gray-800">Log in</a>
        </div>
        <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          Request Demo
        </button>
      </nav>

      {/* Orbital Photos Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            style={getPhotoStyle(index)}
            className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg hover:scale-110 transition-transform duration-300"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Central Content */}
        <div className="text-center z-15 relative max-w-lg mx-auto px-6">
          {/* Purple User Icon */}
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Core HR<br />solutions
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Streamline HR processes with modern<br />
            tools that simplify team management
          </p>

          {/* CTA Button */}
          <button className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
            Get Started
          </button>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      </div>
    </div>
  );
};

export default OrbitalCarousel;