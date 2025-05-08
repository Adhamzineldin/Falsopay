import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw } from 'lucide-react';

interface PinVerificationProps {
  onVerify?: (success: boolean) => void;
  onPinSubmit?: (pin: string) => void;
  onResend?: () => void;
  loading?: boolean;
  isLoading?: boolean;
  title?: string;
  maxLength?: number;
  expectedPin?: string;
  ipaAddress?: string;
  hideVerifyButton?: boolean;
  autoSubmit?: boolean;
}

const PinVerification: React.FC<PinVerificationProps> = ({
  onVerify,
  onPinSubmit,
  onResend,
  loading,
  isLoading,
  title = "Enter PIN",
  maxLength = 4,
  expectedPin,
  ipaAddress,
  hideVerifyButton = false,
  autoSubmit = false,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resent, setResent] = useState(false);

  // Reset pin input when expectedPin changes
  useEffect(() => {
    setPin('');
    setError('');
  }, [expectedPin]);

  // Auto-submit when PIN is complete and autoSubmit is true
  useEffect(() => {
    if (autoSubmit && pin.length === maxLength && onPinSubmit && !verifying && !loading && !isLoading) {
      handleVerify();
    }
  }, [pin, autoSubmit, maxLength]);

  const handleVerify = async () => {
    if (pin.length !== maxLength) {
      setError(`PIN must be ${maxLength} digits`);
      return;
    }
    
    setVerifying(true);
    
    // If we have an expected PIN, verify locally
    if (expectedPin) {
      console.log(`Verifying PIN: ${pin}, Expected: ${expectedPin}`);
      setTimeout(() => {
        if (pin === expectedPin) {
          setError('');
          if (onVerify) onVerify(true);
          if (onPinSubmit) onPinSubmit(pin);
        } else {
          setError('Invalid code');
          if (onVerify) onVerify(false);
        }
        setVerifying(false);
      }, 500);
    } else {
      // Otherwise just submit the PIN
      if (onPinSubmit) {
        try {
          onPinSubmit(pin);
          setError('');
        } catch (error) {
          console.error('Error submitting PIN:', error);
          setError('Failed to submit PIN');
        } finally {
          setVerifying(false);
        }
      } else {
        setVerifying(false);
      }
    }
  };

  const handleResend = () => {
    if (onResend) {
      setResent(true);
      onResend();
      setTimeout(() => setResent(false), 2500);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col space-y-2 sm:space-y-4 w-full">
      <div className="space-y-2 w-full flex flex-col items-center">
        <Label htmlFor="pin-input" className="text-xs sm:text-sm">{title}</Label>
        <InputOTP
          maxLength={maxLength}
          value={pin}
          onChange={setPin}
          autoFocus
          render={({ slots }) => (
            <InputOTPGroup className="gap-1 sm:gap-2">
              {slots.map((slot, i) => (
                <InputOTPSlot 
                  key={i} 
                  {...slot} 
                  className="h-8 w-8 sm:h-10 sm:w-10 text-sm sm:text-base border-gray-300"
                />
              ))}
            </InputOTPGroup>
          )}
        />
        {error && <p className="text-xs sm:text-sm text-red-500 text-center mt-1">{error}</p>}
        
        {!hideVerifyButton && (
          <Button 
            onClick={handleVerify} 
            disabled={pin.length !== maxLength || loading || isLoading || verifying}
            className="w-full h-8 sm:h-10 text-xs sm:text-sm mt-2"
          >
            {verifying || loading || isLoading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        )}
        
        {onResend && (
          <Button
            type="button"
            variant="ghost"
            className="text-[10px] sm:text-xs flex items-center mt-1 sm:mt-2 h-6 sm:h-8"
            onClick={handleResend}
            disabled={resent}
          >
            <RefreshCw className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            {resent ? "Code Sent!" : "Resend Code"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PinVerification;
