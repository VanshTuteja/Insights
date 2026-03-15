import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/Auth/AuthDialog';
import LandingNavbar from '@/components/Layout/LandingNavbar';
import {
  Briefcase,
  Users,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Award,
  Target
} from 'lucide-react';
import FeaturesCarousel from './Carousel/FeaturesCarousel';
import CompaniesSection from './Carousel/CompaniesSection';
import TestimonialCarousel from './Carousel/ThemedTestimonialCarousel';
import CombinedAboutCarousel from './Carousel/CombinedAboutCarousel';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const features = [
    {
      icon: Briefcase,
      title: 'AI Job Matching',
      description: 'Get personalized job recommendations based on your skills and preferences',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      icon: Users,
      title: 'Smart Resume Builder',
      description: 'Create professional resumes with AI assistance and real-time feedback',
      gradient: 'from-green-500 to-teal-600',
    },
    {
      icon: MessageSquare,
      title: 'Interview Preparation',
      description: 'Practice with AI-driven mock interviews and detailed performance analysis',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: TrendingUp,
      title: 'Career Insights',
      description: 'Access real-time salary data and market trends for informed decisions',
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get job matches in seconds with our AI algorithms',
    },
    {
      icon: Globe,
      title: 'Global Opportunities',
      description: 'Access jobs from companies worldwide',
    },
    {
      icon: Award,
      title: 'Verified Companies',
      description: 'All employers are verified for authenticity',
    },
  ];

  const stats = [
    { number: '50K+', label: 'Active Jobs' },
    { number: '25K+', label: 'Happy Users' },
    { number: '500+', label: 'Partner Companies' },
    { number: '95%', label: 'Success Rate' },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Your Profile',
      description: 'Build a comprehensive profile with our AI-powered resume builder',
      icon: Users,
    },
    {
      step: '2',
      title: 'Get Matched',
      description: 'Our AI analyzes your skills and preferences to find perfect job matches',
      icon: Target,
    },
    {
      step: '3',
      title: 'Prepare & Apply',
      description: 'Use our interview prep tools and apply with confidence',
      icon: MessageSquare,
    },
    {
      step: '4',
      title: 'Land Your Dream Job',
      description: 'Get hired faster with our comprehensive career support',
      icon: Award,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'TechCorp',
      content: 'JobFinder AI helped me land my dream job in just 2 weeks!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'Mike Chen',
      role: 'Product Manager',
      company: 'StartupLabs',
      content: 'The interview preparation feature was a game-changer for me.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'Emily Davis',
      role: 'UX Designer',
      company: 'DesignStudio',
      content: 'Amazing platform with incredible AI-powered insights.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar onAuthOpen={() => setAuthDialogOpen(true)} />

      {/* Hero Section */}
<section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />

      <div className="relative container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Main circular container with neon glow */}
          <div className="flex justify-center relative">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary)), 0 0 60px hsl(var(--primary))",
                  "0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary)), 0 0 90px hsl(var(--primary))",
                  "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary)), 0 0 60px hsl(var(--primary))",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 border-2 border-primary rounded-full flex items-center justify-center bg-background/80 backdrop-blur-sm relative mx-auto"
            >
              {/* Smooth infinite rotating icon */}
              <motion.div
                // animate={{ rotate: [0,360] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                  duration: 4, // seconds per full spin
                }}
                style={{ display: "inline-block" }}
              >
                <Briefcase className="h-12 w-12 text-primary" />
  
              </motion.div>
            </motion.div>
          </div>

          {/* Title + subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              Find Your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Dream Job
              </span>{" "}
              with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionize your job search with AI-powered recommendations, smart resume building,
              and personalized career insights that help you land your perfect role.
            </p>
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-lg px-8 py-6"
              onClick={() => setAuthDialogOpen(true)}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex items-center justify-center space-x-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>AI-powered</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
      {/* Features Section */}
      <FeaturesCarousel />

      {/* Stats Section */}
      <CompaniesSection />

      {/* How It Works */}
      {/* <section className="py-20">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="text-center space-y-4"
              >
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl"
                  >
                    {step.step}
                  </motion.div>
                  <div className="absolute -top-2 -right-2">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
      <CombinedAboutCarousel />

      {/* Benefits Section */}
      {/* <section className="py-20 bg-gradient-to-br from-accent/5 to-secondary/5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="text-center space-y-4 p-6 bg-background rounded-xl shadow-lg border"
              >
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
      {/* <OrbitalCarousel/> */}

      {/* Testimonials Section */}
      <TestimonialCarousel />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Career Journey?
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals who have already found their dream jobs with our AI-powered platform
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-lg px-12 py-6"
                onClick={() => setAuthDialogOpen(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Journey Today
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <Footer/>
    </div>
  );
};

export default LandingPage;