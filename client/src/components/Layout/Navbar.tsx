import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Palette, LogOut, Bell, Edit, Menu, User } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import ProfileDialog from '@/components/ProfileDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, setTheme, themes } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  // Keep notification badge fresh while navigating across pages.
  React.useEffect(() => {
    if (user?.role !== 'jobseeker') {
      return;
    }

    fetchNotifications(10, 1);

    const intervalId = setInterval(() => {
      fetchNotifications(10, 1);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchNotifications, user?.role]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.theme-dropdown') && !target.closest('.theme-dropdown-trigger')) {
        setThemeDropdownOpen(false);
      }
      if (!target.closest('.user-dropdown') && !target.closest('.user-dropdown-trigger')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close dropdowns on escape key
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setThemeDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile Sidebar Trigger */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo - Hidden on mobile when sidebar is available */}
            <Link to="/" className="hidden md:flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <Briefcase className="h-4 w-4 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                JobFinder AI
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Theme Dropdown */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                className="theme-dropdown-trigger"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              >
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </Button>
              
              {themeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="theme-dropdown absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg z-50"
                >
                  <div className="p-1">
                    {themes.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setTheme(t.name);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                          theme === t.name ? 'bg-accent' : ''
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ background: `linear-gradient(45deg, ${t.primary}, ${t.secondary})` }}
                        />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                className="user-dropdown-trigger relative h-8 w-8 rounded-full hover:opacity-80 transition-opacity"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </button>
              
              {userDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="user-dropdown absolute right-0 mt-2 w-56 bg-popover border rounded-md shadow-lg z-50"
                >
                  <div className="flex flex-col space-y-1 p-2 border-b">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setProfileDialogOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                    <Link 
                      to="/profile" 
                      className="w-full flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>View Profile</span>
                    </Link>
                  </div>
                  <div className="border-t p-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ProfileDialog 
        open={profileDialogOpen} 
        onOpenChange={setProfileDialogOpen} 
      />
    </motion.nav>
  );
};

export default Navbar;