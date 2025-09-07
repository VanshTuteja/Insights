import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  MessageCircle, 
  Play, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Target,
  Mic,
  Video,
  Brain
} from 'lucide-react';

const InterviewPrep: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  const interviewCategories = [
    { name: 'Technical', questions: 25, completed: 18, color: 'from-blue-500 to-blue-600' },
    { name: 'Behavioral', questions: 20, completed: 12, color: 'from-green-500 to-green-600' },
    { name: 'Leadership', questions: 15, completed: 8, color: 'from-purple-500 to-purple-600' },
    { name: 'Problem Solving', questions: 18, completed: 10, color: 'from-orange-500 to-orange-600' },
  ];

  const mockQuestions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths and weaknesses?",
    "How do you handle challenging situations at work?",
    "Describe a project you're particularly proud of.",
    "Where do you see yourself in 5 years?",
  ];

  const feedback = {
    overallScore: 85,
    categories: [
      { name: 'Communication', score: 90, color: 'bg-green-500' },
      { name: 'Technical Knowledge', score: 85, color: 'bg-blue-500' },
      { name: 'Problem Solving', score: 80, color: 'bg-purple-500' },
      { name: 'Confidence', score: 85, color: 'bg-orange-500' },
    ],
  };

  const startMockInterview = () => {
    setSessionActive(true);
    setCurrentQuestion(0);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Interview Preparation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice with AI-powered mock interviews and get personalized feedback
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <AnimatedSection delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Practice Categories</span>
              </CardTitle>
              <CardDescription>Choose your focus area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {interviewCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <Badge variant="outline">{category.completed}/{category.questions}</Badge>
                  </div>
                  <Progress 
                    value={(category.completed / category.questions) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {category.questions} questions available
                  </p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Mock Interview */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatedSection delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Mock Interview Session</span>
                </CardTitle>
                <CardDescription>Practice with realistic interview scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                {!sessionActive ? (
                  <div className="text-center space-y-6 py-8">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center"
                    >
                      <Play className="h-12 w-12 text-white ml-1" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Ready to start?</h3>
                      <p className="text-muted-foreground">
                        Begin your mock interview session with AI-powered questions
                      </p>
                    </div>
                    <Button 
                      onClick={startMockInterview}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      Start Mock Interview
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Question {currentQuestion + 1} of {mockQuestions.length}</Badge>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>5:30 remaining</span>
                      </div>
                    </div>

                    <Card className="bg-gradient-to-br from-accent/20 to-accent/5">
                      <CardContent className="p-6">
                        <motion.p
                          key={currentQuestion}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-lg leading-relaxed"
                        >
                          {mockQuestions[currentQuestion]}
                        </motion.p>
                      </CardContent>
                    </Card>

                    <div className="flex justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleRecording}
                        className={`p-4 rounded-full transition-all ${
                          isRecording 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                      >
                        {isRecording ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Mic className="h-6 w-6 text-white" />
                          </motion.div>
                        ) : (
                          <Video className="h-6 w-6 text-white" />
                        )}
                      </motion.button>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        disabled={currentQuestion === 0}
                        onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => {
                          if (currentQuestion < mockQuestions.length - 1) {
                            setCurrentQuestion(currentQuestion + 1);
                          } else {
                            setSessionActive(false);
                          }
                        }}
                        className="bg-gradient-to-r from-primary to-secondary"
                      >
                        {currentQuestion === mockQuestions.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Feedback Section */}
          <AnimatedSection delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Feedback</span>
                </CardTitle>
                <CardDescription>AI-generated insights on your interview performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-2xl font-bold mb-2"
                  >
                    {feedback.overallScore}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>

                <div className="space-y-4">
                  {feedback.categories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm font-semibold">{category.score}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${category.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${category.score}%` }}
                          transition={{ delay: 0.5 + 0.2 * index, duration: 0.8 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-accent/20 to-accent/5 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Brain className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-2">AI Recommendations</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Practice speaking more confidently about your achievements</li>
                        <li>• Prepare specific examples for behavioral questions</li>
                        <li>• Work on your closing questions for the interviewer</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;