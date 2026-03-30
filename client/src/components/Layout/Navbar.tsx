import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Palette, LogOut, Bell, Menu, User, CheckCheck, Trash2 } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveAssetUrl, cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, setTheme, themes } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAllAsRead, markAsRead, deleteNotification } = useNotificationStore();
  const [themeDropdownOpen, setThemeDropdownOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = React.useState(false);
  const [notificationBusy, setNotificationBusy] = React.useState(false);
  const [showAllNotifications, setShowAllNotifications] = React.useState(false);
  const avatarUrl = resolveAssetUrl(user?.avatar);
  const isAdmin = user?.role === 'admin';
  const isJobSeeker = user?.role === 'jobseeker';
  const visibleNotifications = React.useMemo(
    () => (showAllNotifications ? notifications : notifications.slice(0, 3)),
    [notifications, showAllNotifications],
  );

  React.useEffect(() => {
    if (!user) return;

    void fetchNotifications(isJobSeeker ? (showAllNotifications ? 10 : 3) : 1, 1);
    const intervalId = setInterval(() => {
      void fetchNotifications(isJobSeeker ? (showAllNotifications ? 10 : 3) : 1, 1);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchNotifications, isJobSeeker, showAllNotifications, user]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.theme-dropdown') && !target.closest('.theme-dropdown-trigger')) setThemeDropdownOpen(false);
      if (!target.closest('.user-dropdown') && !target.closest('.user-dropdown-trigger')) setUserDropdownOpen(false);
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-dropdown-trigger')) setNotificationDropdownOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setThemeDropdownOpen(false);
        setUserDropdownOpen(false);
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  const openNotifications = async () => {
    setNotificationDropdownOpen((open) => !open);
    await fetchNotifications(showAllNotifications ? 10 : 3, 1);
  };

  const handleMarkAllAsRead = async () => {
    setNotificationBusy(true);
    try {
      await markAllAsRead();
      toast({ title: 'Notifications updated', description: 'All notifications have been marked as read.' });
    } catch {
      toast({ title: 'Could not update notifications', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setNotificationBusy(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      toast({ title: 'Notification removed', description: 'The notification has been deleted.' });
    } catch {
      toast({ title: 'Delete failed', description: 'Could not delete this notification.', variant: 'destructive' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto h-full w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={onToggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/" className="flex min-w-0 items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary"
              >
                <Briefcase className="h-4 w-4 text-white" />
              </motion.div>
              <span className="hidden truncate bg-gradient-to-r from-primary to-secondary bg-clip-text text-lg font-bold text-transparent sm:block md:text-xl">
                JobFinder AI
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {isJobSeeker ? (
              <div className="relative">
                <Button variant="ghost" size="sm" className="notification-dropdown-trigger relative" onClick={() => void openNotifications()}>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 ? (
                    <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  ) : null}
                </Button>

                {notificationDropdownOpen ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.1 }}
                    className="notification-dropdown absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border bg-popover shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">Notifications</p>
                        <p className="text-xs text-muted-foreground">Latest activity for your applications and interviews</p>
                      </div>
                      <Button variant="ghost" size="sm" disabled={notificationBusy || unreadCount === 0} onClick={() => void handleMarkAllAsRead()}>
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      {visibleNotifications.length > 0 ? visibleNotifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={cn(
                            'w-full rounded-xl border p-3 text-left transition-colors hover:bg-accent/70',
                            notification.read ? 'border-transparent bg-background/40' : 'border-primary/20 bg-primary/5',
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <button type="button" onClick={() => void markAsRead(notification._id)} className="min-w-0 flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium">{notification.title}</p>
                                {!notification.read ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.description}</p>
                              <p className="mt-2 text-[11px] text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteNotification(notification._id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="px-3 py-8 text-center">
                          <p className="text-sm font-medium">No notifications yet</p>
                          <p className="mt-1 text-xs text-muted-foreground">Interview updates and job activity will appear here.</p>
                        </div>
                      )}
                      {notifications.length > 3 ? (
                        <div className="px-2 pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => setShowAllNotifications((current) => !current)}
                          >
                            {showAllNotifications ? 'Show less' : 'More notifications'}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </div>
            ) : null}

            <div className="relative">
              <Button variant="outline" size="sm" className="theme-dropdown-trigger px-2.5 sm:px-3" onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}>
                <Palette className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Theme</span>
              </Button>

              {themeDropdownOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.1 }}
                  className="theme-dropdown absolute right-0 z-50 mt-2 w-48 max-w-[calc(100vw-1.5rem)] rounded-md border bg-popover shadow-lg"
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
                        <div className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(45deg, ${t.primary}, ${t.secondary})` }} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="relative">
              <button className="user-dropdown-trigger relative h-8 w-8 rounded-full transition-opacity hover:opacity-80" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={user?.name} />
                  <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </button>

              {userDropdownOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.1 }}
                  className="user-dropdown absolute right-0 z-50 mt-2 w-56 rounded-md border bg-popover shadow-lg"
                >
                  <div className="flex flex-col space-y-1 border-b p-2">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                  {!isAdmin ? (
                    <div className="p-1">
                      <Link
                        to="/profile"
                        className="flex w-full items-center rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>View Profile</span>
                      </Link>
                    </div>
                  ) : null}
                  <div className="border-t p-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="flex w-full items-center rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
