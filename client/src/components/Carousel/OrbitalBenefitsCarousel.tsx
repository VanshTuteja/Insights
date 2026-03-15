import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Users, Zap, Shield, TrendingUp } from 'lucide-react';

interface Benefit {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
}

const OrbitalBenefitsCarousel: React.FC = () => {
  const [rotation, setRotation] = useState(0);

  const benefits: Benefit[] = [
    {
      id: 1,
      title: "AI-Powered Matching",
      description: "Advanced algorithms match you with perfect job opportunities based on your skills and preferences.",
      icon: Brain,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      title: "Smart Job Targeting",
      description: "Target the right positions with precision using our intelligent job recommendation system.",
      icon: Target,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      id: 3,
      title: "Network Building",
      description: "Connect with industry professionals and expand your professional network effortlessly.",
      icon: Users,
      gradient: "from-green-500 to-blue-600"
    },
    {
      id: 4,
      title: "Lightning Fast",
      description: "Get instant results and apply to jobs faster than ever with our streamlined platform.",
      icon: Zap,
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      id: 5,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and complete privacy controls.",
      icon: Shield,
      gradient: "from-red-500 to-pink-600"
    },
    {
      id: 6,
      title: "Career Growth",
      description: "Track your progress and accelerate your career growth with personalized insights.",
      icon: TrendingUp,
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.3);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getCardStyle = (index: number): React.CSSProperties => {
    const angle = (360 / benefits.length) * index + rotation;
    const radius = 280;
    const radian = (angle * Math.PI) / 180;
    
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;
    
    // Calculate scale based on Y position (closer to front = larger)
    const scale = 0.8 + (y + radius) / (radius * 4);
    const clampedScale = Math.max(0.6, Math.min(1.1, scale));
    
    // Calculate opacity based on position
    const opacity = 0.7 + (y + radius) / (radius * 2) * 0.3;
    const clampedOpacity = Math.max(0.5, Math.min(1, opacity));
    
    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(${x - 120}px, ${y - 80}px) scale(${clampedScale})`,
      opacity: clampedOpacity,
      zIndex: Math.floor(y + 100),
      transition: 'none'
    };
  };

  return (
    <section className="py-20 bg-gradient-to-br from-accent/5 to-secondary/5 overflow-hidden">
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

        {/* Orbital Carousel Container */}
        <div className="relative h-[600px] w-full flex items-center justify-center">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={benefit.id}
                style={getCardStyle(index)}
                className="w-60 h-40 bg-background rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="p-6 h-full flex flex-col items-center text-center space-y-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${benefit.gradient} opacity-0 hover:opacity-5 transition-opacity duration-300`}></div>
              </motion.div>
            );
          })}

          {/* Central focal point */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Experience JobFinder AI
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default OrbitalBenefitsCarousel;