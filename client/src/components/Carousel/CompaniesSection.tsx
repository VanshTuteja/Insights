import React, { useState } from 'react';
import { motion } from 'framer-motion';

type Company = {
  name: string;
  logo: string;
};

const companies: Company[] = [
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

const CompanyCard: React.FC<{ company: Company }> = ({ company }) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="company-card group flex h-24 w-40 shrink-0 items-center gap-3 rounded-2xl border border-border/50 bg-card/90 px-4 shadow-md backdrop-blur-sm">
      {!imageFailed ? (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/80 ring-1 ring-border/60">
          <img
            src={company.logo}
            alt={`${company.name} logo`}
            className="h-8 w-8 object-contain"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
          {company.name.slice(0, 2)}
        </div>
      )}

      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
        <p className="text-xs text-muted-foreground">Hiring partner</p>
      </div>
    </div>
  );
};

const CompanyRow: React.FC<{
  items: Company[];
  direction: 'left' | 'right';
  duration: number;
}> = ({ items, direction, duration }) => {
  const loopItems = [...items, ...items];

  return (
    <div className="company-row overflow-hidden">
      <div
        className={`company-track flex w-max gap-6 ${direction === 'left' ? 'company-track-left' : 'company-track-right'}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {loopItems.map((company, index) => (
          <CompanyCard key={`${direction}-${company.name}-${index}`} company={company} />
        ))}
      </div>
    </div>
  );
};

const CompaniesSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
      <style>{`
        .company-row {
          position: relative;
        }

        .company-track {
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }

        .company-track-left {
          animation: companies-marquee-left linear infinite;
        }

        .company-track-right {
          animation: companies-marquee-right linear infinite;
        }

        .company-card {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }

        .company-card:hover {
          transform: translate3d(0, -4px, 0);
          box-shadow: 0 18px 35px rgba(0, 0, 0, 0.18);
          border-color: hsl(var(--primary) / 0.4);
        }

        @keyframes companies-marquee-left {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(calc(-50% - 0.75rem), 0, 0);
          }
        }

        @keyframes companies-marquee-right {
          from {
            transform: translate3d(calc(-50% - 0.75rem), 0, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Trusted by Professionals{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Join thousands of professionals who have found their dream jobs with top companies
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
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
                className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              >
                {stat.number}
              </motion.p>
              <p className="font-medium text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative mt-10">
        <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background via-background/85 to-transparent md:w-32" />
        <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background via-background/85 to-transparent md:w-32" />

        <div className="space-y-6">
          <CompanyRow items={companies} direction="left" duration={34} />
          <CompanyRow items={[...companies].reverse()} direction="right" duration={30} />
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;
