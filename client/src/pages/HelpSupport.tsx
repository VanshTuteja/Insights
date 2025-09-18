import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedSection from '@/components/AnimatedSection';
import { toast } from '@/hooks/use-toast';
import { 
  MessageCircle,
  Phone,
  Mail,
  Search,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  BookOpen,
  Video,
  Download,
  Users,
  Zap,
  Shield
} from 'lucide-react';

const HelpSupport: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const faqs = [
    {
      id: 1,
      question: 'How do I create an effective profile?',
      answer: 'To create an effective profile, include a professional photo, write a compelling summary highlighting your key skills and achievements, list your work experience with quantifiable results, add relevant skills, and keep your information up to date.',
      category: 'Profile'
    },
    {
      id: 2,
      question: 'How does the job matching algorithm work?',
      answer: 'Our AI-powered algorithm analyzes your profile, skills, experience, preferences, and past applications to match you with relevant job opportunities. The more complete your profile, the better the matches.',
      category: 'Jobs'
    },
    {
      id: 3,
      question: 'Can I practice interviews before applying?',
      answer: 'Yes! Our Interview Prep feature offers AI-powered mock interviews with real-time feedback, question categories (technical, behavioral, leadership), video recording capabilities, and personalized improvement suggestions.',
      category: 'Interviews'
    },
    {
      id: 4,
      question: 'How do I track my job applications?',
      answer: 'All your applications are automatically tracked in the "My Interviews" section. You can see application status, interview schedules, feedback from employers, and next steps for each application.',
      category: 'Applications'
    },
    {
      id: 5,
      question: 'Is my personal information secure?',
      answer: 'Absolutely. We use enterprise-grade encryption, comply with GDPR and privacy regulations, never share your data without permission, and provide granular privacy controls in your settings.',
      category: 'Privacy'
    },
    {
      id: 6,
      question: 'How do I get better job recommendations?',
      answer: 'Complete your profile 100%, update your skills regularly, set specific job preferences, engage with job postings, and use the salary insights feature to set realistic expectations.',
      category: 'Jobs'
    },
    {
      id: 7,
      question: 'Can I download my resume from the platform?',
      answer: 'Yes, you can download your resume in multiple formats (PDF, Word) from the Resume Builder section. You can also create multiple versions for different job types.',
      category: 'Resume'
    },
    {
      id: 8,
      question: 'How do I cancel my account?',
      answer: 'You can deactivate your account anytime from Settings > Account > Deactivate Account. Your data will be securely deleted according to our privacy policy.',
      category: 'Account'
    }
  ];

  const quickLinks = [
    {
      title: 'Getting Started Guide',
      description: 'Step-by-step guide for new users',
      icon: BookOpen,
      link: '#',
      category: 'Guide'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch how to use key features',
      icon: Video,
      link: '#',
      category: 'Tutorial'
    },
    {
      title: 'Resume Templates',
      description: 'Download professional templates',
      icon: Download,
      link: '#',
      category: 'Resource'
    },
    {
      title: 'Interview Tips',
      description: 'Expert advice for job interviews',
      icon: Users,
      link: '#',
      category: 'Guide'
    },
    {
      title: 'Platform Updates',
      description: 'Latest features and improvements',
      icon: Zap,
      link: '#',
      category: 'News'
    },
    {
      title: 'Privacy Policy',
      description: 'How we protect your data',
      icon: Shield,
      link: '#',
      category: 'Legal'
    }
  ];

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      available: true,
      response: 'Immediate'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      action: 'Send Email',
      available: true,
      response: '24 hours'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: Phone,
      action: 'Call Now',
      available: false,
      response: 'Business hours'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Message sent successfully!',
      description: 'We\'ll get back to you within 24 hours.',
    });
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general'
    });
  };

  const toggleFaq = (id: number) => {
    console.log('Toggling FAQ:', id, 'Current expanded:', expandedFaq);
    setExpandedFaq(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedSection>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Help & Support
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the help you need to make the most of your job search journey
          </p>
        </div>
      </AnimatedSection>

      {/* Search Bar */}
      <AnimatedSection delay={0.1}>
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
          <CardContent className="p-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* FAQ Categories */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Categories</h3>
                {['All', 'Profile', 'Jobs', 'Interviews', 'Applications', 'Privacy', 'Resume', 'Account'].map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setSearchQuery(category === 'All' ? '' : category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-2 space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader
                        className="pb-3 cursor-pointer"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base">{faq.question}</CardTitle>
                            <Badge variant="outline" className="mt-2">
                              {faq.category}
                            </Badge>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedFaq === faq.id ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </motion.div>
                        </div>
                      </CardHeader>
                      <AnimatePresence initial={false}>
                        {expandedFaq === faq.id && (
                          <motion.div
                            key={`faq-${faq.id}`}
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            style={{ transformOrigin: 'top' }}
                          >
                            <CardContent className="pt-0 pb-4">
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.1, duration: 0.15 }}
                                className="text-muted-foreground leading-relaxed"
                              >
                                {faq.answer}
                              </motion.p>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-md transition-all">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <link.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{link.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {link.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {link.description}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Guide
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Options */}
            <AnimatedSection delay={0.2}>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Options</h3>
                {contactOptions.map((option, index) => (
                  <motion.div
                    key={option.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className={`${option.available ? 'cursor-pointer hover:shadow-md' : 'opacity-50'} transition-all`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${option.available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <option.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{option.title}</h4>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant={option.available ? 'default' : 'secondary'}>
                                {option.available ? 'Available' : 'Unavailable'}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{option.response}</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" disabled={!option.available}>
                            {option.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>We'll get back to you within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Issue</option>
                        <option value="account">Account Problem</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        placeholder="Brief description of your inquiry"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        placeholder="Please describe your question or issue in detail..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>System Status</span>
                  </CardTitle>
                  <CardDescription>All systems operational</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { service: 'Job Search', status: 'operational' },
                    { service: 'Profile System', status: 'operational' },
                    { service: 'Interview Prep', status: 'operational' },
                    { service: 'Messaging', status: 'operational' },
                    { service: 'Resume Builder', status: 'operational' }
                  ].map((service) => (
                    <div key={service.service} className="flex justify-between items-center">
                      <span className="text-sm">{service.service}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 capitalize">{service.status}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span>Recent Updates</span>
                  </CardTitle>
                  <CardDescription>Latest platform improvements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      date: 'Dec 15, 2024',
                      title: 'Enhanced Interview Prep',
                      description: 'Added video recording and AI feedback'
                    },
                    {
                      date: 'Dec 10, 2024',
                      title: 'Improved Job Matching',
                      description: 'Better algorithm for job recommendations'
                    },
                    {
                      date: 'Dec 5, 2024',
                      title: 'Mobile Experience',
                      description: 'Enhanced mobile app performance'
                    }
                  ].map((update, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4">
                      <p className="text-xs text-muted-foreground">{update.date}</p>
                      <h4 className="font-semibold text-sm">{update.title}</h4>
                      <p className="text-xs text-muted-foreground">{update.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpSupport;
