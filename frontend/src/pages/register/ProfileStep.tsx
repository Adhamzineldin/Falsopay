
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onNext: () => void;
  isVerifying: boolean;
};

const ProfileStep = ({
  firstName, lastName, email, onChange, onBack, onNext, isVerifying
}: Props) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          placeholder="Enter your first name"
          value={firstName}
          onChange={onChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          placeholder="Enter your last name"
          value={lastName}
          onChange={onChange}
          required
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={onChange}
        required
      />
    </div>
    <div className="flex space-x-4">
      <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
        Back
      </Button>
      <Button type="button" className="flex-1" onClick={onNext} disabled={isVerifying}>
        {isVerifying ? 'Sending Code...' : 'Next'}
      </Button>
    </div>
  </div>
);

export default ProfileStep;
