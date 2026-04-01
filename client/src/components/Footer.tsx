import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ArrowRight,
  Sparkles,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'AI Job Matching', href: '#' },
      { name: 'Resume Builder', href: '#' },
      { name: 'Interview Prep', href: '#' },
      { name: 'Career Insights', href: '#' },
      { name: 'Salary Analytics', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    resources: [
      { name: 'Help Center', href: '#' },
      { name: 'Career Guide', href: '#' },
      { name: 'Success Stories', href: '#' },
      { name: 'Webinars', href: '#' },
      { name: 'API Docs', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' },
      { name: 'Accessibility', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="relative bg-background border-t">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5" />
      
      <div className="relative">
        {/* Newsletter Section */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center space-y-6"
            >
              <div className="flex justify-center">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 10px hsl(var(--primary))',
                      '0 0 20px hsl(var(--primary))',
                      '0 0 10px hsl(var(--primary))'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 border border-primary/30 rounded-full flex items-center justify-center bg-background/80 backdrop-blur-sm"
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </motion.div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Stay Ahead in Your{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Career Journey
                  </span>
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Get the latest job opportunities, career tips, and AI-powered insights delivered to your inbox
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="bg-gradient-to-r from-primary to-secondary px-6">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Footer Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand Section */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-1 space-y-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">JobFinder AI</span>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Revolutionizing job search with AI-powered matching, smart resume building, 
                  and personalized career insights. Your dream job is just a click away.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>vanshtuteja@jobfinderai.com</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+91 971234763</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Jaipur, India</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors group"
                      aria-label={social.label}
                    >
                      <social.icon className="h-4 w-4 text-primary group-hover:text-primary/80 transition-colors" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Links Sections */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-8">
                {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: categoryIndex * 0.1, duration: 0.6 }}
                    className="space-y-4"
                  >
                    <h4 className="font-semibold text-foreground capitalize">
                      {category === 'product' ? 'Product' : 
                       category === 'company' ? 'Company' : 
                       category === 'resources' ? 'Resources' : 'Legal'}
                    </h4>
                    <ul className="space-y-2">
                      {links.map((link, index) => (
                        <motion.li
                          key={link.name}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (categoryIndex * 0.1) + (index * 0.05), duration: 0.4 }}
                        >
                          <a
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {link.name}
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Bar */}
        <section className="py-6 border-t bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
            >
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>© 2025 JobFinder AI. All rights reserved.</span>
                <span className="text-primary">•</span>
                <span className="flex items-center space-x-1">
                  <span>Made with</span>
                  <Heart className="h-3 w-3 text-red-500" />
                  <span>for job seekers</span>
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Powered by{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-medium">
                  Advanced AI Technology
                </span>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
