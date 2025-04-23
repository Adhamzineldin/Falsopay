import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone } from 'lucide-react';
import { UserService } from '@/services/user.service';

interface ChangePhoneNumberProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const ChangePhoneNumber: React.FC<ChangePhoneNumberProps> = ({ onCancel, onSuccess }) => {
  const { user, updateUserData } = useApp();
  const [step, setStep] = useState(1);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendVerificationCode = async () => {
    if (!newPhoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a new phone number",
        variant: "destructive",
      });
      return;
    }

    if (newPhoneNumber === user?.phone_number) {
      toast({
        title: "Error",
        description: "The new phone number is the same as your current one",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // In a real app, you would call an API to send the verification code
      // For now, we'll simulate a delay and success
      setTimeout(() => {
        toast({
          title: "Verification Code Sent",
          description: "A verification code has been sent to your new phone number",
        });
        setStep(2);
        setIsSending(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
      setIsSending(false);
    }
  };

  const handleSubmit = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would verify the code with an API
      // and then update the phone number if verification is successful
      
      // Update user data
      if (user) {
        await updateUserData({
          phone_number: newPhoneNumber
        });
      }
      
      toast({
        title: "Success",
        description: "Your phone number has been updated successfully",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update your phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
          <Phone className="h-5 w-5 mr-2" />
          Change Phone Number
        </CardTitle>
        <CardDescription className="text-center">
          {step === 1 
            ? "Enter your new phone number" 
            : "Verify your new phone number"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === 1 ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="currentPhoneNumber">Current Phone Number</Label>
              <Input
                id="currentPhoneNumber"
                value={user?.phone_number || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPhoneNumber">New Phone Number</Label>
              <Input
                id="newPhoneNumber"
                placeholder="Enter your new phone number"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleSendVerificationCode}
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Continue'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">
                We've sent a verification code to {newPhoneNumber}.
                Enter the 6-digit code below.
              </p>
            </div>
            
            <div className="flex justify-center py-4">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot />
                  <InputOTPSlot />
                  <InputOTPSlot />
                  <InputOTPSlot />
                  <InputOTPSlot />
                  <InputOTPSlot />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-xs"
                onClick={() => {
                  toast({
                    title: "Code Resent",
                    description: "A new verification code has been sent to your new phone number"
                  });
                }}
              >
                Didn't receive a code? Resend
              </Button>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Phone Number'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <p className="text-xs text-gray-500 text-center max-w-xs">
          For security purposes, we'll verify your new phone number with a code.
          Your phone number is used for account recovery and security notifications.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ChangePhoneNumber;
