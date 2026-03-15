import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  id: string;
  image: string;
  title?: string;
}

const RoundCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample data with high-quality images matching the aesthetic
  const items: CarouselItem[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&q=80',
      title: 'Desert RV Adventure'
    },
    {
      id: '2', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      title: 'Mountain Sunset'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
      title: 'Forest Trail'
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
      title: 'Botanical Art'
    },
    {
      id: '5',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80',
      title: 'Wilderness Vista'
    },
    {
      id: '6',
      image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop&q=80',
      title: 'Ocean Waves'
    },
    {
      id: '7',
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop&q=80',
      title: 'Misty Mountains'
    },
    {
      id: '8',
      image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop&q=80',
      title: 'Autumn Colors'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  const getItemPosition = (index: number) => {
    const diff = index - currentIndex;
    const totalItems = items.length;
    
    // Normalize position to handle wrapping
    let position = diff;
    if (position > totalItems / 2) position -= totalItems;
    if (position < -totalItems / 2) position += totalItems;
    
    return position;
  };

  const getItemStyle = (index: number) => {
    const position = getItemPosition(index);
    const isCenter = position === 0;
    // const isLeft = position < 0;
    // const isRight = position > 0;
    
    let transform = '';
    let zIndex = 0;
    let opacity = 0.4;
    let scale = 0.7;
    
    if (isCenter) {
      // Center item
      transform = 'translateX(0) translateZ(0) rotateY(0deg)';
      zIndex = 10;
      opacity = 1;
      scale = 1.5;
    } else if (position === -1) {
      // Left adjacent
      transform = 'translateX(-280px) translateZ(-200px) rotateY(35deg)';
      zIndex = 5;
      opacity = 0.7;
      scale = 0.85;
    } else if (position === 1) {
      // Right adjacent
      transform = 'translateX(280px) translateZ(-200px) rotateY(-35deg)';
      zIndex = 5;
      opacity = 0.7;
      scale = 0.85;
    } else if (position < -1) {
      // Far left
      transform = 'translateX(-400px) translateZ(-400px) rotateY(45deg)';
      zIndex = 1;
      opacity = 0.3;
      scale = 0.6;
    } else if (position > 1) {
      // Far right
      transform = 'translateX(400px) translateZ(-400px) rotateY(-45deg)';
      zIndex = 1;
      opacity = 0.3;
      scale = 0.6;
    }
    
    return {
      transform: `${transform} scale(${scale})`,
      zIndex,
      opacity,
    };
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Main Carousel Container */}
      <div className="relative w-full h-[500px] mb-8" style={{ perspective: '1500px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {items.map((item, index) => {
            const style = getItemStyle(index);
            const isMainPhoto = Math.abs((index - currentIndex + items.length) % items.length) < 0.1 || 
                               Math.abs((index - currentIndex + items.length) % items.length) > items.length - 0.1;
            
            return (
              <div
                key={item.id}
                className={`absolute rounded-xl overflow-hidden shadow-2xl transition-all duration-1000 ease-out cursor-pointer ${
                  isMainPhoto 
                    ? 'w-96 h-72 shadow-3xl ring-4 ring-white/20' 
                    : 'w-72 h-56'
                }`}
                style={style}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  isMainPhoto 
                    ? 'from-black/30 to-transparent' 
                    : 'from-black/50 to-transparent'
                }`} />
                {item.title && (
                  <div className={`absolute bottom-4 left-4 text-white font-medium ${
                    isMainPhoto ? 'text-lg' : 'text-sm'
                  }`}>
                    {item.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex items-center gap-3 mb-8">
        {items.map((item, index) => (
          <div
            key={`thumb-${item.id}`}
            className={`w-12 h-8 rounded cursor-pointer transition-all duration-300 overflow-hidden ${
              index === currentIndex 
                ? 'ring-2 ring-white shadow-lg scale-110' 
                : 'opacity-60 hover:opacity-80'
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="flex gap-2 mt-6">
        {items.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default RoundCarousel;