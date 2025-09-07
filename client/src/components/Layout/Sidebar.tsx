import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Briefcase, 
  User, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Home,
  Search,
  BookmarkIcon,
  Calendar,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();

  const mainNavItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/jobs', label: 'Find Jobs', icon: Search },
    { path: '/saved', label: 'Saved Jobs', icon: BookmarkIcon, badge: 5 },
    { path: '/resume', label: 'Resume Builder', icon: User },
    { path: '/interview', label: 'Interview Prep', icon: MessageSquare },
    { path: '/interviews', label: 'My Interviews', icon: Calendar, badge: 2 },
    { path: '/insights', label: 'Career Insights', icon: BarChart3 },
  ];

  const secondaryNavItems = [
    { path: '/employer', label: 'For Employers', icon: Building2 },
    { path: '/messaging', label: 'Messages', icon: Mail, badge: 3 },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className={cn("pb-12 min-h-screen bg-background border-r transition-all duration-300", 
      isCollapsed ? "w-16" : "w-64", className)}>
      <div className="space-y-4 py-4">
        {/* Header with Logo and Toggle */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center space-x-2"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    JobFinder AI
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-2">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground"
              >
                MAIN MENU
              </motion.h2>
            )}
          </AnimatePresence>
          
          <div className="space-y-1">
            {mainNavItems.map(({ path, label, icon: Icon, badge }) => (
              <Link key={path} to={path}>
                <motion.div
                  whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={location.pathname === path ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start relative",
                      isCollapsed ? "px-2" : "px-4",
                      location.pathname === path && "bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-3")} />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="truncate"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {badge && !isCollapsed && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {badge}
                      </Badge>
                    )}
                    {badge && isCollapsed && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                    )}
                  </Button>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* Secondary Navigation */}
        <div className="px-3 py-2">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground"
              >
                TOOLS & MORE
              </motion.h2>
            )}
          </AnimatePresence>
          
          <div className="space-y-1">
            {secondaryNavItems.map(({ path, label, icon: Icon, badge }) => (
              <Link key={path} to={path}>
                <motion.div
                  whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={location.pathname === path ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start relative",
                      isCollapsed ? "px-2" : "px-4",
                      location.pathname === path && "bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-3")} />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="truncate"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {badge && !isCollapsed && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {badge}
                      </Badge>
                    )}
                    {badge && isCollapsed && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                    )}
                  </Button>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* User Profile at Bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <div className={cn(
            "flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;