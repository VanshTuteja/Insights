import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Waves } from 'lucide-react';

interface CarouselItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
}

const WaveCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);

  const items: CarouselItem[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      title: 'Sunset Peak',
      description: 'Golden hour magic'
    },
    {
      id: '2', 
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
      title: 'Forest Trail',
      description: 'Into the wild'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
      title: 'Floral Art',
      description: 'Nature\'s canvas'
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80',
      title: 'Wild Vista',
      description: 'Endless horizon'
    },
    {
      id: '5',
      image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop&q=80',
      title: 'Ocean Dance',
      description: 'Rhythmic waves'
    },
    {
      id: '6',
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop&q=80',
      title: 'Misty Dreams',
      description: 'Mountain serenity'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const waveAnimation = setInterval(() => {
      setWaveOffset(prev => (prev + 1.5) % 360);
    }, 60);
    return () => clearInterval(waveAnimation);
  }, []);

  const getWaveStyle = (index: number) => {
    const position = index - currentIndex;
    const baseX = position * 250;
    const waveY = Math.sin((position * 60 + waveOffset) * Math.PI / 180) * 40;
    const distance = Math.abs(position);
    
    let scale = 1 - (distance * 0.2);
    let opacity = 1 - (distance * 0.3);
    let blur = distance * 2;
    
    // Center item enhancement
    if (position === 0) {
      scale = 1.2;
      opacity = 1;
      blur = 0;
    }
    
    // Limit visibility
    if (distance > 3) {
      opacity = 0;
      scale = 0.5;
    }
    
    const zIndex = 10 - distance;
    
    return {
      transform: `translateX(${baseX}px) translateY(${waveY}px) scale(${Math.max(scale, 0.5)})`,
      opacity: Math.max(opacity, 0),
      filter: `blur(${blur}px)`,
      zIndex: Math.max(zIndex, 0),
    };
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-teal-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path
            d={`M0,400 Q300,${350 + Math.sin(waveOffset * Math.PI / 180) * 50} 600,400 T1200,400 L1200,800 L0,800 Z`}
            fill="url(#wave-gradient1)"
          />
          <path
            d={`M0,450 Q300,${400 + Math.sin((waveOffset + 90) * Math.PI / 180) * 30} 600,450 T1200,450 L1200,800 L0,800 Z`}
            fill="url(#wave-gradient2)"
          />
          <defs>
            <linearGradient id="wave-gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="cyan" stopOpacity="0.3" />
              <stop offset="100%" stopColor="blue" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="wave-gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="teal" stopOpacity="0.2" />
              <stop offset="100%" stopColor="indigo" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="mb-12 text-center z-10">
        <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-3 justify-center">
          <Waves className="text-cyan-400" size={40} />
          Wave Gallery
        </h1>
        <p className="text-white/80 text-lg">Riding the rhythm of visual storytelling</p>
      </div>

      {/* Wave Carousel */}
      <div className="relative w-full h-80 mb-12" style={{ perspective: '1200px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {items.map((item, index) => {
            const style = getWaveStyle(index);
            const isCenter = index === currentIndex;
            
            return (
              <div
                key={item.id}
                className="absolute w-64 h-80 transition-all duration-700 ease-out cursor-pointer"
                style={style}
                onClick={() => setCurrentIndex(index)}
              >
                <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl ${
                  isCenter ? 'shadow-cyan-500/30 ring-2 ring-cyan-400/50' : ''
                }`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Wave Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(45deg, 
                        rgba(0,255,255,0.2) 0%, 
                        transparent 25%, 
                        rgba(0,100,255,0.1) 50%, 
                        transparent 75%, 
                        rgba(0,255,255,0.2) 100%)`
                    }}
                  />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {item.title && (
                      <h3 className={`text-white font-bold mb-2 ${
                        isCenter ? 'text-xl' : 'text-lg'
                      }`}>
                        {item.title}
                      </h3>
                    )}
                    {item.description && isCenter && (
                      <p className="text-cyan-200 text-sm">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Wave Animation on Active */}
                  {isCenter && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent">
                      <div 
                        className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse"
                        style={{
                          transform: `translateX(${Math.sin(waveOffset * Math.PI / 180) * 20}px)`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Item Details */}
      <div className="text-center mb-8 z-10">
        <h2 className="text-3xl font-bold text-white mb-2">
          {items[currentIndex].title}
        </h2>
        <p className="text-cyan-200 text-lg">
          {items[currentIndex].description}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mb-8">
        <button
          onClick={prevSlide}
          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft size={28} />
        </button>
        
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
          <Waves size={18} className="text-cyan-400" />
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} of {items.length}
          </span>
        </div>
        
        <button
          onClick={nextSlide}
          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Wave Progress Indicator */}
      <div className="flex items-center gap-2">
        {items.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
              index === currentIndex 
                ? 'w-12 bg-gradient-to-r from-cyan-400 to-blue-400' 
                : 'w-6 bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
            style={{
              transform: index === currentIndex 
                ? `translateY(${Math.sin(waveOffset * Math.PI / 180) * 2}px)` 
                : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WaveCarousel;