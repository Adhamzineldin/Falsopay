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
  role?: string;
  [key: string]: any;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (phone: string, ipa: string | null) => Promise<{success: boolean, code?: string, user?: User, token?: string} | false>;
  verifyLoginCode: (phone: string, code: string, pendingData?: {user: User, token?: string}) => Promise<void>;
  logout: () => void;
  updateUserData: (data: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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
            
            // Fetch user role from backend to prevent tampering
            if (parsedUser.user_id) {
              const role = await UserService.getUserRole(parsedUser.user_id);
              setIsAdmin(role === 'admin');
              // Update local user data with fresh role from backend
              if (role) {
                parsedUser.role = role;
                localStorage.setItem('falsopay_user', JSON.stringify(parsedUser));
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

    checkAuth();

    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  const login = async (phone: string, ipa: string | null): Promise<{success: boolean, code?: string, user?: User, token?: string} | false> => {
    setIsLoading(true);

    try {
      console.log('Attempting to login with phone', ipa ? 'and IPA' : 'without IPA');
      try {
        // Step 1: Try to log in directly
        const loginResponse = await AuthService.login({
          phone_number: phone,
          ipa_address: ipa // This can be null for non-default accounts
        });

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
        toast({
          title: "Login Failed",
          description: ipa ? "Phone Number Or IPA Address is incorrect" : "Failed to login with phone number",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
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

      setUser(userData);
      setIsAuthenticated(true);
      setPendingLoginData(null);

      localStorage.setItem('falsopay_user', JSON.stringify(userData));
      console.log('User verified and logged in:', userData.user_id);

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
      
      if (data.role) {
        setIsAdmin(data.role === 'admin');
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