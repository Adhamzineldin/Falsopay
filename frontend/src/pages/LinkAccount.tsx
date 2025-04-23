import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { BankAccountService } from '@/services/bank-account.service';
import { IPAService } from '@/services/ipa.service';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CreditCard, ArrowLeft, Shield, Fingerprint } from 'lucide-react';
import BankSelect, { Bank } from '@/components/BankSelect';
import PinVerification from '@/components/PinVerification';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {CardData, CardService} from "@/services/card.service.ts";

const LinkAccount = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [ipaAddress, setIpaAddress] = useState('');
  const [ipaPin, setIpaPin] = useState('');
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

    if (!user || !user.phone_number) {
      toast({
        title: "User Information Missing",
        description: "Your phone number is required to link an account",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateCardDetails()) return;
      setStep(2);
    } else if (step === 3) {
      // Move to IPA setup step
      setStep(4);
    }
  };

  const handlePinSubmit = async (pin: string) => {
    console.log("PIN received:", pin);
    setCardPin(pin);
    await linkAccount(pin);
  };

  const linkAccount = async (pin: string) => {
    if (!user || !selectedBank || !cardNumber) return;

    setIsLoading(true);
    setErrorMessage('');

    let card_response;
    try {
      // Call the backend service with the required fields
      const response = await BankAccountService.linkAccountToService({
        card_number: cardNumber,
        phone_number: user.phone_number,
        bank_id: selectedBank.bank_id,
        card_pin: pin,
      });

      // Handle successful response - the backend returns bank accounts
      const card_response:CardData = await CardService.getCardByNumber(cardNumber, selectedBank.bank_id)
      const accounts_linked_to_card = await BankAccountService.getAccountsByUserIdAndBankId(card_response.bank_user_id, card_response.bank_id);
      console.log(accounts_linked_to_card)
      setBankAccounts(accounts_linked_to_card);

      // Generate a random verification code (in a real app, this would be sent by the backend)
      const newVerificationPin = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationPinCode(newVerificationPin);

      toast({
        title: "Card Verified",
        description: "A verification code has been sent to your phone number",
      });

      // Move to verification code step
      setStep(3);
    } catch (error) {
      console.error('Error linking account:', error);

      // Extract error message from the response if available
      let errorDesc = "Could not link your bank account. Please check your details and try again.";
      if (error.response && error.response.data && error.response.data.error) {
        errorDesc = error.response.data.error;
        setErrorMessage(errorDesc);
      }

      toast({
        title: "Link Failed",
        description: errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCodeSubmit = (code: string) => {
    setVerificationCode(code);
    toast({
      title: "Verification Successful",
      description: "Your phone number has been verified. Please set up your IPA details.",
    });
    setStep(4);
  };

  const handleVerificationCodeResend = () => {
    const newVerificationPin = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationPinCode(newVerificationPin);
    toast({
      title: "New Code Sent",
      description: "A new verification code has been sent to your registered phone number",
    });
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleIPASetup = async () => {
    if (!selectedAccount || !ipaAddress || !ipaPin || !user || !selectedBank) {
      toast({
        title: "Missing Information",
        description: "Please provide both IPA address and PIN",
        variant: "destructive",
      });
      return;
    }

    if (ipaPin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 6-digit PIN",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call IPA service to register the IPA address and PIN
      // Including user_id and bank_id as requested
      await IPAService.createIPA({
        user_id: user.user_id,
        bank_id: selectedBank.bank_id,
        ipa_address: ipaAddress,
        pin: ipaPin,
        account_number: selectedAccount.account_number,
      });

      toast({
        title: "Success",
        description: "Your IPA address has been set up successfully",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error setting up IPA:', error);
      toast({
        title: "Setup Failed",
        description: "Could not set up your IPA address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency function
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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
                {step <= 2 && <CreditCard className="h-6 w-6 mr-2" />}
                {step === 3 && <Shield className="h-6 w-6 mr-2" />}
                {step === 4 && <Fingerprint className="h-6 w-6 mr-2" />}
                {step <= 2 ? "Link Bank Account" : step === 3 ? "Verify Your Identity" : "Set Up IPA"}
              </CardTitle>
              <CardDescription className="text-center">
                {step === 1 && "Step 1: Enter your card details"}
                {step === 2 && "Step 2: Enter your card PIN"}
                {step === 3 && "Step 3: Enter verification code sent to your phone"}
                {step === 4 && "Step 4: Set up your IPA address and PIN"}
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

                    {user && (
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                              id="phoneNumber"
                              disabled
                              value={user.phone_number || ''}
                          />
                          <p className="text-xs text-gray-500">This is the phone number registered with your bank account</p>
                        </div>
                    )}

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

                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-4">
                          {errorMessage}
                        </div>
                    )}

                    <PinVerification
                        onPinSubmit={handlePinSubmit}
                        loading={isLoading}
                        title="Enter Card PIN"
                        maxLength={6}
                    />
                  </div>
              )}

              {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-500">
                        We've sent a verification code to your registered phone number.
                        Please enter it below to verify your identity.
                      </p>
                    </div>

                    <PinVerification
                        onPinSubmit={handleVerificationCodeSubmit}
                        loading={isLoading}
                        title="Enter Verification Code"
                        expectedPin={verificationPinCode}
                        onResend={handleVerificationCodeResend}
                        maxLength={6}
                    />
                  </div>
              )}

              {step === 4 && (
                  <div className="space-y-6">
                    <div className="mb-4">
                      <h3 className="font-medium mb-3">Select an Account</h3>
                      <div className="space-y-2">
                        {bankAccounts.map((account, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg cursor-pointer border ${selectedAccount === account ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'}`}
                                onClick={() => handleAccountSelect(account)}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <p className="font-medium">{account.account_name || 'Account'}</p>
                                <span className="text-sm font-medium text-green-600">
                                  {formatCurrency(account.balance)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Account No: {account.account_number}</span>
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                  {account.account_type || 'Checking'}
                                </span>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ipaAddress">IPA Address</Label>
                      <Input
                          id="ipaAddress"
                          placeholder="Enter your desired IPA address"
                          value={ipaAddress}
                          onChange={(e) => setIpaAddress(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">This will be your unique identifier for payments</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ipaPin">IPA PIN</Label>
                      <div className="flex justify-center items-center">
                        <InputOTP
                            maxLength={6}
                            value={ipaPin}
                            onChange={setIpaPin}
                            autoFocus
                            render={({ slots }) => (
                                <InputOTPGroup>
                                  {slots.map((slot, i) => (
                                      <InputOTPSlot key={i} {...slot} />
                                  ))}
                                </InputOTPGroup>
                            )}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">You'll use this PIN to authorize transactions</p>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleIPASetup}
                        disabled={isLoading || !selectedAccount || !ipaAddress || ipaPin.length !== 6}
                    >
                      Complete Setup
                    </Button>
                  </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-center pb-6">
              <p className="text-xs text-gray-500 text-center max-w-md">
                {step <= 2 && "By linking your bank account, you authorize FalsoPay to verify your identity and access your account information in accordance with our terms of service and privacy policy."}
                {step === 3 && "Your security is important to us. The verification code ensures that only you can link your bank account to FalsoPay."}
                {step === 4 && "Your IPA address will be your unique identifier for receiving payments. Keep your IPA PIN safe and do not share it with anyone."}
              </p>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
  );
};

export default LinkAccount;