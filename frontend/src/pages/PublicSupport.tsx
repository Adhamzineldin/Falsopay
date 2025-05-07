import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ArrowLeft, RotateCw, HelpCircle } from 'lucide-react';
import api from '@/services/api';

const PublicSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Submit support request without requiring login
      const response = await api.post('/api/public/support', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber || null, // Optional
        subject: subject,
        message: message
      });
      
      toast({
        title: "Success",
        description: "Your support request has been submitted. We'll contact you via email.",
      });
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setSubject('');
      setMessage('');
      
    } catch (error) {
      console.error('Error submitting public support request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <HelpCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Contact Support</CardTitle>
            <CardDescription className="text-center">
              Submit your question or report an issue without logging in
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name<span className="text-red-500">*</span></Label>
                  <Input 
                    id="firstName" 
                    placeholder="Enter your first name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name<span className="text-red-500">*</span></Label>
                  <Input 
                    id="lastName" 
                    placeholder="Enter your last name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">We'll use this to contact you about your issue</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input 
                  id="phoneNumber" 
                  placeholder="Enter your phone number" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject<span className="text-red-500">*</span></Label>
                <Input 
                  id="subject" 
                  placeholder="Enter the subject of your request" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message<span className="text-red-500">*</span></Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue or question in detail" 
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  If you're experiencing issues with your account, please include your account details (like phone number) and problem description
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col space-y-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to home
                </Link>
              </div>
              
              <div className="text-center text-sm">
                <p>Already have an account? <Link to="/login" className="text-falsopay-primary hover:underline">Login</Link></p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PublicSupport; 