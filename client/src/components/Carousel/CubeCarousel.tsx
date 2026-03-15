import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface CarouselItem {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
}

const CubeCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const items: CarouselItem[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      title: 'Mountain Majesty',
      subtitle: 'Alpine Adventure'
    },
    {
      id: '2', 
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
      title: 'Forest Depths',
      subtitle: 'Nature\'s Path'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
      title: 'Ocean Bloom',
      subtitle: 'Floral Dreams'
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80',
      title: 'Wild Horizon',
      subtitle: 'Endless Vista'
    }
  ];

  const nextSlide = () => {
    if (!isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsFlipping(false);
      }, 300);
    }
  };

  const prevSlide = () => {
    if (!isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        setIsFlipping(false);
      }, 300);
    }
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCubeStyle = (index: number) => {
    const position = (index - currentIndex + items.length) % items.length;
    const totalItems = items.length;
    const angle = (360 / totalItems) * position;
    const radius = 300;
    
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius;
    
    let scale = 0.7;
    let opacity = 0.5;
    
    if (position === 0) {
      scale = 1.1;
      opacity = 1;
    } else if (position === 1 || position === totalItems - 1) {
      scale = 0.8;
      opacity = 0.7;
    }
    
    return {
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${-angle}deg) scale(${scale}) ${
        isFlipping && position === 0 ? 'rotateX(360deg)' : ''
      }`,
      opacity,
      zIndex: position === 0 ? 10 : Math.round(z + 100),
    };
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Geometric Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">3D Cube Gallery</h1>
        <p className="text-white/70">Interactive cube-based navigation</p>
      </div>

      {/* Main Cube Carousel */}
      <div className="relative w-full h-96 mb-8" style={{ perspective: '1000px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {items.map((item, index) => {
            const style = getCubeStyle(index);
            const isActive = (index - currentIndex + items.length) % items.length === 0;
            
            return (
              <div
                key={item.id}
                className={`absolute w-80 h-80 cursor-pointer transition-all duration-700 ease-out ${
                  isFlipping && isActive ? 'duration-300' : ''
                }`}
                style={style}
                onClick={() => !isFlipping && setCurrentIndex(index)}
              >
                {/* Cube Container */}
                <div className="relative w-full h-full preserve-3d">
                  {/* Front Face */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                      
                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        {item.title && (
                          <h3 className="text-white text-2xl font-bold mb-1">
                            {item.title}
                          </h3>
                        )}
                        {item.subtitle && (
                          <p className="text-white/80 text-sm uppercase tracking-wider">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute top-4 right-4">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Side Faces for 3D Effect */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent rounded-2xl"
                    style={{ transform: 'rotateY(90deg) translateZ(160px)' }}
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent rounded-2xl"
                    style={{ transform: 'rotateY(-90deg) translateZ(160px)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Item Info */}
      <div className="text-center mb-8 min-h-[60px] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {items[currentIndex].title}
        </h2>
        <p className="text-white/70 text-lg">
          {items[currentIndex].subtitle}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={prevSlide}
          disabled={isFlipping}
          className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
          <RotateCw size={16} className="text-white/70" />
          <span className="text-white/70 text-sm">
            {isFlipping ? 'Flipping...' : `${currentIndex + 1} / ${items.length}`}
          </span>
        </div>
        
        <button
          onClick={nextSlide}
          disabled={isFlipping}
          className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {items.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
              index === currentIndex 
                ? 'w-8 bg-white' 
                : 'w-4 bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => !isFlipping && setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CubeCarousel;