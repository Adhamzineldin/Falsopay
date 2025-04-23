
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
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
  [key: string]: any;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, ipa: string) => Promise<{success: boolean, code?: string} | false>;
  verifyLoginCode: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  updateUserData: (data: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingLoginData, setPendingLoginData] = useState<{token?: string, user: User} | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
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
            
            if (parsedUser.user_id) {
              WebSocketService.connect(parsedUser.user_id.toString());
              console.log('User authenticated and set:', parsedUser.user_id);
            }
          } else {
            AuthService.logout();
            setIsAuthenticated(false);
          }
        } else {
          console.log('Not authenticated, token invalid or expired');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        AuthService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  const login = async (phone: string, ipa: string): Promise<{success: boolean, code?: string} | false> => {
    setIsLoading(true);
    
    try {
      // First, try to login and get user info and token
      console.log('Attempting to login with phone and IPA');
      try {
        // Step 1: Try to log in directly
        const loginResponse = await AuthService.login({ 
          phone_number: phone, 
          ipa_address: ipa 
        });
        
        // Step 2: If login is successful, store token temporarily but don't save it yet
        // We'll save it after verification
        const token = loginResponse.user_token;
        const user = loginResponse.user;
        setPendingLoginData({ token, user });
        
        // Step 3: Send verification code
        const response = await AuthService.requestLoginCode(phone, ipa);
        
        if (response.success) {
          toast({
            title: "Verification Code Sent",
            description: "Please check your phone for the verification code",
          });
          
          setIsLoading(false);
          return response;
        } else {
          toast({
            title: "Failed to Send Verification",
            description: response.message || "Could not send verification code",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
      } catch (loginError) {
        toast({
            title: "Login Failed",
            description: "Phone Number Or IPA Address is incorrect",
            variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Login process error:', error);
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Please check your credentials and try again",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const verifyLoginCode = async (phone: string, code: string) => {
    setIsLoading(true);
    
    try {
      let userData;
      let token;
      
   
        
      userData = pendingLoginData.user;
      token = pendingLoginData.token; // Use the token from the first login
      
      
      
      // Save the token and user data
      if (token) {
        AuthService.saveAuthToken(token);
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      setPendingLoginData(null);
      
      localStorage.setItem('falsopay_user', JSON.stringify(userData));
      console.log('User verified and logged in:', userData.user_id);
      
      WebSocketService.connect(userData.user_id.toString());
      
      navigate('/dashboard');
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Invalid verification code",
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
      setUser({ ...user, ...updatedUser });
      
      localStorage.setItem('falsopay_user', JSON.stringify({ ...user, ...updatedUser }));
      
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
        login,
        verifyLoginCode,
        logout,
        updateUserData,
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
