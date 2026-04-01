import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Users, TrendingUp, Shield, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import { hexToRgba, mixHex } from '@/lib/themeColorUtils';
import { cn } from '@/lib/utils';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  accent: string;
}

const FeaturesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);

  // Features data with 6 cards
  const features: CarouselItem[] = [
    {
      id: '1',
      title: 'Smart Job Matching',
      description: 'AI-powered algorithm matches you with the perfect job opportunities based on your skills and preferences.',
      icon: Briefcase,
      accent: '#38bdf8',
    },
    {
      id: '2',
      title: 'Professional Network',
      description: 'Connect with industry professionals, mentors, and potential collaborators in your field.',
      icon: Users,
      accent: '#10b981',
    },
    {
      id: '3',
      title: 'Career Analytics',
      description: 'Track your career progress with detailed analytics and insights to guide your professional growth.',
      icon: TrendingUp,
      accent: '#f97316',
    },
    {
      id: '4',
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security and privacy measures.',
      icon: Shield,
      accent: '#06b6d4',
    },
    {
      id: '5',
      title: 'Premium Support',
      description: '24/7 premium support to help you navigate your career journey with expert guidance.',
      icon: Star,
      accent: '#f59e0b',
    },
    {
      id: '6',
      title: 'Lightning Fast',
      description: 'Optimized performance ensures you can access opportunities the moment they become available.',
      icon: Zap,
      accent: '#8b5cf6',
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  const getItemPosition = (index: number) => {
    const diff = index - currentIndex;
    const totalItems = features.length;
    
    let position = diff;
    if (position > totalItems / 2) position -= totalItems;
    if (position < -totalItems / 2) position += totalItems;
    
    return position;
  };

  const getItemStyle = (index: number) => {
    const position = getItemPosition(index);
    const isCenter = position === 0;
    
    let transform = '';
    let zIndex = 0;
    let opacity = 0.4;
    let scale = 0.7;
    
    if (isCenter) {
      transform = 'translateX(0) translateZ(0) rotateY(0deg)';
      zIndex = 10;
      opacity = 1;
      scale = 1.2;
    } else if (position === -1) {
      transform = 'translateX(-320px) translateZ(-200px) rotateY(25deg)';
      zIndex = 5;
      opacity = 0.7;
      scale = 0.9;
    } else if (position === 1) {
      transform = 'translateX(320px) translateZ(-200px) rotateY(-25deg)';
      zIndex = 5;
      opacity = 0.7;
      scale = 0.9;
    } else if (position < -1) {
      transform = 'translateX(-480px) translateZ(-400px) rotateY(35deg)';
      zIndex = 1;
      opacity = 0.3;
      scale = 0.7;
    } else if (position > 1) {
      transform = 'translateX(480px) translateZ(-400px) rotateY(-35deg)';
      zIndex = 1;
      opacity = 0.3;
      scale = 0.7;
    }
    
    return {
      transform: `${transform} scale(${scale})`,
      zIndex,
      opacity,
    };
  };

  const featureSurface = (accent: string, active: boolean) => ({
    background: darkTheme
      ? `linear-gradient(160deg, ${hexToRgba(mixHex(themePreview.primary, accent, 0.18), active ? 0.28 : 0.18)} 0%, ${hexToRgba(themePreview.secondary, active ? 0.82 : 0.72)} 100%)`
      : `linear-gradient(160deg, ${hexToRgba(mixHex(themePreview.primary, accent, 0.32), active ? 0.18 : 0.12)} 0%, ${hexToRgba('#ffffff', active ? 0.96 : 0.92)} 100%)`,
    borderColor: darkTheme
      ? hexToRgba(mixHex(themePreview.primary, accent, 0.32), active ? 0.42 : 0.24)
      : hexToRgba(mixHex(themePreview.primary, accent, 0.36), active ? 0.28 : 0.16),
    boxShadow: active
      ? darkTheme
        ? '0 26px 60px rgba(2, 6, 23, 0.48)'
        : '0 22px 48px rgba(15, 23, 42, 0.15)'
      : darkTheme
        ? '0 14px 32px rgba(2, 6, 23, 0.28)'
        : '0 12px 24px rgba(15, 23, 42, 0.08)',
  });

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Powerful Features for Your{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Career Success
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to accelerate your job search and advance your career
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-[500px] mb-8"
          style={{ perspective: '1500px' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {features.map((feature, index) => {
              const style = getItemStyle(index);
              const isMainCard = Math.abs((index - currentIndex + features.length) % features.length) < 0.1 || 
                                Math.abs((index - currentIndex + features.length) % features.length) > features.length - 0.1;
              
              return (
                <div
                  key={feature.id}
                  className={cn(`absolute rounded-2xl border transition-all duration-1000 ease-out cursor-pointer backdrop-blur-xl ${
                    isMainCard 
                      ? 'w-96 h-80 ring-4 ring-primary/15' 
                      : 'w-80 h-72'
                  }`, darkTheme ? 'text-white' : 'text-foreground')}
                  style={style}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={featureSurface(feature.accent, isMainCard)}
                  />
                  <div className="relative flex h-full flex-col justify-center space-y-6 p-8 text-center">
                    <div
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${mixHex(themePreview.primary, feature.accent, darkTheme ? 0.2 : 0.42)} 0%, ${mixHex(themePreview.secondary, feature.accent, darkTheme ? 0.4 : 0.72)} 100%)`,
                        borderColor: darkTheme ? 'rgba(255,255,255,0.1)' : hexToRgba(themePreview.primary, 0.16),
                      }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className={`font-bold ${
                      isMainCard ? 'text-2xl' : 'text-xl'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={cn(`leading-relaxed ${
                      isMainCard ? 'text-base' : 'text-sm'
                    }`, darkTheme ? 'text-white/78' : 'text-foreground/70')}>
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Subtle gradient overlay */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: darkTheme
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent 38%, rgba(15,23,42,0.1) 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.38), transparent 36%, rgba(148,163,184,0.1) 100%)',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>


      </div>
    </section>
  );
};

export default FeaturesCarousel;
