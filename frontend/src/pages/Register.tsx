
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Add Button import
import { ArrowLeft } from 'lucide-react';
import PhoneStep from './register/PhoneStep';
import PhoneVerifyStep from './register/PhoneVerifyStep';
import ProfileStep from './register/ProfileStep';
import EmailVerifyStep from './register/EmailVerifyStep';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneChecking, setIsPhoneChecking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Simulate dynamically generated PINs per step!
  const [phonePin, setPhonePin] = useState('123456');
  const [emailPin, setEmailPin] = useState('123456');

  // Simulate "sending" a random PIN for each step
  const generatePin = () => `${Math.floor(100000 + Math.random() * 900000)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const checkPhoneNumberExists = async () => {
    if (!formData.phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return false;
    }

    setIsPhoneChecking(true);
    try {
      const exists = await AuthService.checkIfUserExists({ phone_number: formData.phoneNumber });
      if (exists) {
        toast({
          title: "Account Exists",
          description: "An account with this phone number already exists. Please log in instead.",
          variant: "destructive",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking phone number:', error);
      toast({
        title: "Error",
        description: "Failed to check phone number. Please try again.",
        variant: "destructive",
      });
      return true;
    } finally {
      setIsPhoneChecking(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!formData.phoneNumber) {
        toast({
          title: "Error",
          description: "Please enter your phone number",
          variant: "destructive",
        });
        return;
      }
      const exists = await checkPhoneNumberExists();
      if (exists) return;
      setIsVerifying(true);
      setTimeout(() => {
        const newPin = generatePin();
        setPhonePin(newPin);
        toast({
          title: "Verification Code Sent",
          description: "A verification code has been sent to your phone number",
        });
        setIsVerifying(false);
        setStep(2);
      }, 1000);
    } else if (step === 3) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      setIsVerifying(true);
      setTimeout(() => {
        const newEmailPin = generatePin();
        setEmailPin(newEmailPin);
        toast({
          title: "Verification Code Sent",
          description: "A verification code has been sent to your email",
        });
        setIsVerifying(false);
        setStep(4);
      }, 1000);
    }
  };

  const handlePhoneVerification = (code: string) => {
    if (code.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    if (code !== phonePin) {
      toast({
        title: "Error",
        description: "Incorrect verification code for phone",
        variant: "destructive",
      });
      return;
    }
    setStep(3);
  };

  const handleEmailVerification = async (code: string) => {
    if (code.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    if (code !== emailPin) {
      toast({
        title: "Error",
        description: "Incorrect verification code for email",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await AuthService.registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        email: formData.email,
      });
      toast({
        title: "Success",
        description: "Your account has been created successfully! You can now log in.",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // RESEND: sets new pin for each verification
  const handlePhoneResend = () => {
    const newPin = generatePin();
    setPhonePin(newPin);
    toast({
      title: "Code Resent",
      description: "A new verification code has been sent to your phone",
    });
  };
  const handleEmailResend = () => {
    const newPin = generatePin();
    setEmailPin(newPin);
    toast({
      title: "Code Resent",
      description: "A new verification code has been sent to your email",
    });
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
            <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Step 1: Enter your phone number"}
              {step === 2 && "Step 2: Verify your phone number"}
              {step === 3 && "Step 3: Complete your profile"}
              {step === 4 && "Step 4: Verify your email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <PhoneStep
                phoneNumber={formData.phoneNumber}
                onChange={handleChange}
                onNext={handleNextStep}
                isPhoneChecking={isPhoneChecking}
                isVerifying={isVerifying}
              />
            )}
            {step === 2 && (
              <>
                <PhoneVerifyStep
                  phoneNumber={formData.phoneNumber}
                  onPinSubmit={handlePhoneVerification}
                  onResend={handlePhoneResend}
                  expectedPin={phonePin}
                />
                <div className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
            {step === 3 && (
              <ProfileStep
                firstName={formData.firstName}
                lastName={formData.lastName}
                email={formData.email}
                onChange={handleChange}
                onBack={() => setStep(2)}
                onNext={handleNextStep}
                isVerifying={isVerifying}
              />
            )}
            {step === 4 && (
              <EmailVerifyStep
                email={formData.email}
                onPinSubmit={handleEmailVerification}
                onResend={handleEmailResend}
                isLoading={isLoading}
                expectedPin={emailPin}
                onBack={() => setStep(3)}
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-falsopay-primary hover:underline">
                Log in
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

export default Register;
