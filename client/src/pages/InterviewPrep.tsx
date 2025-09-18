import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AnimatedSection from '@/components/AnimatedSection';
import { 
  MessageCircle, 
  Play, 
  BarChart3, 
  Clock, 
  Target,
  Mic,
  Brain,
  Square,
  RotateCcw,
  Award,
  Camera,
  VideoOff,
  Download,
  Eye,
  Pause
} from 'lucide-react';

const InterviewPrep: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // Media recording states
  const [recordingMode, setRecordingMode] = useState<'video' | 'audio'>('video');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  // Refs for media elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);

  const interviewCategories = [
    { name: 'Technical', questions: 25, completed: 18, color: 'from-blue-500 to-blue-600' },
    { name: 'Behavioral', questions: 20, completed: 12, color: 'from-green-500 to-green-600' },
    { name: 'Leadership', questions: 15, completed: 8, color: 'from-purple-500 to-purple-600' },
    { name: 'Problem Solving', questions: 18, completed: 10, color: 'from-orange-500 to-orange-600' },
  ];

  const questionSets = {
    'Technical': [
      "Explain the difference between let, const, and var in JavaScript.",
      "How would you optimize a slow-performing database query?",
      "Describe the concept of closures in programming.",
      "What is the time complexity of common sorting algorithms?",
      "How would you implement a REST API with proper error handling?",
    ],
    'Behavioral': [
      "Tell me about yourself and your background.",
      "What are your greatest strengths and weaknesses?",
      "How do you handle challenging situations at work?",
      "Describe a project you're particularly proud of.",
      "Where do you see yourself in 5 years?",
    ],
    'Leadership': [
      "Describe a time when you had to lead a difficult project.",
      "How do you motivate team members who are underperforming?",
      "Tell me about a time you had to make an unpopular decision.",
      "How do you handle conflicts within your team?",
      "What's your approach to giving constructive feedback?",
    ],
    'Problem Solving': [
      "Walk me through how you would debug a production issue.",
      "How would you approach a problem you've never encountered before?",
      "Describe a time when you had to think outside the box.",
      "How do you prioritize multiple urgent tasks?",
      "Tell me about a time you failed and what you learned from it.",
    ]
  };

  const getCurrentQuestions = () => {
    return selectedCategory ? questionSets[selectedCategory as keyof typeof questionSets] : questionSets['Behavioral'];
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      stopRecording();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  // Cleanup media stream on component unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Media recording functions
  const requestMediaAccess = async (mode: 'video' | 'audio') => {
    try {
      setRecordingError(null);
      const constraints = mode === 'video' 
        ? { video: true, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      
      if (mode === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setRecordingError(`Failed to access ${mode}. Please check your permissions.`);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      let stream = mediaStream;
      if (!stream) {
        stream = await requestMediaAccess(recordingMode);
      }
      
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: recordingMode === 'video' ? 'video/webm' : 'audio/webm' 
        });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        
        if (recordedVideoRef.current) {
          recordedVideoRef.current.src = url;
        }
      };
      
      recorder.start(1000); // Record in 1-second chunks
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsTimerActive(true);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setIsTimerActive(false);
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.pause();
      setIsTimerActive(false);
    }
  };

  const downloadRecording = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `interview-${selectedCategory}-question-${currentQuestion + 1}.${recordingMode === 'video' ? 'webm' : 'webm'}`;
      a.click();
    }
  };

  const clearRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setIsReviewing(false);
  };

  const feedback = {
    overallScore: 85,
    categories: [
      { name: 'Communication', score: 90, color: 'bg-green-500' },
      { name: 'Technical Knowledge', score: 85, color: 'bg-blue-500' },
      { name: 'Problem Solving', score: 80, color: 'bg-purple-500' },
      { name: 'Confidence', score: 85, color: 'bg-orange-500' },
    ],
  };

  const startMockInterview = (category?: string) => {
    setSelectedCategory(category || 'Behavioral');
    setSessionActive(true);
    setSessionComplete(false);
    setCurrentQuestion(0);
    setTimeRemaining(300); // Reset timer to 5 minutes
    setAnswers([]);
    setCurrentAnswer('');
    setIsRecording(false);
    setIsTimerActive(false);
    clearRecording();
    setIsReviewing(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const nextQuestion = () => {
    const questions = getCurrentQuestions();
    if (currentQuestion < questions.length - 1) {
      setAnswers([...answers, currentAnswer]);
      setCurrentAnswer('');
      setCurrentQuestion(currentQuestion + 1);
      setTimeRemaining(300); // Reset timer for next question
      stopRecording();
      clearRecording();
      setIsReviewing(false);
    } else {
      finishInterview();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      const newAnswers = [...answers];
      setCurrentAnswer(newAnswers[currentQuestion - 1] || '');
      newAnswers.pop();
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion - 1);
      setTimeRemaining(300);
      stopRecording();
      clearRecording();
      setIsReviewing(false);
    }
  };

  const finishInterview = () => {
    setAnswers([...answers, currentAnswer]);
    setSessionActive(false);
    setSessionComplete(true);
    stopRecording();
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const resetInterview = () => {
    setSessionActive(false);
    setSessionComplete(false);
    setCurrentQuestion(0);
    setTimeRemaining(300);
    setAnswers([]);
    setCurrentAnswer('');
    stopRecording();
    clearRecording();
    setIsReviewing(false);
    setSelectedCategory(null);
    setRecordingError(null);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
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
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                    selectedCategory === category.name 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => !sessionActive && startMockInterview(category.name)}
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
                  {selectedCategory === category.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                    </motion.div>
                  )}
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
                <AnimatePresence mode="wait">
                  {!sessionActive && !sessionComplete ? (
                    <motion.div
                      key="start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center space-y-6 py-8"
                    >
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
                          {selectedCategory 
                            ? `Begin your ${selectedCategory} mock interview session with AI-powered questions`
                            : 'Select a category above or start with general behavioral questions'
                          }
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={() => startMockInterview()}
                          size="lg"
                          variant="outline"
                        >
                          Quick Start (Behavioral)
                        </Button>
                        <Button 
                          onClick={() => startMockInterview(selectedCategory || 'Behavioral')}
                          size="lg"
                          className="bg-gradient-to-r from-primary to-secondary"
                          disabled={!selectedCategory}
                        >
                          Start {selectedCategory || 'Selected'} Interview
                        </Button>
                      </div>
                    </motion.div>
                  ) : sessionActive ? (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">
                            Question {currentQuestion + 1} of {getCurrentQuestions().length}
                          </Badge>
                          <Badge variant="outline" className="bg-primary/10">
                            {selectedCategory}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className={`h-4 w-4 ${timeRemaining < 60 ? 'text-red-500' : 'text-muted-foreground'}`} />
                          <span className={timeRemaining < 60 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
                            {formatTime(timeRemaining)} remaining
                          </span>
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
                            {getCurrentQuestions()[currentQuestion]}
                          </motion.p>
                        </CardContent>
                      </Card>

                      {/* Recording Mode Selection */}
                      <div className="flex justify-center mb-4">
                        <div className="flex bg-secondary rounded-lg p-1">
                          <Button
                            variant={recordingMode === 'video' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setRecordingMode('video')}
                            disabled={isRecording}
                            className="flex items-center space-x-2"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Video</span>
                          </Button>
                          <Button
                            variant={recordingMode === 'audio' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setRecordingMode('audio')}
                            disabled={isRecording}
                            className="flex items-center space-x-2"
                          >
                            <Mic className="h-4 w-4" />
                            <span>Audio</span>
                          </Button>
                        </div>
                      </div>

                      {/* Video Preview */}
                      {recordingMode === 'video' && !isReviewing && (
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              className="w-80 h-60 bg-gray-900 rounded-lg object-cover"
                            />
                            {!mediaStream && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                                <div className="text-center text-white">
                                  <VideoOff className="h-12 w-12 mx-auto mb-2" />
                                  <p className="text-sm">Camera not active</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recorded Video Review */}
                      {recordedVideoUrl && isReviewing && (
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <video
                              ref={recordedVideoRef}
                              controls
                              className="w-80 h-60 bg-gray-900 rounded-lg object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Recording Error */}
                      {recordingError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-red-800 text-sm">{recordingError}</p>
                        </div>
                      )}

                      {/* Recording Controls */}
                      <div className="text-center space-y-4">
                        <div className="flex justify-center space-x-4">
                          {!recordedVideoUrl ? (
                            <>
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
                                    <Square className="h-6 w-6 text-white" />
                                  </motion.div>
                                ) : (
                                  recordingMode === 'video' ? (
                                    <Camera className="h-6 w-6 text-white" />
                                  ) : (
                                    <Mic className="h-6 w-6 text-white" />
                                  )
                                )}
                              </motion.button>
                              
                              {isRecording && mediaRecorder?.state === 'recording' && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={pauseRecording}
                                  className="p-4 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all"
                                >
                                  <Pause className="h-6 w-6 text-white" />
                                </motion.button>
                              )}
                            </>
                          ) : (
                            <div className="flex space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsReviewing(!isReviewing)}
                                className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-all"
                              >
                                <Eye className="h-6 w-6 text-white" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={downloadRecording}
                                className="p-4 rounded-full bg-green-500 hover:bg-green-600 transition-all"
                              >
                                <Download className="h-6 w-6 text-white" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={clearRecording}
                                className="p-4 rounded-full bg-gray-500 hover:bg-gray-600 transition-all"
                              >
                                <RotateCcw className="h-6 w-6 text-white" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {recordedVideoUrl ? (
                            isReviewing ? 
                              'Review your recorded response above' :
                              'Response recorded! Review, download, or record again'
                          ) : isRecording ? (
                            `Recording ${recordingMode}... Click square to stop.`
                          ) : (
                            `Click the ${recordingMode === 'video' ? 'camera' : 'microphone'} to start recording your ${recordingMode} response`
                          )}
                        </p>
                      </div>

                      <div className="flex justify-between">
                        <Button 
                          variant="outline"
                          disabled={currentQuestion === 0}
                          onClick={previousQuestion}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            onClick={resetInterview}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                          <Button
                            onClick={nextQuestion}
                            className="bg-gradient-to-r from-primary to-secondary"
                          >
                            {currentQuestion === getCurrentQuestions().length - 1 ? 'Finish' : 'Next'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : sessionComplete ? (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center space-y-6 py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                      >
                        <Award className="h-12 w-12 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Interview Complete!</h3>
                        <p className="text-muted-foreground">
                          Great job! You've completed the {selectedCategory} interview session.
                          <br />Check your performance feedback below.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={() => startMockInterview(selectedCategory || 'Behavioral')}
                          variant="outline"
                          size="lg"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                        <Button 
                          onClick={resetInterview}
                          size="lg"
                          className="bg-gradient-to-r from-primary to-secondary"
                        >
                          New Interview
                        </Button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Feedback Section */}
          {sessionComplete && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;