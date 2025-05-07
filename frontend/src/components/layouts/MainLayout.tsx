import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  Home, 
  Send, 
  CreditCard, 
  User, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  ArrowRight,
  Wallet, 
  BarChart4,
  Star,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import WebSocketService from '@/services/websocket.service';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useApp();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = WebSocketService.subscribe('transaction_notification', (data) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(count => count + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/send-money', label: 'Send Money', icon: Send },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/accounts', label: 'Accounts', icon: BarChart4 },
    { path: '/manage-favorites', label: 'Favorites', icon: Star },
    { path: '/support', label: 'Support', icon: HelpCircle },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // Admin navigation items (only shown to admin users)
  const adminItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
  ];

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-2xl font-bold text-falsopay-primary">FalsoPay</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-falsopay-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-40 animate-fade-in">
                  <div className="p-4 bg-falsopay-primary text-white flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-white/80 hover:text-white"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={cn(
                            "p-3 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer",
                            notification.read ? "bg-white" : "bg-blue-50"
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-falsopay-primary text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16">
          <div className="py-6 flex flex-col h-full">
            <nav className="space-y-1 px-3 flex-1" key={`nav-${isAdmin ? 'admin' : 'user'}`}>
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.path
                      ? "bg-falsopay-primary text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mr-3",
                    location.pathname === item.path
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {item.label}
                </Link>
              ))}
              
              {/* Admin section - only shown to admins */}
              {isAdmin && (
                <>
                  <Separator className="my-4" />
                  <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </div>
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        location.pathname === item.path
                          ? "bg-falsopay-primary text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 mr-3",
                        location.pathname === item.path
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-500"
                      )} />
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
            
            <div className="mt-6 px-6">
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Logged in as</p>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{user?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </aside>
        
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-50">
            <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white flex flex-col animate-slide-in">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-falsopay-primary">FalsoPay</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-falsopay-primary text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 p-4 space-y-1" key={`mobile-nav-${isAdmin ? 'admin' : 'user'}`}>
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      location.pathname === item.path
                        ? "bg-falsopay-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 mr-3",
                      location.pathname === item.path
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500"
                    )} />
                    {item.label}
                  </Link>
                ))}
                
                {/* Admin section - only shown to admins in mobile view */}
                {isAdmin && (
                  <>
                    <Separator className="my-4" />
                    <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin
                    </div>
                    {adminItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                          location.pathname === item.path
                            ? "bg-falsopay-primary text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 mr-3",
                          location.pathname === item.path
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-500"
                        )} />
                        {item.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
              
              <div className="p-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={logout}
                >
                  <span className="flex items-center">
                    <LogOut className="h-5 w-5 mr-2" />
                    Log out
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
