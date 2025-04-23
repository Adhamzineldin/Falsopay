
import { Button } from '@/components/ui/button';
import PinVerification from '@/components/PinVerification';

type Props = {
  phoneNumber: string;
  onPinSubmit: (code: string) => void;
  onResend: () => void;
  expectedPin: string;
};

const PhoneVerifyStep = ({ phoneNumber, onPinSubmit, onResend, expectedPin }: Props) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="text-center mb-4">
      <p className="text-sm text-gray-500">
        We've sent a verification code to {phoneNumber}.
        Enter the 6-digit code below.
      </p>
    </div>
    <div className="w-full flex justify-center">
      <PinVerification
        onPinSubmit={onPinSubmit}
        onResend={onResend}
        title="Phone Verification"
        maxLength={6}
        expectedPin={expectedPin}
      />
    </div>
  </div>
);

export default PhoneVerifyStep;
