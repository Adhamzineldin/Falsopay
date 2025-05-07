import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ShieldCheck,
  BanknoteIcon,
  Clock,
  Check,
  ExternalLink
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import WebSocketService from '@/services/websocket.service';
import { toast } from '@/components/ui/sonner';
import moneyRequestService from '@/services/money-request.service';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface MoneyRequest {
  request_id: number;
  requester_name: string;
  requester_ipa_address: string;
  amount: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<MoneyRequest[]>([]);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Load pending money requests
    loadPendingRequests();

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
    
    const unsubscribeMoneyRequests = WebSocketService.subscribe('money_request', (data) => {
      if (data.action === 'new') {
        // Load pending requests to update the counter
        loadPendingRequests();
        
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: 'Money Request',
          message: `${data.data.requester_name} requested ${formatCurrency(data.data.amount)}`,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(count => count + 1);
      } else if (data.action === 'accepted') {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: 'Money Request Accepted',
          message: `Your request has been accepted and payment received`,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(count => count + 1);
      } else if (data.action === 'declined') {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: 'Money Request Declined',
          message: `Your request has been declined`,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(count => count + 1);
      }
    });
    
    return () => {
      unsubscribe();
      unsubscribeMoneyRequests();
    };
  }, []);

  const loadPendingRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const response = await moneyRequestService.getPendingRequests();
      if (response.success) {
        setPendingRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const acceptRequest = async (requestId: number) => {
    try {
      setProcessingRequestId(requestId);
      const response = await moneyRequestService.acceptRequest(requestId);
      
      if (response.success) {
        // Handle WhatsApp notification response
        if (response.whatsapp_notification) {
          // If we received a WhatsApp notification response
          toast.success('Money request accepted', {
            description: response.message || 'Payment was sent successfully with notification.'
          });
        } else {
          // Original success handling
          toast.success('Money request accepted', {
            description: `Payment of ${formatCurrency(response.data?.request?.amount)} was sent successfully`
          });
        }
        
        // Remove the request from the list
        setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
      } else {
        toast.error('Failed to accept request', {
          description: response.message
        });
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    } finally {
      setProcessingRequestId(null);
      loadPendingRequests();
    }
  };

  const declineRequest = async (requestId: number) => {
    try {
      setProcessingRequestId(requestId);
      const response = await moneyRequestService.declineRequest(requestId);
      
      if (response.success) {
        // Remove the request from the list
        setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
        toast.success('Money request declined');
      } else {
        toast.error('Failed to decline request', {
          description: response.message
        });
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    } finally {
      setProcessingRequestId(null);
      loadPendingRequests();
    }
  };

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
    { path: '/money-requests', label: 'Money Requests', icon: BanknoteIcon },
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
            {/* Pending Money Requests */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowPendingRequests(!showPendingRequests);
                  setShowNotifications(false);
                }}
                className="relative"
              >
                <BanknoteIcon className="h-5 w-5" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                  </span>
                )}
              </Button>
              
              {showPendingRequests && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-40 animate-fade-in">
                  <div className="p-4 bg-falsopay-primary text-white flex justify-between items-center">
                    <h3 className="font-medium">Pending Requests</h3>
                    <Button 
                      variant="link" 
                      className="text-xs text-white/80 hover:text-white p-0 h-auto"
                      onClick={() => {
                        setShowPendingRequests(false);
                        navigate('/money-requests');
                      }}
                    >
                      View All
                    </Button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingRequests ? (
                      <div className="p-8 flex justify-center">
                        <Clock className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : pendingRequests.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No pending requests
                      </div>
                    ) : (
                      <>
                        {pendingRequests.map((request) => (
                          <div 
                            key={request.request_id}
                            className="p-3 border-b border-gray-200 hover:bg-gray-50 transition"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-sm">{request.requester_name}</h4>
                              <span className="text-sm font-semibold text-primary">
                                {formatCurrency(request.amount)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{request.requester_ipa_address}</p>
                            {request.message && (
                              <p className="text-xs italic text-gray-500 mb-2">"{request.message}"</p>
                            )}
                            <div className="flex justify-end gap-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => declineRequest(request.request_id)}
                                disabled={processingRequestId === request.request_id}
                              >
                                {processingRequestId === request.request_id ? (
                                  <Clock className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <X className="h-3 w-3 mr-1" />
                                )}
                                Decline
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setShowPendingRequests(false);
                                  navigate(`/money-requests?accept=${request.request_id}`);
                                }}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Pay
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="p-3 text-center">
                          <Button 
                            variant="link" 
                            className="text-xs text-primary"
                            onClick={() => {
                              setShowPendingRequests(false);
                              navigate('/money-requests');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View all requests
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowPendingRequests(false);
                }}
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
