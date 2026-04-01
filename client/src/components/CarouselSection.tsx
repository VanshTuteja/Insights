import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Briefcase, User, MessageSquare, TrendingUp } from 'lucide-react';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import { hexToRgba, mixHex } from '@/lib/themeColorUtils';
import { cn } from '@/lib/utils';

const CarouselSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const theme = useThemeStore((state) => state.theme);
  const themePreview = React.useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);

  const accentStops = React.useMemo(
    () => [
      { start: mixHex(themePreview.primary, '#38bdf8', darkTheme ? 0.2 : 0.35), end: mixHex(themePreview.secondary, '#7c3aed', darkTheme ? 0.35 : 0.6) },
      { start: mixHex(themePreview.primary, '#10b981', darkTheme ? 0.24 : 0.45), end: mixHex(themePreview.secondary, '#14b8a6', darkTheme ? 0.28 : 0.68) },
      { start: mixHex(themePreview.primary, '#f97316', darkTheme ? 0.3 : 0.48), end: mixHex(themePreview.secondary, '#ef4444', darkTheme ? 0.34 : 0.66) },
      { start: mixHex(themePreview.primary, '#8b5cf6', darkTheme ? 0.34 : 0.52), end: mixHex(themePreview.secondary, '#ec4899', darkTheme ? 0.36 : 0.72) },
    ],
    [darkTheme, themePreview.primary, themePreview.secondary],
  );

  const slides = [
    {
      title: 'AI-Powered Job Matching',
      description: 'Get personalized job recommendations tailored to your skills and preferences.',
      icon: Briefcase,
    },
    {
      title: 'Smart Resume Builder',
      description: 'Create professional resumes with AI assistance and real-time feedback.',
      icon: User,
    },
    {
      title: 'Interview Preparation',
      description: 'Practice with AI-driven mock interviews and get detailed feedback.',
      icon: MessageSquare,
    },
    {
      title: 'Career Insights',
      description: 'Access real-time salary data and market trends for informed decisions.',
      icon: TrendingUp,
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
  const currentGradient = accentStops[currentSlide];

  return (
    <div
      className="relative h-96 w-full overflow-hidden rounded-2xl border shadow-2xl"
      style={{
        borderColor: darkTheme ? hexToRgba(themePreview.primary, 0.32) : hexToRgba(themePreview.primary, 0.14),
        boxShadow: darkTheme ? '0 24px 60px rgba(2, 6, 23, 0.42)' : '0 24px 60px rgba(15, 23, 42, 0.12)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${currentGradient.start} 0%, ${currentGradient.end} 100%)`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: darkTheme
                ? 'radial-gradient(circle at top, rgba(255,255,255,0.14), transparent 52%)'
                : 'radial-gradient(circle at top, rgba(255,255,255,0.36), transparent 54%)',
            }}
          />
          <div className="flex h-full items-center justify-center p-8 text-white">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: darkTheme ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.2)',
                  borderColor: darkTheme ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.28)',
                }}
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
                  className="border text-white"
                  style={{
                    backgroundColor: darkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.18)',
                    borderColor: darkTheme ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.28)',
                  }}
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
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 rounded-full border text-white transition-colors',
          darkTheme ? 'hover:bg-white/15' : 'hover:bg-white/25',
        )}
        style={{
          backgroundColor: darkTheme ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.14)',
          borderColor: darkTheme ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.24)',
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Right button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 rounded-full border text-white transition-colors',
          darkTheme ? 'hover:bg-white/15' : 'hover:bg-white/25',
        )}
        style={{
          backgroundColor: darkTheme ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.14)',
          borderColor: darkTheme ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.24)',
        }}
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
              currentSlide === index ? 'bg-white scale-110' : 'bg-white/55'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselSection;
