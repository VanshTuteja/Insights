import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import { hexToRgba, mixHex } from '@/lib/themeColorUtils';
import { cn } from '@/lib/utils';

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

function createAvatarDataUri(name: string, backgroundColor: string) {
  const initials = name
    .split(' ')
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="${backgroundColor}" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);


 const testimonials: TestimonialItem[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    role: 'Software Engineer',
    company: 'Infosys',
    content: 'This platform made my job search so much easier. The AI recommendations were surprisingly accurate and saved me a lot of time.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    name: 'Priya Verma',
    role: 'Product Manager',
    company: 'Zomato',
    content: 'Loved the resume builder! It gave real-time suggestions that actually improved my chances of getting shortlisted.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '3',
    name: 'Rohit Gupta',
    role: 'Frontend Developer',
    company: 'TCS',
    content: 'The mock interview feature is amazing. It helped me gain confidence before my actual interviews.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg'
  },
  {
    id: '4',
    name: 'Sneha Iyer',
    role: 'UI/UX Designer',
    company: 'Freshworks',
    content: 'Clean UI and very easy to use. I especially liked the career insights—it helped me understand salary trends better.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: '5',
    name: 'Karan Mehta',
    role: 'Data Analyst',
    company: 'Wipro',
    content: 'One of the best platforms for freshers and professionals. It really helped me land better opportunities.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
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
    <section className="py-20 transition-all duration-1000">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Loved by{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Professionals
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users say about their experience
          </p>
        </div>


        {/* Main Testimonial Carousel */}
        <div
          className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-3xl border transition-all duration-1000"
          style={{
            background: darkTheme
              ? `linear-gradient(160deg, ${hexToRgba(mixHex(themePreview.primary, '#0f172a', 0.55), 0.82)} 0%, ${hexToRgba(themePreview.secondary, 0.98)} 100%)`
              : `linear-gradient(160deg, ${hexToRgba(mixHex(themePreview.primary, '#ffffff', 0.18), 0.18)} 0%, ${hexToRgba(mixHex(themePreview.secondary, '#ffffff', 0.72), 0.96)} 100%)`,
            borderColor: darkTheme ? hexToRgba(themePreview.primary, 0.2) : hexToRgba(themePreview.primary, 0.12),
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: darkTheme
                ? 'radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 50%)'
                : 'radial-gradient(circle at top, rgba(255,255,255,0.55), transparent 52%)',
            }}
          />
          {/* Title */}
          <div className="relative mb-8 text-center">
            <h3 className={cn('mb-2 text-3xl font-bold', darkTheme ? 'text-white' : 'text-foreground')}>Customer Stories</h3>
            <p className={cn(darkTheme ? 'text-white/72' : 'text-foreground/70')}>Interactive testimonial showcase</p>
          </div>

          {/* 3D Testimonial Carousel */}
          <div className="relative mb-8 h-96 w-full" style={{ perspective: '1000px' }}>
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
                      <div
                        className="absolute inset-0 rounded-2xl border shadow-2xl backdrop-blur-sm"
                        style={{
                          background: darkTheme
                            ? `linear-gradient(180deg, ${hexToRgba(themePreview.primary, 0.16)} 0%, ${hexToRgba('#020617', 0.78)} 100%)`
                            : `linear-gradient(180deg, ${hexToRgba(themePreview.primary, 0.12)} 0%, rgba(255,255,255,0.96) 100%)`,
                          borderColor: darkTheme ? hexToRgba(themePreview.primary, 0.24) : hexToRgba(themePreview.primary, 0.14),
                        }}
                      >
                        <div className="relative w-full h-full rounded-2xl overflow-hidden p-6 flex flex-col">
                           {/* Author Info */}
                          <div className="flex items-center space-x-3 mt-auto">
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="h-12 w-12 rounded-full border-2"
                              style={{ borderColor: darkTheme ? 'rgba(255,255,255,0.2)' : hexToRgba(themePreview.primary, 0.16) }}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = createAvatarDataUri(
                                  testimonial.name,
                                  themePreview.primary
                                );
                              }}
                            />
                            <div>
                              <p className={cn('font-semibold', darkTheme ? 'text-white' : 'text-foreground')}>
                                {testimonial.name}
                              </p>
                              <p className={cn('text-sm', darkTheme ? 'text-white/70' : 'text-foreground/65')}>
                                {testimonial.role} at {testimonial.company}
                              </p>
                            </div>
                          </div>
                          
                          {/* Active Indicator */}
                          {isActive && (
                            <div className="absolute top-4 right-4">
                              <div
                                className="h-3 w-3 animate-pulse rounded-full shadow-lg"
                                style={{ backgroundColor: themePreview.primary }}
                              />
                            </div>
                          )}

                          {/* Rating */}
                          <div className="flex space-x-1 mb-4 mt-12">
                            {renderStars(testimonial.rating)}
                          </div>

                          {/* Testimonial Content */}
                          <div className="flex-1 flex flex-col justify-center">
                            <p className={cn('mb-6 text-lg leading-relaxed italic', darkTheme ? 'text-white/84' : 'text-foreground/80')}>
                              "{testimonial.content}"
                            </p>
                          </div>

                         
                        </div>
                      </div>
                      
                      {/* Side Faces for 3D Effect */}
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: `linear-gradient(to right, ${hexToRgba('#020617', darkTheme ? 0.35 : 0.18)} 0%, transparent 100%)`,
                          transform: 'rotateY(90deg) translateZ(160px)',
                        }}
                      />
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: `linear-gradient(to left, ${hexToRgba('#020617', darkTheme ? 0.35 : 0.18)} 0%, transparent 100%)`, transform: 'rotateY(-90deg) translateZ(160px)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Testimonial Info */}
          <div className="text-center mb-8 min-h-[80px] flex flex-col justify-center max-w-2xl px-4">
            <h4 className={cn('mb-2 text-2xl font-bold', darkTheme ? 'text-white' : 'text-foreground')}>
              {testimonials[currentIndex].name}
            </h4>
            <p className={cn('text-lg', darkTheme ? 'text-white/72' : 'text-foreground/70')}>
              {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
            </p>
          </div>

          <div className="relative z-10 mb-8 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="rounded-full border"
              style={{
                backgroundColor: darkTheme ? hexToRgba('#ffffff', 0.08) : hexToRgba('#ffffff', 0.72),
                borderColor: darkTheme ? hexToRgba(themePreview.primary, 0.18) : hexToRgba(themePreview.primary, 0.16),
              }}
            >
              <ChevronLeft className={cn('h-5 w-5', darkTheme ? 'text-white' : 'text-foreground')} />
            </Button>
            <div className="flex items-center gap-2">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: currentIndex === index ? 28 : 10,
                    backgroundColor: currentIndex === index
                      ? themePreview.primary
                      : darkTheme
                        ? 'rgba(255,255,255,0.28)'
                        : hexToRgba(themePreview.primary, 0.28),
                  }}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="rounded-full border"
              style={{
                backgroundColor: darkTheme ? hexToRgba('#ffffff', 0.08) : hexToRgba('#ffffff', 0.72),
                borderColor: darkTheme ? hexToRgba(themePreview.primary, 0.18) : hexToRgba(themePreview.primary, 0.16),
              }}
            >
              <ChevronRight className={cn('h-5 w-5', darkTheme ? 'text-white' : 'text-foreground')} />
            </Button>
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
