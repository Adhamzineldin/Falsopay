
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { BankAccountService } from '@/services/bank-account.service';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CreditCard, ArrowLeft } from 'lucide-react';
import BankSelect, { Bank } from '@/components/BankSelect';
import PinVerification from '@/components/PinVerification';

const LinkAccount = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [cardPinCode, setCardPinCode] = useState('');
  const [verificationPinCode, setVerificationPinCode] = useState('');
  const { user } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBankSelect = (bank: Bank) => {
    console.log("Selected bank:", bank);
    setSelectedBank(bank);
  };

  const validateCardDetails = () => {
    if (!selectedBank) {
      toast({
        title: "Bank Required",
        description: "Please select your bank",
        variant: "destructive",
      });
      return false;
    }

    if (!cardNumber || cardNumber.length < 16) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateCardDetails()) return;
      // Generate a random PIN for card verification
      const newCardPin = Math.floor(1000 + Math.random() * 9000).toString();
      setCardPinCode(newCardPin);
      setStep(2);
    }
  };

  const handlePinSubmit = (pin: string) => {
    console.log("PIN received:", pin);
    setCardPin(pin);
    sendVerificationCode();
  };

  const sendVerificationCode = async () => {
    if (!user || !selectedBank || !cardNumber) return;

    setIsVerifying(true);
    try {
      const newVerificationPin = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationPinCode(newVerificationPin);
      
      toast({
        title: "Verification Code Sent",
        description: "A verification code has been sent to your registered phone number",
      });
      setStep(3);
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: "Could not send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCardPinResend = () => {
    // Generate a new random PIN for card verification
    const newCardPin = Math.floor(1000 + Math.random() * 9000).toString();
    setCardPinCode(newCardPin);
    toast({
      title: "New PIN Generated",
      description: "A new PIN has been generated for verification",
    });
  };

  const handleVerificationCodeResend = () => {
    const newVerificationPin = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationPinCode(newVerificationPin);
    toast({
      title: "New Code Sent",
      description: "A new verification code has been sent to your registered phone number",
    });
  };

  const handleVerificationSubmit = async (code: string) => {
    setVerificationCode(code);
    await linkAccount(code);
  };

  const linkAccount = async (code: string) => {
    if (!user || !selectedBank || !cardNumber || !cardPin) return;

    setIsLoading(true);
    try {
      await BankAccountService.linkAccountToService({
        card_number: cardNumber,
        phone_number: user.phone_number,
        bank_id: selectedBank.bank_id,
        card_pin: cardPin,
      });

      toast({
        title: "Success",
        description: "Your bank account has been successfully linked to FalsoPay",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error linking account:', error);
      toast({
        title: "Link Failed",
        description: "Could not link your bank account. Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
            className="flex items-center text-gray-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step > 1 ? 'Back' : 'Dashboard'}
          </Button>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <CreditCard className="h-6 w-6 mr-2" />
              Link Bank Account
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Step 1: Enter your card details"}
              {step === 2 && "Step 2: Enter your card PIN"}
              {step === 3 && "Step 3: Verify your identity"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bank">Select Your Bank</Label>
                  <BankSelect 
                    onBankSelect={handleBankSelect} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="Enter your card number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  Next
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">
                    Please enter the PIN for your card ending in {cardNumber.slice(-4)}
                  </p>
                </div>

                <PinVerification 
                  onPinSubmit={handlePinSubmit} 
                  loading={isVerifying}
                  title="Enter Card PIN"
                  expectedPin={cardPinCode}
                  onResend={handleCardPinResend}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">
                    We've sent a verification code to your registered phone number.
                    Please enter it below to complete account linking.
                  </p>
                </div>

                <PinVerification 
                  onPinSubmit={handleVerificationSubmit} 
                  loading={isLoading}
                  title="Enter Verification Code"
                  expectedPin={verificationPinCode}
                  onResend={handleVerificationCodeResend}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center pb-6">
            <p className="text-xs text-gray-500 text-center max-w-md">
              By linking your bank account, you authorize FalsoPay to verify your identity and access your account information
              in accordance with our terms of service and privacy policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LinkAccount;
