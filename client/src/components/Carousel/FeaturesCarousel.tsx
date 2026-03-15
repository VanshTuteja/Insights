import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, Users, TrendingUp, Shield, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
}

const FeaturesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Features data with 6 cards
  const features: CarouselItem[] = [
    {
      id: '1',
      title: 'Smart Job Matching',
      description: 'AI-powered algorithm matches you with the perfect job opportunities based on your skills and preferences.',
      icon: Briefcase,
      gradient: 'from-primary to-secondary'
    },
    {
      id: '2',
      title: 'Professional Network',
      description: 'Connect with industry professionals, mentors, and potential collaborators in your field.',
      icon: Users,
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: '3',
      title: 'Career Analytics',
      description: 'Track your career progress with detailed analytics and insights to guide your professional growth.',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: '4',
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security and privacy measures.',
      icon: Shield,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: '5',
      title: 'Premium Support',
      description: '24/7 premium support to help you navigate your career journey with expert guidance.',
      icon: Star,
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      id: '6',
      title: 'Lightning Fast',
      description: 'Optimized performance ensures you can access opportunities the moment they become available.',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
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
                  className={`absolute bg-card border border-border rounded-2xl shadow-lg transition-all duration-1000 ease-out cursor-pointer ${
                    isMainCard 
                      ? 'w-96 h-80 shadow-xl ring-4 ring-primary/20' 
                      : 'w-80 h-72'
                  }`}
                  style={style}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="p-8 text-center space-y-6 h-full flex flex-col justify-center">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className={`font-bold text-card-foreground ${
                      isMainCard ? 'text-2xl' : 'text-xl'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-muted-foreground leading-relaxed ${
                      isMainCard ? 'text-base' : 'text-sm'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/10 rounded-2xl" />
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