import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Loader2, ArrowRight, CreditCard, Mail, MessageSquare } from 'lucide-react';
import moneyRequestService from '@/services/money-request.service';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RequestMoneyProps {
  onRequestSent?: () => void;
}

export function RequestMoney({ onRequestSent }: RequestMoneyProps) {
  const [amount, setAmount] = useState<string>('');
  const [ipaAddress, setIpaAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) return;
    
    // Limit to 2 decimal places
    const parts = value.split('.');
    if (parts[1] && parts[1].length > 2) return;
    
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !ipaAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await moneyRequestService.createRequest(amountNum, ipaAddress, message);
      
      if (response.success) {
        toast.success('Money request sent successfully');
        // Reset form
        setAmount('');
        setIpaAddress('');
        setMessage('');
        
        // Notify parent component
        if (onRequestSent) {
          onRequestSent();
        }
      } else {
        toast.error(response.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending money request:', error);
      toast.error('An error occurred while sending the request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md border-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-full">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Request Money</CardTitle>
            <CardDescription className="text-sm">Request funds from another FalsoPay user</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-6">
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription className="text-xs flex items-center gap-2">
              <Mail className="h-4 w-4" />
              The recipient will receive a notification once your request is sent
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Amount (EGP) *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="text-gray-500">EGP</span>
              </div>
              <Input
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                disabled={isSubmitting}
                required
                className="pl-12 text-lg font-medium h-12"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ipa" className="text-sm font-medium">IPA Address *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="ipa"
                placeholder="example@falsopay"
                value={ipaAddress}
                onChange={(e) => setIpaAddress(e.target.value)}
                disabled={isSubmitting}
                required
                className="pl-10 h-12"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="message" className="text-sm font-medium">Message</Label>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <MessageSquare className="h-4 w-4 text-gray-500" />
              </div>
              <Textarea
                id="message"
                placeholder="Add a message for the recipient..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="pl-10 resize-none"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 pb-6 px-6">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-12 font-medium shadow-sm transition-all hover:shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Request...
              </>
            ) : (
              <>
                Request Money
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 