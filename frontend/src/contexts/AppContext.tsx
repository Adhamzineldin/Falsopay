import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { SystemService } from '@/services/system.service';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import WebSocketService from '@/services/websocket.service';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  default_account?: number;
  created_at?: string;
  role?: string;
  [key: string]: any;
}

interface MaintenanceState {
  isInMaintenance: boolean;
  message: string;
  isChecking: boolean;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  maintenance: MaintenanceState;
  login: (phone: string, ipa: string | null) => Promise<{success: boolean, code?: string, user?: User, token?: string, blocked?: boolean} | false>;
  verifyLoginCode: (phone: string, code: string, pendingData?: {user: User, token?: string}) => Promise<void>;
  logout: () => void;
  updateUserData: (data: Partial<User>) => Promise<void>;
  checkMaintenanceStatus: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [pendingLoginData, setPendingLoginData] = useState<{token?: string, user: User} | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceState>({
    isInMaintenance: false,
    message: '',
    isChecking: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkMaintenanceStatus = async (): Promise<boolean> => {
    setMaintenance(prev => ({ ...prev, isChecking: true }));
    try {
      // Try to fetch the system status
      await SystemService.getPublicSystemStatus();
      
      // If no error, the system is online
      setMaintenance({
        isInMaintenance: false,
        message: '',
        isChecking: false
      });
      return false;
    } catch (error: any) {
      console.error('Error connecting to backend:', error);
      
      // Only set maintenance mode if there's a network error or 5xx server error
      const isNetworkError = !error.response;
      
      if (isNetworkError) {
        setMaintenance({
          isInMaintenance: true,
          message: error.response?.data?.message || 'The system is currently undergoing maintenance. Please try again later.',
          isChecking: false
        });
        return true;
      }
      
      // Other types of errors (like 4xx) shouldn't trigger maintenance mode
      setMaintenance({
        isInMaintenance: false,
        message: '',
        isChecking: false
      });
      return false;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      // First check if system is in maintenance
      const isInMaintenance = await checkMaintenanceStatus();
      
      // Don't proceed with auth check if in maintenance mode
      if (isInMaintenance) {
        setIsLoading(false);
        return;
      }
      
      // Continue with regular auth check
      try {
        const isAuth = AuthService.isAuthenticated();
        console.log('Auth check result:', isAuth);

        if (isAuth) {
          const userData = localStorage.getItem('falsopay_user');
          console.log('Found user data in localStorage:', !!userData);

          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            // Set admin status immediately from local data
            const localIsAdmin = parsedUser.role === 'admin';
            setIsAdmin(localIsAdmin);
            console.log('Setting initial admin status from localStorage:', localIsAdmin);
            
            // Fetch user role from backend to prevent tampering
            if (parsedUser.user_id) {
              try {
                const role = await UserService.getUserRole(parsedUser.user_id);
                const backendIsAdmin = role === 'admin';
                setIsAdmin(backendIsAdmin);
                console.log('Updated admin status from backend:', backendIsAdmin);
                
                // Update local user data with fresh role from backend
                if (role) {
                  parsedUser.role = role;
                  localStorage.setItem('falsopay_user', JSON.stringify(parsedUser));
                }
              } catch (roleError) {
                console.error('Error fetching user role:', roleError);
                // Keep using the role from localStorage if backend request fails
              }
              
              WebSocketService.connect(parsedUser.user_id.toString());
              console.log('User authenticated and set:', parsedUser.user_id);
            }
          } else {
            AuthService.logout();
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          console.log('Not authenticated, token invalid or expired');
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        AuthService.logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  const login = async (phone: string, ipa: string | null): Promise<{success: boolean, code?: string, user?: User, token?: string, blocked?: boolean} | false> => {
    setIsLoading(true);

    try {
      console.log('Attempting to login with phone', ipa ? 'and IPA' : 'without IPA');
      try {
        // Step 1: Try to log in directly
        const loginResponse = await AuthService.login({
          phone_number: phone,
          ipa_address: ipa // This can be null for non-default accounts
        });

        // Check if user is blocked
        if (loginResponse.user && loginResponse.user.status === 'blocked') {
          console.log('User account is blocked');
          setIsLoading(false);
          toast({
            title: "Account Blocked",
            description: "Your account has been blocked. Please contact support for assistance.",
            variant: "destructive",
          });
          return { success: false, blocked: true };
        }

        // Step 2: Store token and user in pending state
        const token = loginResponse.user_token;
        const user = loginResponse.user;

        // Set the pending login data
        setPendingLoginData({ token, user });

        // Step 3: Generate a verification code locally
        // This simulates sending a code to the user's phone
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        console.log('Generated verification code:', verificationCode);

        // In a real app, you would send this code via SMS/notification
        // For this implementation, we just return it to be used directly

        toast({
          title: "Verification Code Generated",
          description: "Please enter the verification code (simulated)",
        });

        setIsLoading(false);
        // Also return the user and token data directly to avoid race conditions
        return { success: true, code: verificationCode, user: user, token: token };
      } catch (loginError: any) {
        console.error('Login error:', loginError);
        
        // Check if the error response indicates a blocked account
        if (loginError?.response?.data?.status === 'blocked' || 
            loginError?.response?.data?.message?.includes('blocked') || 
            loginError?.response?.data?.error?.includes('blocked')) {
          
          toast({
            title: "Account Blocked",
            description: "Your account has been blocked. Please contact support for assistance.",
            variant: "destructive",
          });
          setIsLoading(false);
          return { success: false, blocked: true };
        }
        
        // Show specific error message for IPA address issues
        if (ipa) {
          toast({
            title: "IPA Verification Failed",
            description: loginError?.response?.data?.message || "The IPA address you entered is invalid. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: loginError?.response?.data?.message || "Failed to login with phone number",
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
        // Return an object with success:false to signal failure without resetting the UI
        return { success: false };
      }
    } catch (error: any) {
      console.error('Login process error:', error);
      
      // Check for blocked account indication in the error
      if (error?.response?.data?.status === 'blocked' || 
          error?.response?.data?.message?.includes('blocked') || 
          error?.response?.data?.error?.includes('blocked')) {
        
        toast({
          title: "Account Blocked",
          description: "Your account has been blocked. Please contact support for assistance.",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false, blocked: true };
      }
      
      // Provide more specific error message based on context (IPA vs phone)
      toast({
        title: "Login Failed",
        description: ipa 
          ? "Failed to verify your IPA address. Please try again." 
          : (error.response?.data?.message || "Please check your credentials and try again"),
        variant: "destructive",
      });
      
      setIsLoading(false);
      // Return an object with success:false to signal failure without resetting the UI
      return { success: false };
    }
  };

  const verifyLoginCode = async (phone: string, code: string, pendingData?: {user: User, token?: string}) => {
    setIsLoading(true);

    try {
      // Use either provided pendingData or the state's pendingLoginData
      const loginData = pendingData || pendingLoginData;

      if (!loginData) {
        throw new Error("No pending login data found. Please try logging in again.");
      }

      // In a real app, you would verify the code with a server
      // Here we're just accepting any valid code provided by the login function

      const userData = loginData.user;
      const token = loginData.token;

      // Save the token and user data
      if (token) {
        AuthService.saveAuthToken(token);
      }

      // Set admin status based on role immediately
      const isUserAdmin = userData.role === 'admin';
      setIsAdmin(isUserAdmin);
      
      setUser(userData);
      setIsAuthenticated(true);
      setPendingLoginData(null);

      localStorage.setItem('falsopay_user', JSON.stringify(userData));
      console.log('User verified and logged in:', userData.user_id, 'Is admin:', isUserAdmin);

      WebSocketService.connect(userData.user_id.toString());
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);

    WebSocketService.disconnect();

    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const updateUserData = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await UserService.updateUser(user.user_id, data);
      const mergedUser = { ...user, ...updatedUser };
      setUser(mergedUser);
      
      // Set admin status if role is included in the update
      if (updatedUser.role !== undefined) {
        const updatedIsAdmin = updatedUser.role === 'admin';
        setIsAdmin(updatedIsAdmin);
        console.log('Updated admin status based on profile update:', updatedIsAdmin);
      }

      localStorage.setItem('falsopay_user', JSON.stringify(mergedUser));

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
      <AppContext.Provider
          value={{
            user,
            isAuthenticated,
            isLoading,
            isAdmin,
            maintenance,
            login,
            verifyLoginCode,
            logout,
            updateUserData,
            checkMaintenanceStatus,
          }}
      >
        {children}
      </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};