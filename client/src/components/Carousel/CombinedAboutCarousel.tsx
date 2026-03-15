import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Bot, CheckCircle, Download, UserPlus, Target, Zap, Star,
  Brain, Clock, Shield, Users, Rocket, Award, TrendingUp, Heart
} from 'lucide-react';

const CombinedAboutCarousel = () => {
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

  // Create extended arrays for seamless looping
  const extendedSteps = [...howItWorks, ...howItWorks, ...howItWorks];
  const extendedBenefits = [...benefits, ...benefits, ...benefits];

  return (
    <div className="py-20 bg-gradient-to-br from-accent/5 to-secondary/5">
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
            <div className="overflow-hidden">
              {/* Gradient overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

              <motion.div
                className="flex gap-6 w-max pl-8"
                animate={{
                  x: [0, -2400],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 40,
                    ease: "linear",
                  },
                }}
              >
                {extendedSteps.map((step, index) => (
                  <motion.div
                    key={`step-${index}`}
                    className="flex-shrink-0 w-72 h-36 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                    }}
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      y: {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 4 + (index % 3),
                        delay: index * 0.1,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                        >
                          {step.step}
                        </motion.div>
                        <div className="absolute -top-1 -right-1">
                          <step.icon className="h-5 w-5 text-primary bg-white rounded-full p-0.5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
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
            <div className="overflow-hidden">
              {/* Gradient overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

              <motion.div
                className="flex gap-6 w-max pr-8"
                animate={{
                  x: [-2400, 0],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 35,
                    ease: "linear",
                  },
                }}
              >
                {extendedBenefits.map((benefit, index) => (
                  <motion.div
                    key={`benefit-${index}`}
                    className="flex-shrink-0 w-72 h-36 bg-gradient-to-br from-accent/10 to-muted/20 backdrop-blur-sm border border-accent/20 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                    }}
                    animate={{
                      y: [0, 6, 0],
                    }}
                    transition={{
                      y: {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 3.5 + (index % 4),
                        delay: index * 0.15,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center">
                        <benefit.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold mb-2 group-hover:text-secondary transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
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
          className="bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
        >
          Get Started Today
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CombinedAboutCarousel;