import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Bot, CheckCircle, Download, UserPlus, Target, Zap, Star,
  Brain, Clock, Shield, Users, Rocket, Award, TrendingUp, Heart
} from 'lucide-react';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import { hexToRgba, mixHex } from '@/lib/themeColorUtils';
import { cn } from '@/lib/utils';

const CombinedAboutCarousel = () => {
  const theme = useThemeStore((state) => state.theme);
  const themePreview = React.useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);

  const howItWorks = [
    {
      step: "1",
      title: "Upload Resume",
      description: "Upload your existing resume or create one from scratch",
      icon: Upload
    },
    {
      step: "2",
      title: "AI Analysis",
      description: "Our AI analyzes your profile and job requirements",
      icon: Bot
    },
    {
      step: "3",
      title: "Optimization",
      description: "Get personalized suggestions to improve your resume",
      icon: CheckCircle
    },
    {
      step: "4",
      title: "Download",
      description: "Download your optimized resume ready for applications",
      icon: Download
    },
    {
      step: "5",
      title: "Create Profile",
      description: "Set up your professional profile with key details",
      icon: UserPlus
    },
    {
      step: "6",
      title: "Target Jobs",
      description: "Identify and target your ideal job positions",
      icon: Target
    },
    {
      step: "7",
      title: "Quick Apply",
      description: "Apply to multiple jobs with a single click",
      icon: Zap
    },
    {
      step: "8",
      title: "Get Results",
      description: "Land interviews and get your dream job faster",
      icon: Star
    }
  ];

  const benefits = [
    {
      title: "AI-Powered Matching",
      description: "Advanced algorithms match you with perfect job opportunities",
      icon: Brain
    },
    {
      title: "Lightning Fast",
      description: "Apply to hundreds of jobs in minutes, not hours",
      icon: Clock
    },
    {
      title: "100% Secure",
      description: "Your data is encrypted and completely secure with us",
      icon: Shield
    },
    {
      title: "Expert Support",
      description: "Get help from career experts whenever you need it",
      icon: Users
    },
    {
      title: "Career Growth",
      description: "Track your progress and accelerate your career growth",
      icon: Rocket
    },
    {
      title: "Industry Leading",
      description: "Join thousands of successful job seekers worldwide",
      icon: Award
    },
    {
      title: "Higher Success Rate",
      description: "5x higher interview rate compared to traditional methods",
      icon: TrendingUp
    },
    {
      title: "Loved by Users",
      description: "98% user satisfaction rate with our platform",
      icon: Heart
    }
  ];

  const stepsLoop = [...howItWorks, ...howItWorks];
  const benefitsLoop = [...benefits, ...benefits];
  const primaryGlow = mixHex(themePreview.primary, '#ffffff', darkTheme ? 0.05 : 0.18);
  const secondaryGlow = mixHex(themePreview.secondary, '#38bdf8', darkTheme ? 0.16 : 0.3);

  return (
    <div
      className="py-20"
      style={{
        background: darkTheme
          ? `linear-gradient(180deg, ${hexToRgba(themePreview.secondary, 0.18)} 0%, ${hexToRgba('#020617', 0.96)} 100%)`
          : `linear-gradient(180deg, ${hexToRgba(themePreview.primary, 0.04)} 0%, ${hexToRgba(themePreview.secondary, 0.12)} 100%)`,
      }}
    >
      <style>
        {`
          .about-marquee {
            overflow: hidden;
          }

          .about-marquee-track {
            display: flex;
            width: max-content;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          .about-marquee-left {
            animation: about-marquee-left 34s linear infinite;
          }

          .about-marquee-right {
            animation: about-marquee-right 30s linear infinite;
          }

          .about-marquee-card {
            transform: translate3d(0, 0, 0);
            will-change: transform;
          }

          @keyframes about-marquee-left {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }

          @keyframes about-marquee-right {
            from { transform: translate3d(-50%, 0, 0); }
            to { transform: translate3d(0, 0, 0); }
          }
        `}
      </style>
      {/* How It Works Section */}
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              How It{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and land your dream job faster than ever
            </p>
          </motion.div>

          {/* How It Works Carousel - Moving Left to Right */}
          <div className="relative -mx-4 md:-mx-6 lg:-mx-8 xl:-mx-12 2xl:-mx-24">
            <div className="about-marquee">
              {/* Gradient overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

              <div className="about-marquee-track about-marquee-left gap-6 pl-8 pr-8">
                {stepsLoop.map((step, index) => (
                  <div
                    key={`step-${index}`}
                    className={cn(
                      'about-marquee-card group h-36 w-72 flex-shrink-0 rounded-xl border p-5 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl',
                      darkTheme ? 'text-white' : 'text-foreground',
                    )}
                    style={{
                      background: darkTheme
                        ? `linear-gradient(145deg, ${hexToRgba(primaryGlow, 0.18)} 0%, ${hexToRgba(themePreview.secondary, 0.82)} 100%)`
                        : `linear-gradient(145deg, ${hexToRgba(themePreview.primary, 0.12)} 0%, ${hexToRgba('#ffffff', 0.94)} 100%)`,
                      borderColor: darkTheme ? hexToRgba(themePreview.primary, 0.24) : hexToRgba(themePreview.primary, 0.16),
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${themePreview.primary} 0%, ${mixHex(themePreview.secondary, '#ffffff', darkTheme ? 0.12 : 0.6)} 100%)`,
                          }}
                        >
                          {step.step}
                        </motion.div>
                        <div className="absolute -top-1 -right-1">
                          <step.icon
                            className="rounded-full p-0.5"
                            style={{
                              height: 20,
                              width: 20,
                              color: themePreview.primary,
                              backgroundColor: darkTheme ? hexToRgba('#ffffff', 0.92) : '#ffffff',
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-base font-semibold transition-colors group-hover:text-primary">
                          {step.title}
                        </h3>
                        <p className={cn('text-sm leading-relaxed', darkTheme ? 'text-white/72' : 'text-muted-foreground')}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                JobFinder AI?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of job searching with our cutting-edge platform
            </p>
          </motion.div>

          {/* Benefits Carousel - Moving Right to Left */}
          <div className="relative -mx-4 md:-mx-6 lg:-mx-8 xl:-mx-12 2xl:-mx-24">
            <div className="about-marquee">
              {/* Gradient overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

              <div className="about-marquee-track about-marquee-right gap-6 pl-8 pr-8">
                {benefitsLoop.map((benefit, index) => (
                  <div
                    key={`benefit-${index}`}
                    className={cn(
                      'about-marquee-card group h-36 w-72 flex-shrink-0 rounded-xl border p-5 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl',
                      darkTheme ? 'text-white' : 'text-foreground',
                    )}
                    style={{
                      background: darkTheme
                        ? `linear-gradient(145deg, ${hexToRgba(secondaryGlow, 0.16)} 0%, ${hexToRgba(themePreview.secondary, 0.76)} 100%)`
                        : `linear-gradient(145deg, ${hexToRgba(mixHex(themePreview.primary, themePreview.secondary, 0.5), 0.1)} 0%, ${hexToRgba('#ffffff', 0.96)} 100%)`,
                      borderColor: darkTheme ? hexToRgba(themePreview.primary, 0.2) : hexToRgba(themePreview.primary, 0.14),
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${hexToRgba(themePreview.primary, darkTheme ? 0.26 : 0.14)} 0%, ${hexToRgba(themePreview.secondary, darkTheme ? 0.42 : 0.28)} 100%)`,
                        }}
                      >
                        <benefit.icon className="h-7 w-7" style={{ color: themePreview.primary }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-base font-semibold transition-colors group-hover:text-primary">
                          {benefit.title}
                        </h3>
                        <p className={cn('text-sm leading-relaxed', darkTheme ? 'text-white/72' : 'text-muted-foreground')}>
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center mt-16"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${themePreview.primary} 0%, ${mixHex(themePreview.secondary, '#ffffff', darkTheme ? 0.1 : 0.55)} 100%)`,
          }}
        >
          Get Started Today
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CombinedAboutCarousel;
