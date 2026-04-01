import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedSection from '@/components/AnimatedSection';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip,
  MessageCircle
} from 'lucide-react';

const Messaging: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState('1');
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Talent Recruiter',
      company: 'TechCorp Inc.',
      lastMessage: 'I\'d love to discuss the frontend position with you',
      time: '10 min ago',
      unread: 2,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Engineering Manager',
      company: 'Startup Labs',
      lastMessage: 'When would be a good time for a technical interview?',
      time: '2 hours ago',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Emily Davis',
      role: 'HR Manager',
      company: 'Design Studio',
      lastMessage: 'Thank you for your application. We\'ll be in touch soon.',
      time: '1 day ago',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
  ];

  const messages = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      content: 'Hi! I came across your profile and I think you would be a great fit for our Senior Frontend Developer position.',
      time: '2:30 PM',
      isOwn: false,
    },
    {
      id: '2',
      sender: 'You',
      content: 'Thank you for reaching out! I\'m definitely interested in learning more about the opportunity.',
      time: '2:45 PM',
      isOwn: true,
    },
    {
      id: '3',
      sender: 'Sarah Johnson',
      content: 'Great! I\'d love to discuss the role in more detail. Would you be available for a quick call this week?',
      time: '3:00 PM',
      isOwn: false,
    },
    {
      id: '4',
      sender: 'You',
      content: 'Yes, I\'m available. What would be the best time for you?',
      time: '3:15 PM',
      isOwn: true,
    },
  ];

  const sendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with recruiters and hiring managers
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Conversations List */}
        <AnimatedSection delay={0.2} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Conversations</span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-4">
                  {conversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedChat(conversation.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat === conversation.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold truncate">{conversation.name}</h4>
                            {conversation.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs opacity-80">{conversation.role} at {conversation.company}</p>
                          <p className="text-xs truncate mt-1 opacity-70">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs opacity-60 mt-1">{conversation.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Chat Area */}
        <AnimatedSection delay={0.3} className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            {selectedConversation && (
              <>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedConversation.avatar} />
                        <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                        <CardDescription>
                          {selectedConversation.role} at {selectedConversation.company}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 opacity-70 ${
                              message.isOwn ? 'text-right' : 'text-left'
                            }`}>
                              {message.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} className="bg-gradient-to-r from-primary to-secondary">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Messaging;
