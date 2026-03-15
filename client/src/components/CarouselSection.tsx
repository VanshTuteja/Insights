import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Briefcase, User, MessageSquare, TrendingUp } from 'lucide-react';

const CarouselSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      title: 'AI-Powered Job Matching',
      description: 'Get personalized job recommendations tailored to your skills and preferences.',
      icon: Briefcase,
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      title: 'Smart Resume Builder',
      description: 'Create professional resumes with AI assistance and real-time feedback.',
      icon: User,
      gradient: 'from-green-500 to-teal-600',
    },
    {
      title: 'Interview Preparation',
      description: 'Practice with AI-driven mock interviews and get detailed feedback.',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-600',
    },
    {
      title: 'Career Insights',
      description: 'Access real-time salary data and market trends for informed decisions.',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  React.useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const Icon = slides[currentSlide].icon;

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient}`}
        >
          <div className="flex items-center justify-center h-full text-white p-8">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
              >
                <Icon className="h-8 w-8" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg opacity-90 max-w-md mx-auto"
              >
                {slides[currentSlide].description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Right button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselSection;
