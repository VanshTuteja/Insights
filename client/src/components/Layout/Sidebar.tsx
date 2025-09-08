import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  Search,
  BookmarkIcon,
  User,
  MessageSquare,
  Calendar,
  BarChart3,
  Building2,
  Mail,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, isCollapsed, onToggle }) => {
  const location = useLocation();

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
    <div className={cn(
      "relative flex flex-col h-full bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
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
          className="h-8 w-8 p-0 shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Scrollable Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-6 py-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Main Menu
                </motion.h2>
              )}
            </AnimatePresence>
            
            <div className="space-y-1">
              {mainNavItems.map(({ path, label, icon: Icon, badge }) => (
                <Link key={path} to={path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={location.pathname === path ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start relative group",
                        isCollapsed ? "px-2" : "px-3",
                        location.pathname === path && "bg-primary/10 text-primary border-r-2 border-primary"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isCollapsed ? "mx-auto" : "mr-3")} />
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
                      
                      {/* Badge */}
                      {badge && (
                        <>
                          {!isCollapsed ? (
                            <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {badge}
                            </Badge>
                          ) : (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                          )}
                        </>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {label}
                          {badge && (
                            <Badge variant="destructive" className="ml-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                              {badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          {/* Secondary Navigation */}
          <div className="space-y-2">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Tools & More
                </motion.h2>
              )}
            </AnimatePresence>
            
            <div className="space-y-1">
              {secondaryNavItems.map(({ path, label, icon: Icon, badge }) => (
                <Link key={path} to={path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={location.pathname === path ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start relative group",
                        isCollapsed ? "px-2" : "px-3",
                        location.pathname === path && "bg-primary/10 text-primary border-r-2 border-primary"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isCollapsed ? "mx-auto" : "mr-3")} />
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
                      
                      {/* Badge */}
                      {badge && (
                        <>
                          {!isCollapsed ? (
                            <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {badge}
                            </Badge>
                          ) : (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                          )}
                        </>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {label}
                          {badge && (
                            <Badge variant="destructive" className="ml-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                              {badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;