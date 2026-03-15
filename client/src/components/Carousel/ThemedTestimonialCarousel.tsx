import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Star, Quote } from 'lucide-react';

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}



const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);



  const testimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Senior Developer',
      company: 'TechCorp',
      content: 'This platform has revolutionized our workflow. The interface is intuitive and the features are exactly what we needed.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b000?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: 'Product Manager',
      company: 'InnovateLab',
      content: 'Outstanding experience! The team support is exceptional and the results speak for themselves. Highly recommended.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Emily Thompson',
      role: 'Design Lead',
      company: 'CreativeStudio',
      content: 'The attention to detail and user experience is phenomenal. It has streamlined our design process significantly.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'CTO',
      company: 'StartupXYZ',
      content: 'A game-changer for our startup. The scalability and performance exceeded our expectations from day one.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '5',
      name: 'Lisa Johnson',
      role: 'Marketing Director',
      company: 'GrowthCo',
      content: 'Incredible ROI and user engagement. Our metrics have improved across the board since implementation.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    }
  ];


  const nextSlide = () => {
    if (!isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsFlipping(false);
      }, 300);
    }
  };

  const prevSlide = () => {
    if (!isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsFlipping(false);
      }, 300);
    }
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle through themes


  const getCubeStyle = (index: number) => {
    const position = (index - currentIndex + testimonials.length) % testimonials.length;
    const totalItems = testimonials.length;
    const angle = (360 / totalItems) * position;
    const radius = 280;
    
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius;
    
    let scale = 0.6;
    let opacity = 0.4;
    
    if (position === 0) {
      scale = 1.25;
      opacity = 1;
    } else if (position === 1 || position === totalItems - 1) {
      scale = 0.75;
      opacity = 0.6;
    }
    
    return {
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${-angle}deg) scale(${scale}) ${
        isFlipping && position === 0 ? 'rotateX(360deg)' : ''
      }`,
      opacity,
      zIndex: position === 0 ? 10 : Math.round(z + 100),
    };
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <section className={`py-20  transition-all duration-1000`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold`}>
            Loved by{' '}
            <span className={`bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}>
              Professionals
            </span>
          </h2>
          <p className={`text-lg`}>
            See what our users say about their experience
          </p>
        </div>


        {/* Main Testimonial Carousel */}
        <div className={`w-full h-screen flex flex-col items-center justify-center overflow-hidden relative rounded-3xl transition-all duration-1000`}>
          {/* Title */}
          <div className="mb-8 text-center">
            <h3 className={`text-3xl font-bold mb-2`}>Customer Stories</h3>
            <p>Interactive testimonial showcase</p>
          </div>

          {/* 3D Testimonial Carousel */}
          <div className="relative w-full h-96 mb-8" style={{ perspective: '1000px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {testimonials.map((testimonial, index) => {
                const style = getCubeStyle(index);
                const isActive = (index - currentIndex + testimonials.length) % testimonials.length === 0;
                
                return (
                  <div
                    key={testimonial.id}
                    className={`absolute w-80 h-80 cursor-pointer transition-all duration-700 ease-out ${
                      isFlipping && isActive ? 'duration-300' : ''
                    }`}
                    style={style}
                    onClick={() => !isFlipping && setCurrentIndex(index)}
                  >
                    {/* Testimonial Card */}
                    <div className="relative w-full h-full preserve-3d">
                      {/* Front Face */}
                      <div className={`absolute inset-0 backdrop-blur-sm rounded-2xl border  shadow-2xl`}>
                        <div className="relative w-full h-full rounded-2xl overflow-hidden p-6 flex flex-col">
                           {/* Author Info */}
                          <div className="flex items-center space-x-3 mt-auto">
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full border-2 border-white/20"
                            />
                            <div>
                              <p className={`font-semibold `}>
                                {testimonial.name}
                              </p>
                              <p className={`text-sm `}>
                                {testimonial.role} at {testimonial.company}
                              </p>
                            </div>
                          </div>
                          
                          {/* Active Indicator */}
                          {isActive && (
                            <div className="absolute top-4 right-4">
                              <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg`} />
                            </div>
                          )}

                          {/* Rating */}
                          <div className="flex space-x-1 mb-4 mt-12">
                            {renderStars(testimonial.rating)}
                          </div>

                          {/* Testimonial Content */}
                          <div className="flex-1 flex flex-col justify-center">
                            <p className={`text-lg mb-6 leading-relaxed italic`}>
                              "{testimonial.content}"
                            </p>
                          </div>

                         
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

          {/* Current Testimonial Info */}
          <div className="text-center mb-8 min-h-[80px] flex flex-col justify-center max-w-2xl px-4">
            <h4 className={`text-2xl font-bold  mb-2`}>
              {testimonials[currentIndex].name}
            </h4>
            <p className={` text-lg`}>
              {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
            </p>
          </div>

        

        

          {/* Current Theme Indicator */}
          {/* <div className="absolute bottom-4 left-4">
            <span className={`text-xs ${theme.secondaryText} px-2 py-1 rounded-full ${theme.buttonBg} backdrop-blur-sm`}>
              {theme.name}
            </span>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;