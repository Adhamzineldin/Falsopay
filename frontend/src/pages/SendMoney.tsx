import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { TransactionService } from '@/services/transaction.service';
import { UserService } from '@/services/user.service';
import { IPAService, IpaData } from '@/services/ipa.service';
import { BankAccountService } from '@/services/bank-account.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle, Search, User, Send, CreditCard, Phone, Banknote } from 'lucide-react';
import PinVerification from '@/components/PinVerification';
import { useForm } from 'react-hook-form';
import BankSelect from '@/components/BankSelect';

type TransferMethod = 'ipa' | 'mobile' | 'card' | 'account' | 'iban';

interface Recipient {
  user_id: number;
  name: string;
  identifier: string;
}

interface FormValues {
  method: TransferMethod;
  identifier: string;
  bank_id?: string;
  amount: string;
  sourceIpaAddress: string;
}

const SendMoney = () => {
  const { user } = useApp();
  const [step, setStep] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [success, setSuccess] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<IpaData[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    defaultValues: {
      method: 'ipa',
      identifier: '',
      bank_id: '',
      amount: '',
      sourceIpaAddress: '',
    }
  });

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      if (!user?.user_id) return;
      
      setIsLoadingAccounts(true);
      try {
        const accounts = await IPAService.getIPAsByUserId(user.user_id);
        setLinkedAccounts(accounts);
        
        if (accounts.length > 0) {
          form.setValue('sourceIpaAddress', accounts[0].ipa_address);
        }
      } catch (error) {
        console.error('Error fetching linked accounts:', error);
        toast({
          title: "Error",
          description: "Could not load your linked accounts",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAccounts(false);
      }
    };
    
    fetchLinkedAccounts();
  }, [user, form, toast]);

  const searchRecipient = async (data: FormValues) => {
    if (!data.identifier) {
      toast({
        title: "Error",
        description: "Please enter recipient information",
        variant: "destructive",
      });
      return;
    }
    
    setSearchLoading(true);
    try {
      let userResponse;
      
      switch (data.method) {
        case 'ipa':
          const ipaResponse = await IPAService.getIPAByAddress(data.identifier);
          if (!ipaResponse || !ipaResponse.user_id) throw new Error('IPA not found');
          userResponse = await UserService.getUserById(ipaResponse.user_id);
          break;
          
        case 'mobile':
          userResponse = await UserService.getUserByPhone(data.identifier);
          break;
          
        case 'card':
          toast({
            title: "Not implemented",
            description: "Card lookup is not implemented in this demo",
          });
          throw new Error('Card lookup not implemented');
          
        case 'account':
          if (!data.bank_id) {
            toast({
              title: "Error", 
              description: "Please select a bank"
            });
            throw new Error('Bank not selected');
          }
          toast({
            title: "Not implemented",
            description: "Account lookup is not implemented in this demo",
          });
          throw new Error('Account lookup not implemented');
          
        case 'iban':
          const accountResponse = await BankAccountService.getAccountByIBAN(data.identifier);
          if (!accountResponse || !accountResponse.bank_user_id) throw new Error('IBAN not found');
          userResponse = await UserService.getUserById(accountResponse.bank_user_id);
          break;
          
        default:
          throw new Error('Invalid search method');
      }
      
      if (!userResponse) {
        toast({
          title: "Not Found",
          description: "No user found with the provided information",
          variant: "destructive",
        });
        return;
      }
      
      setRecipient({
        user_id: userResponse.user_id,
        name: `${userResponse.first_name} ${userResponse.last_name}`,
        identifier: data.identifier
      });
      
      setStep(2);
    } catch (error) {
      console.error('Error searching for recipient:', error);
      toast({
        title: "Error",
        description: "Failed to find recipient. Please check the information and try again.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAmountSubmit = async (data: FormValues) => {
    if (!recipient) return;
    
    if (!data.amount || parseFloat(data.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    setStep(3);
  };

  const handlePinSubmit = async (pin: string) => {
    if (!recipient) return;
    
    console.log('PIN submitted:', pin);
    handleSendMoney(pin);
  };

  const handleSendMoney = async (pin: string) => {
    if (!recipient) return;
    
    const amount = parseFloat(form.getValues('amount'));
    const sourceIpaAddress = form.getValues('sourceIpaAddress');
    
    setSendLoading(true);
    try {
      await TransactionService.sendMoney({
        sender_user_id: user?.user_id || 0,
        receiver_user_id: recipient.user_id,
        amount: amount,
        transaction_type: 'send',
        sender_ipa_address: sourceIpaAddress,
        pin: pin
      });
      
      setSuccess(true);
      setStep(4);
      
      toast({
        title: "Success",
        description: `You've sent €${amount} to ${recipient.name}`,
      });
    } catch (error) {
      console.error('Error sending money:', error);
      toast({
        title: "Transaction Failed",
        description: "Could not complete the transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setRecipient(null);
    setSuccess(false);
  };

  const getMethodName = (method: TransferMethod) => {
    switch(method) {
      case 'ipa': return 'IPA Address';
      case 'mobile': return 'Mobile Number';
      case 'card': return 'Card Number';
      case 'account': return 'Account Number';
      case 'iban': return 'IBAN';
      default: return method;
    }
  };

  const getMethodIcon = (method: TransferMethod) => {
    switch(method) {
      case 'ipa': return <User className="h-4 w-4" />;
      case 'mobile': return <Phone className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'account': return <Banknote className="h-4 w-4" />;
      case 'iban': return <Banknote className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Send Money</h1>
        
        <Card className="shadow-md">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Find Recipient</CardTitle>
                <CardDescription>Select how you want to send money</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {linkedAccounts.length === 0 && !isLoadingAccounts ? (
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
                    You don't have any linked accounts. Please link an account first to send money.
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(searchRecipient)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="sourceIpaAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Send from</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                              disabled={isLoadingAccounts}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={isLoadingAccounts ? "Loading accounts..." : "Select account"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {linkedAccounts.map((account) => (
                                  <SelectItem
                                    key={account.ipa_address}
                                    value={account.ipa_address}
                                  >
                                    {account.ipa_address} (Bank ID: {account.bank_id})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Send using</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-wrap gap-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="ipa" id="ipa" />
                                  <Label htmlFor="ipa" className="flex items-center gap-1">
                                    <User className="h-4 w-4" /> IPA Address
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="mobile" id="mobile" />
                                  <Label htmlFor="mobile" className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" /> Mobile Number
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="card" id="card" />
                                  <Label htmlFor="card" className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" /> Card Number
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="account" id="account" />
                                  <Label htmlFor="account" className="flex items-center gap-1">
                                    <Banknote className="h-4 w-4" /> Account Number
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="iban" id="iban" />
                                  <Label htmlFor="iban" className="flex items-center gap-1">
                                    <Banknote className="h-4 w-4" /> IBAN
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("method") === "account" && (
                        <FormField
                          control={form.control}
                          name="bank_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank</FormLabel>
                              <FormControl>
                                <BankSelect
                                  value={field.value}
                                  onChange={field.onChange}
                                  disabled={searchLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getMethodName(form.watch("method") as TransferMethod)}</FormLabel>
                            <div className="flex">
                              <FormControl>
                                <Input
                                  placeholder={`Enter ${getMethodName(form.watch("method") as TransferMethod).toLowerCase()}`}
                                  {...field}
                                  className="rounded-r-none"
                                />
                              </FormControl>
                              <Button 
                                type="submit" 
                                disabled={searchLoading || !field.value || !form.getValues("sourceIpaAddress")}
                                className="rounded-l-none"
                              >
                                {searchLoading ? 'Searching...' : <Search className="h-4 w-4" />}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                )}
              </CardContent>
            </>
          )}
          
          {step === 2 && recipient && (
            <>
              <CardHeader>
                <CardTitle>Enter Amount</CardTitle>
                <CardDescription>You're sending money to {recipient.name}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-falsopay-primary flex items-center justify-center text-white">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{recipient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {getMethodIcon(form.getValues("method") as TransferMethod)}
                        <span className="ml-1">{recipient.identifier}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAmountSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              min="0"
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between mt-4">
                      <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                      <Button 
                        type="submit"
                        disabled={!form.getValues("amount")}
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </>
          )}
          
          {step === 3 && recipient && (
            <>
              <CardHeader>
                <CardTitle>Verify PIN</CardTitle>
                <CardDescription>Enter your IPA PIN to complete the transfer</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Sending to</p>
                    <p className="font-medium">{recipient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">€{form.getValues("amount")}</p>
                  </div>
                </div>
                
                <PinVerification 
                  ipaAddress={form.getValues("sourceIpaAddress")}
                  onPinSubmit={handlePinSubmit}
                  isLoading={sendLoading}
                  title="Enter Your IPA PIN"
                  maxLength={4}
                />
              </CardContent>
              
              <CardFooter>
                <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                  Back
                </Button>
              </CardFooter>
            </>
          )}
          
          {step === 4 && success && recipient && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle>Transfer Complete!</CardTitle>
                <CardDescription>
                  You've successfully sent €{form.getValues("amount")} to {recipient.name}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">€{form.getValues("amount")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recipient</span>
                    <span className="font-medium">{recipient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{getMethodName(form.getValues("method") as TransferMethod)}</span>
                    <span className="font-medium">{recipient.identifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetForm}>Send Another</Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Back to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default SendMoney;
