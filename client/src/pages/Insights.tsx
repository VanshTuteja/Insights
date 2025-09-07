import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AnimatedSection from '@/components/AnimatedSection';
import { TrendingUp, DollarSign, MapPin, Briefcase, Users, Target } from 'lucide-react';

const Insights: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('frontend-developer');

  const salaryTrends = [
    { month: 'Jan', salary: 95000, applications: 150, openings: 1200 },
    { month: 'Feb', salary: 97000, applications: 180, openings: 1350 },
    { month: 'Mar', salary: 99000, applications: 220, openings: 1500 },
    { month: 'Apr', salary: 101000, applications: 190, openings: 1400 },
    { month: 'May', salary: 103000, applications: 250, openings: 1600 },
    { month: 'Jun', salary: 105000, applications: 280, openings: 1750 },
  ];

  const jobDemand = [
    { skill: 'React', demand: 95, openings: 1200 },
    { skill: 'Python', demand: 88, openings: 980 },
    { skill: 'TypeScript', demand: 82, openings: 750 },
    { skill: 'Node.js', demand: 78, openings: 680 },
    { skill: 'AWS', demand: 85, openings: 920 },
  ];

  const locationData = [
    { name: 'San Francisco', value: 35, color: '#3b82f6' },
    { name: 'New York', value: 25, color: '#10b981' },
    { name: 'Austin', value: 15, color: '#f59e0b' },
    { name: 'Seattle', value: 15, color: '#ef4444' },
    { name: 'Remote', value: 10, color: '#8b5cf6' },
  ];

  const marketInsights = [
    {
      title: 'Hot Skills This Month',
      items: ['React', 'TypeScript', 'Python', 'AWS', 'Docker'],
      trend: 'up',
    },
    {
      title: 'Emerging Technologies',
      items: ['Next.js', 'Tailwind CSS', 'GraphQL', 'Kubernetes', 'AI/ML'],
      trend: 'up',
    },
    {
      title: 'High Demand Roles',
      items: ['Frontend Dev', 'Data Scientist', 'DevOps', 'Product Manager', 'UX Designer'],
      trend: 'up',
    },
  ];

  const insights = [
    {
      title: 'Market Growth',
      value: '+12.5%',
      description: 'Job openings increased this quarter',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Avg Salary',
      value: '$108k',
      description: 'For frontend developers',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Remote Jobs',
      value: '68%',
      description: 'Offer remote work options',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Competition',
      value: '4.2:1',
      description: 'Applicants per position',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Career Insights & Analytics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time market data and personalized career recommendations
          </p>
        </div>
      </AnimatedSection>

      {/* Key Metrics */}
      <AnimatedSection delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${insight.color}`}>
                      <insight.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{insight.value}</p>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Charts Section */}
      <AnimatedSection delay={0.4}>
        <Tabs defaultValue="salary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="salary">Salary Trends</TabsTrigger>
            <TabsTrigger value="demand">Skills Demand</TabsTrigger>
            <TabsTrigger value="locations">Top Locations</TabsTrigger>
            <TabsTrigger value="forecast">AI Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="salary" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Salary Trends</CardTitle>
                    <CardDescription>Average salaries over the past 6 months</CardDescription>
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                      <SelectItem value="backend-developer">Backend Developer</SelectItem>
                      <SelectItem value="full-stack">Full Stack</SelectItem>
                      <SelectItem value="data-scientist">Data Scientist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salaryTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Average Salary']} />
                      <Line 
                        type="monotone" 
                        dataKey="salary" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-accent/10 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">$105k</p>
                    <p className="text-xs text-muted-foreground">Current Avg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">+10.5%</p>
                    <p className="text-xs text-muted-foreground">6M Growth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">1,750</p>
                    <p className="text-xs text-muted-foreground">Open Positions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
                <CardDescription>Latest trends and opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {marketInsights.map((insight, index) => (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg"
                    >
                      <h4 className="font-semibold mb-3 text-sm">{insight.title}</h4>
                      <div className="space-y-2">
                        {insight.items.map((item, itemIndex) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * itemIndex }}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-xs">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demand" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills in Demand</CardTitle>
                <CardDescription>Most requested skills by employers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobDemand}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="demand" 
                        fill="url(#demandGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Distribution by Location</CardTitle>
                <CardDescription>Where the opportunities are</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Jobs']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {locationData.map((location) => (
                    <div key={location.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: location.color }}
                      />
                      <span className="text-sm">{location.name}</span>
                      <span className="text-xs text-muted-foreground">({location.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>AI Career Forecast</span>
                </CardTitle>
                <CardDescription>Personalized predictions for your career path</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      title: 'Next Promotion', 
                      prediction: '6-8 months', 
                      confidence: 82,
                      description: 'Based on your current trajectory' 
                    },
                    { 
                      title: 'Salary Increase', 
                      prediction: '+18%', 
                      confidence: 74,
                      description: 'With current skill development' 
                    },
                    { 
                      title: 'Job Match', 
                      prediction: '94% fit', 
                      confidence: 91,
                      description: 'For senior frontend roles' 
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 * index }}
                      className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border"
                    >
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">{item.prediction}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.confidence}%` }}
                            transition={{ delay: 0.5 + 0.2 * index, duration: 0.8 }}
                          />
                        </div>
                        <span className="text-xs font-medium">{item.confidence}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedSection>
    </div>
  );
};

export default Insights;