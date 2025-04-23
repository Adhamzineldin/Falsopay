
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import PinVerification from '@/components/PinVerification';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ipaAddress, setIpaAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationPin, setVerificationPin] = useState('');
  const { login, verifyLoginCode } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationStep) {
      if (!phoneNumber || !ipaAddress) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      try {
        const result = await login(phoneNumber, ipaAddress);
        if (result && result.success) {
          if (result.code) {
            // If a verification code was returned, we need to verify
            setVerificationPin(result.code);
            setVerificationStep(true);
          }
          // If no code was returned but successful, the user is already logged in
          // and redirected by the login function
        }
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerificationSubmit = async (code: string) => {
    if (!code || code.length !== 4) {
      toast({
        title: "Error",
        description: "Please enter the 4-digit verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Pass the code as the "IPA address" for verification
      await verifyLoginCode(phoneNumber, code);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const result = await login(phoneNumber, ipaAddress);
      if (result && result.code) {
        // Update the verification code
        setVerificationPin(result.code);
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your phone",
        });
      }
    } catch (error) {
      console.error('Resend code error:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setVerificationStep(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-falsopay-primary">FalsoPay</h1>
          </Link>
        </div>
        
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {verificationStep ? "Verify Your Phone" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {verificationStep 
                ? "Enter the verification code sent to your phone" 
                : "Login to access your FalsoPay account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!verificationStep ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ipaAddress">IPA Address</Label>
                  <Input
                    id="ipaAddress"
                    placeholder="Enter your IPA address"
                    value={ipaAddress}
                    onChange={(e) => setIpaAddress(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending Code...' : 'Request Code'}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">
                    Verification code sent to: {phoneNumber}
                  </p>
                </div>
                
                <div className="w-full flex justify-center">
                  <PinVerification
                    onPinSubmit={handleVerificationSubmit}
                    isLoading={isLoading}
                    title="Enter Verification Code"
                    maxLength={4}
                    expectedPin={verificationPin}
                    onResend={handleResendCode}
                  />
                </div>
                
                <Button 
                  type="button" 
                  variant="link" 
                  className="mx-auto block" 
                  onClick={handleBackToLogin}
                >
                  Back to login
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-falsopay-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
