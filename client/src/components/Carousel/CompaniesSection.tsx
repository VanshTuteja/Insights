import React from 'react';
import { motion } from 'framer-motion';

const CompaniesSection: React.FC = () => {
    // Company logos with working URLs
    const companies = [
        { name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
        { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
        { name: 'Apple', logo: 'https://logo.clearbit.com/apple.com' },
        { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
        { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com' },
        { name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com' },
        { name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com' },
        { name: 'Spotify', logo: 'https://logo.clearbit.com/spotify.com' },
        { name: 'Adobe', logo: 'https://logo.clearbit.com/adobe.com' },
        { name: 'Salesforce', logo: 'https://logo.clearbit.com/salesforce.com' },
        { name: 'LinkedIn', logo: 'https://logo.clearbit.com/linkedin.com' },
        { name: 'Uber', logo: 'https://logo.clearbit.com/uber.com' },
        { name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com' },
        { name: 'Shopify', logo: 'https://logo.clearbit.com/shopify.com' },
        { name: 'Slack', logo: 'https://logo.clearbit.com/slack.com' },
        { name: 'Zoom', logo: 'https://logo.clearbit.com/zoom.us' },
    ];

    const stats = [
        { number: '10K+', label: 'Active Users' },
        { number: '500+', label: 'Companies' },
        { number: '95%', label: 'Success Rate' },
        { number: '24/7', label: 'Support' },
    ];

    // Create multiple sets for seamless scrolling
    const extendedCompanies = [...companies, ...companies, ...companies];

    return (
        <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Trusted by Professionals{' '}
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Worldwide
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Join thousands of professionals who have found their dream jobs with top companies
                    </p>
                </motion.div>



                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="text-center"
                        >
                            <motion.p
                                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            >
                                {stat.number}
                            </motion.p>
                            <p className="text-muted-foreground font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
            {/* Floating Companies Carousel - Full Screen Width */}
            <div className="relative -mx-4 md:-mx-6 lg:-mx-8 xl:-mx-12 2xl:-mx-24 mt-10">
                <div className="overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

                    {/* Top Row - Moving Right */}
                    <div className="mb-8 mt-2">
                        <motion.div
                            className="flex gap-8 w-max pl-8"
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
                            {extendedCompanies.map((company, index) => (
                                <motion.div
                                    key={`top-${index}`}
                                    className="flex-shrink-0 w-32 h-20 bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 group"
                                    whileHover={{
                                        scale: 1.05,
                                        y: -5,
                                    }}
                                    animate={{
                                        y: [0, -8, 0],
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
                                    <img
                                        src={company.logo}
                                        alt={`${company.name} logo`}
                                        className="h-8 w-auto max-w-20 object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `<div class="text-xs font-medium text-muted-foreground text-center">${company.name}</div>`;
                                            }
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Bottom Row - Moving Left */}
                    <div className="mb-2">
                        <motion.div
                            className="flex gap-8 w-max pr-8"
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
                            {[...extendedCompanies].reverse().map((company, index) => (
                                <motion.div
                                    key={`bottom-${index}`}
                                    className="flex-shrink-0 w-32 h-20 bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 group"
                                    whileHover={{
                                        scale: 1.05,
                                        y: -5,
                                    }}
                                    animate={{
                                        y: [0, 8, 0],
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
                                    <img
                                        src={company.logo}
                                        alt={`${company.name} logo`}
                                        className="h-8 w-auto max-w-20 object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `<div class="text-xs font-medium text-muted-foreground text-center">${company.name}</div>`;
                                            }
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CompaniesSection;