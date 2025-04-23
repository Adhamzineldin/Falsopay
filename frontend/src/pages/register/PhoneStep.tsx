
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  phoneNumber: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  isPhoneChecking: boolean;
  isVerifying: boolean;
};

const PhoneStep = ({ phoneNumber, onChange, onNext, isPhoneChecking, isVerifying }: Props) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="phoneNumber">Phone Number</Label>
      <Input
        id="phoneNumber"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChange={onChange}
        required
      />
    </div>
    <Button 
      type="button" 
      className="w-full" 
      onClick={onNext}
      disabled={isPhoneChecking || isVerifying}
    >
      {isPhoneChecking ? 'Checking...' : isVerifying ? 'Sending Code...' : 'Next'}
    </Button>
  </div>
);

export default PhoneStep;
