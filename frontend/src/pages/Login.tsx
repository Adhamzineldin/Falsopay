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
      
      // Clean up phone number format, remove spaces, dashes, etc.
      const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
      
      setIsLoading(true);
      try {
        // Pass the actual IPA address (not null) to ensure it's included in the request
        const result = await login(cleanPhoneNumber, ipaAddress);
        
        // Only proceed to verification step if we got a successful response with a code
        if (result && result.success && result.code) {
          setVerificationPin(result.code);
          setVerificationStep(true);
        }
        // If login failed, we'll stay on the login form with values intact
      } catch (error) {
        console.error('Login error:', error);
        // Don't clear the form or change steps on error
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
      // Always pass the cleaned phone number and the code
      const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
      await verifyLoginCode(cleanPhoneNumber, code);
      // Don't do anything here - success will be handled by AppContext which will redirect
    } catch (error) {
      console.error('Verification error:', error);
      // On error, stay on the verification page - don't reset the form
      // Toast is already shown by AppContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setIsLoading(true);
    try {
      // Clean phone number and always pass the IPA address
      const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
      const result = await login(cleanPhoneNumber, ipaAddress);
      if (result && result.success && result.code) {
        // Update the verification code
        setVerificationPin(result.code);
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your phone",
        });
      }
      // If the request failed, we'll stay on the verification page with existing data
    } catch (error) {
      console.error('Resend code error:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      });
      // Keep the existing verification page state
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setVerificationStep(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[90%] sm:max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl sm:text-3xl font-bold text-falsopay-primary">FalsoPay</h1>
          </Link>
        </div>
        
        <Card className="animate-fade-in w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-center">
              {verificationStep ? "Verify Your Phone" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center text-sm">
              {verificationStep 
                ? "Enter the verification code sent to your phone" 
                : "Login to access your FalsoPay account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {!verificationStep ? (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-sm h-9"
                    required
                  />
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="ipaAddress" className="text-sm">IPA Address</Label>
                  <Input
                    id="ipaAddress"
                    placeholder="Enter your IPA address"
                    value={ipaAddress}
                    onChange={(e) => setIpaAddress(e.target.value)}
                    className="text-sm h-9"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full h-9 text-sm" disabled={isLoading}>
                  {isLoading ? 'Sending Code...' : 'Request Code'}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                <div className="text-center mb-2 sm:mb-4">
                  <p className="text-xs sm:text-sm text-gray-500">
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
                  className="mx-auto block text-sm" 
                  onClick={handleBackToLogin}
                >
                  Back to login
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-center text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-falsopay-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <Link to="/" className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 inline-flex items-center">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
