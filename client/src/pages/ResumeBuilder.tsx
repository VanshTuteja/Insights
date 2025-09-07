import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Upload, Download, Eye, Wand2, Plus, X } from 'lucide-react';

const ResumeBuilder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    summary: '',
    experience: '',
    education: '',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setLoading(true);
    // Simulate file processing
    setTimeout(() => {
      setLoading(false);
      console.log('File processed:', acceptedFiles[0]);
    }, 2000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  });

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      toast({
        title: 'Skill added',
        description: `${newSkill.trim()} has been added to your skills.`,
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
    toast({
      title: 'Skill removed',
      description: `${skillToRemove} has been removed from your skills.`,
    });
  };

  const generateWithAI = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResumeData({
        ...resumeData,
        summary: 'Experienced software developer with 5+ years in building scalable web applications. Proficient in modern frameworks and passionate about creating user-centric solutions.',
      });
      toast({
        title: 'Resume enhanced',
        description: 'Your resume has been enhanced with AI suggestions.',
      });
    }, 2000);
  };

  const downloadResume = () => {
    toast({
      title: 'Resume downloaded',
      description: 'Your resume has been downloaded as a PDF.',
    });
  };

  const previewResume = () => {
    toast({
      title: 'Opening preview',
      description: 'Resume preview will open in a new window.',
    });
  };

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Resume Builder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create a professional resume with AI assistance or upload your existing one for enhancement
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Editor */}
        <AnimatedSection delay={0.2}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5" />
                <span>Resume Editor</span>
              </CardTitle>
              <CardDescription>Build your resume step by step</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="build">Build</TabsTrigger>
                  <TabsTrigger value="enhance">Enhance</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <motion.div
                    {...getRootProps()}
                    whileHover={{ scale: 1.02 }}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {loading ? (
                      <div className="space-y-4">
                        <LoadingSpinner size="lg" className="mx-auto" />
                        <p className="text-sm text-muted-foreground">Processing your resume...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <p className="text-lg font-semibold">
                            {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Supports PDF, DOC, DOCX files
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="build" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name"
                        value={resumeData.name}
                        onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={resumeData.email}
                        onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder="Phone Number"
                      value={resumeData.phone}
                      onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    />
                    <Textarea
                      placeholder="Professional Summary"
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                      rows={4}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Skills</label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skills.map((skill) => (
                          <motion.div
                            key={skill}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            layout
                          >
                            <Badge 
                              variant="secondary" 
                              className="cursor-pointer group"
                              onClick={() => removeSkill(skill)}
                            >
                              {skill}
                              <X className="h-3 w-3 ml-1 group-hover:text-destructive" />
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="enhance" className="space-y-4">
                  <div className="text-center space-y-4">
                    <Button
                      onClick={generateWithAI}
                      disabled={loading}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Our AI will analyze your resume and suggest improvements
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={downloadResume}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Resume Preview */}
        <AnimatedSection delay={0.3}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
              <CardDescription>See how your resume will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-6 min-h-96 shadow-inner">
                <div className="space-y-6">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {resumeData.name || 'Your Name'}
                    </h2>
                    <div className="text-gray-600 space-x-2">
                      <span>{resumeData.email || 'email@example.com'}</span>
                      <span>•</span>
                      <span>{resumeData.phone || '(555) 123-4567'}</span>
                    </div>
                  </div>
                  
                  {resumeData.summary && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Professional Summary</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{resumeData.summary}</p>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill) => (
                          <span 
                            key={skill}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ResumeBuilder;