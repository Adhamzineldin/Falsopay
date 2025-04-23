
import { Button } from '@/components/ui/button';
import PinVerification from '@/components/PinVerification';

type Props = {
  email: string;
  onPinSubmit: (code: string) => void;
  onResend: () => void;
  isLoading: boolean;
  expectedPin: string;
  onBack: () => void;
};

const EmailVerifyStep = ({ email, onPinSubmit, onResend, isLoading, expectedPin, onBack }: Props) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="text-center mb-4">
      <p className="text-sm text-gray-500">
        We've sent a verification code to {email}.
        Enter the 6-digit code below to complete your registration.
      </p>
    </div>
    <div className="w-full flex justify-center">
      <PinVerification
        onPinSubmit={onPinSubmit}
        onResend={onResend}
        isLoading={isLoading}
        title="Email Verification"
        maxLength={6}
        expectedPin={expectedPin}
      />
    </div>
    <div className="pt-4">
      <Button type="button" variant="outline" className="w-full" onClick={onBack}>
        Back
      </Button>
    </div>
  </div>
);

export default EmailVerifyStep;
