import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import {useApp} from '@/contexts/AppContext';
import {SendMoneyData, TransactionService} from '@/services/transaction.service';
import {UserService} from '@/services/user.service';
import {IPAService, IpaData} from '@/services/ipa.service';
import {BankAccountService} from '@/services/bank-account.service';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
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
import {useToast} from '@/hooks/use-toast';
import {ArrowRight, CheckCircle, Search, User, Send, CreditCard, Phone, Banknote, AlertCircle} from 'lucide-react';
import PinVerification from '@/components/PinVerification';
import {useForm} from 'react-hook-form';
import BankSelect from '@/components/BankSelect';
import {BankService} from "@/services/bank.service.ts";
import {CardService} from "@/services/card.service.ts";

type TransferMethod = 'ipa' | 'mobile' | 'card' | 'account' | 'iban';

interface Recipient {
    user_id: number;
    name: string;
    identifier: string;
    bank_name?: string; // Added for account transfers
}

interface EnhancedIpaData extends IpaData {
    balance: number;
    currency: string;
}

interface FormValues {
    method: TransferMethod;
    identifier: string;
    bank_id?: string;
    amount: string;
    sourceIpaAddress: string;
}

// Format number with commas and 2 decimal places
const formatCurrency = (value: number, currency = '€') => {
    return `${currency} ${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

const SendMoney = () => {
    const {user} = useApp();
    const [step, setStep] = useState(1);
    const [searchLoading, setSearchLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [recipient, setRecipient] = useState<Recipient | null>(null);
    const [success, setSuccess] = useState(false);
    const [linkedAccounts, setLinkedAccounts] = useState<EnhancedIpaData[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<EnhancedIpaData | null>(null);
    const {toast} = useToast();
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

                // Enhance accounts with balance data
                const enhancedAccounts = await Promise.all(accounts.map(async (account) => {
                    try {
                        // In a real app, you would fetch the balance from your API
                        const balanceData = await BankAccountService.getAccountBalance(account.bank_id, account.account_number);
                        return {
                            ...account,
                            balance: balanceData?.balance || Math.random() * 10000, // Fallback to random balance for demo
                            currency: balanceData?.currency || 'EGP'
                        };
                    } catch (error) {
                        console.error(`Error fetching balance for ${account.ipa_address}:`, error);
                        return {
                            ...account,
                            balance: Math.random() * 10000, // Random balance between 0-10000 for demo
                            currency: 'EUR'
                        };
                    }
                }));

                setLinkedAccounts(enhancedAccounts);

                if (enhancedAccounts.length > 0) {
                    form.setValue('sourceIpaAddress', enhancedAccounts[0].ipa_address);
                    setSelectedAccount(enhancedAccounts[0]);
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
                    if (!data.bank_id) {
                        toast({
                            title: "Error",
                            description: "Please select a bank"
                        });
                        throw new Error('Bank not selected');
                    }


                    const cardResponse = await CardService.getCardByNumber(data.identifier, data.bank_id);

                    userResponse = await UserService.getUserById(cardResponse.bank_user_id);
                    break;

                case 'account':
                    if (!data.bank_id) {
                        toast({
                            title: "Error",
                            description: "Please select a bank"
                        });
                        throw new Error('Bank not selected');
                    }

                    // Implement account lookup by account number and bank ID
                    const accountResponse = await BankAccountService.getAccountByNumberAndBankId(
                        parseInt(data.bank_id),
                        data.identifier
                    );

                    if (!accountResponse || !accountResponse.bank_user_id) {
                        throw new Error('Account not found');
                    }

                    userResponse = await UserService.getUserById(accountResponse.bank_user_id);

                    // Get bank name for display
                    const bankInfo = await BankService.getBankById(parseInt(data.bank_id));
                    const bankName = bankInfo?.name || `Bank ID: ${data.bank_id}`;

                    break;

                case 'iban':
                    const ibanResponse = await BankAccountService.getAccountByIBAN(data.identifier);
                    if (!ibanResponse || !ibanResponse.bank_user_id) throw new Error('IBAN not found');
                    userResponse = await UserService.getUserById(ibanResponse.bank_user_id);
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

            const recipientData: Recipient = {
                user_id: userResponse.user_id,
                name: `${userResponse.first_name} ${userResponse.last_name}`,
                identifier: data.identifier
            };

            // Add bank name for account transfers
            if (data.method === 'account' && data.bank_id) {
                const bankInfo = await BankService.getBankById(parseInt(data.bank_id));
                recipientData.bank_name = bankInfo?.name || `Bank ID: ${data.bank_id}`;
            }

            setRecipient(recipientData);
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
        if (!recipient || !selectedAccount) return;

        const amount = parseFloat(data.amount);

        if (!amount || amount <= 0) {
            toast({
                title: "Error",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        // Check if amount exceeds balance
        if (amount > selectedAccount.balance) {
            toast({
                title: "Insufficient funds",
                description: `Your balance (${formatCurrency(selectedAccount.balance)}) is not enough to send ${formatCurrency(amount)}`,
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
        if (!recipient || !selectedAccount) return;

        const amount = parseFloat(form.getValues('amount'));
        const sourceIpaAddress = form.getValues('sourceIpaAddress');
        const transferMethod = form.getValues('method') as TransferMethod;
        const identifier = form.getValues('identifier');
        const bankId = form.getValues('bank_id');

        // Final check to ensure amount doesn't exceed balance
        if (amount > selectedAccount.balance) {
            toast({
                title: "Insufficient funds",
                description: `Your balance (${formatCurrency(selectedAccount.balance)}) is not enough to send ${formatCurrency(amount)}`,
                variant: "destructive",
            });
            return;
        }

        setSendLoading(true);
        try {
            // Base transaction data that's always required
            const transactionData: SendMoneyData = {
                sender_user_id: user?.user_id || 0,
                receiver_user_id: recipient.user_id,
                amount: amount,
                transaction_type: 'send',
                transfer_method: transferMethod,
                pin: pin
            };

            // Add method-specific data based on transfer method
            switch (transferMethod) {
                case 'ipa':
                    transactionData.sender_ipa_address = sourceIpaAddress;
                    transactionData.receiver_ipa_address = identifier;
                    break;

                case 'mobile':
                    transactionData.sender_ipa_address = sourceIpaAddress;
                    transactionData.receiver_mobile_number = identifier;
                    break;

                case 'card':
                    transactionData.sender_ipa_address = sourceIpaAddress;
                    transactionData.receiver_card_number = identifier;
                    if (bankId) {
                        transactionData.receiver_bank_id = parseInt(bankId);
                    }
                    break;

                case 'account':
                    transactionData.sender_ipa_address = sourceIpaAddress;
                    transactionData.sender_bank_id = parseInt(sourceIpaAddress.split(':')[1]);
                    if (bankId) {
                        transactionData.receiver_bank_id = parseInt(bankId);
                        transactionData.receiver_account_number = identifier;
                    }
                    break;

                case 'iban':
                    transactionData.sender_ipa_address = sourceIpaAddress;
                    transactionData.receiver_iban = identifier;
                    break;
            }

            console.log(transactionData);
            await TransactionService.sendMoney(transactionData);

            setSuccess(true);
            setStep(4);

            toast({
                title: "Success",
                description: `You've sent ${formatCurrency(amount)} to ${recipient.name}`,
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
        setStep(1); // Add this line to reset the step back to 1

        // Reset to default values
        if (linkedAccounts.length > 0) {
            form.setValue('sourceIpaAddress', linkedAccounts[0].ipa_address);
            setSelectedAccount(linkedAccounts[0]);
        }
    };

    const getMethodName = (method: TransferMethod) => {
        switch (method) {
            case 'ipa':
                return 'IPA Address';
            case 'mobile':
                return 'Mobile Number';
            case 'card':
                return 'Card Number';
            case 'account':
                return 'Account Number';
            case 'iban':
                return 'IBAN';
            default:
                return method;
        }
    };

    const getMethodIcon = (method: TransferMethod) => {
        switch (method) {
            case 'ipa':
                return <User className="h-4 w-4"/>;
            case 'mobile':
                return <Phone className="h-4 w-4"/>;
            case 'card':
                return <CreditCard className="h-4 w-4"/>;
            case 'account':
                return <Banknote className="h-4 w-4"/>;
            case 'iban':
                return <Banknote className="h-4 w-4"/>;
            default:
                return <User className="h-4 w-4"/>;
        }
    };

    // Handle account selection
    const handleAccountChange = (ipaAddress: string) => {
        const account = linkedAccounts.find(acc => acc.ipa_address === ipaAddress);
        if (account) {
            setSelectedAccount(account);
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
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Send from</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                handleAccountChange(value);
                                                            }}
                                                            defaultValue={field.value}
                                                            disabled={isLoadingAccounts}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue
                                                                        placeholder={isLoadingAccounts ? "Loading accounts..." : "Select account"}/>
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {linkedAccounts.map((account) => (
                                                                    <SelectItem
                                                                        key={account.ipa_address}
                                                                        value={account.ipa_address}
                                                                    >
                                                                        {account.ipa_address} 
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Display account balance information */}
                                            {selectedAccount && (
                                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                                                    <h3 className="font-medium text-gray-900 mb-1">Account Details</h3>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Available balance</span>
                                                        <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                            </span>
                                                    </div>
                                                </div>
                                            )}

                                            <FormField
                                                control={form.control}
                                                name="method"
                                                render={({field}) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel>Send using</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                className="grid grid-cols-2 md:grid-cols-3 gap-3"
                                                            >
                                                                {[
                                                                    {
                                                                        value: 'ipa',
                                                                        label: 'IPA Address',
                                                                        icon: <User className="h-5 w-5"/>
                                                                    },
                                                                    {
                                                                        value: 'mobile',
                                                                        label: 'Mobile Number',
                                                                        icon: <Phone className="h-5 w-5"/>
                                                                    },
                                                                    {
                                                                        value: 'card',
                                                                        label: 'Card Number',
                                                                        icon: <CreditCard className="h-5 w-5"/>
                                                                    },
                                                                    {
                                                                        value: 'account',
                                                                        label: 'Account Number',
                                                                        icon: <Banknote className="h-5 w-5"/>
                                                                    },
                                                                    {
                                                                        value: 'iban',
                                                                        label: 'IBAN',
                                                                        icon: <Banknote className="h-5 w-5"/>
                                                                    },
                                                                ].map((option) => (
                                                                    <div key={option.value} className="relative">
                                                                        <RadioGroupItem
                                                                            value={option.value}
                                                                            id={option.value}
                                                                            className="peer sr-only"
                                                                        />
                                                                        <Label
                                                                            htmlFor={option.value}
                                                                            className={`flex flex-col items-center justify-center rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 
                  ${field.value === option.value ? 'border-falsopay-primary bg-falsopay-primary/5' : ''}
                  peer-focus:ring-1 peer-focus:ring-falsopay-primary peer-focus:border-falsopay-primary
                  cursor-pointer text-center h-full transition-all`}
                                                                        >
                                                                            <div
                                                                                className={`mb-2 rounded-full p-2 ${field.value === option.value ? 'bg-falsopay-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                                                {option.icon}
                                                                            </div>
                                                                            <span
                                                                                className="font-medium text-sm">{option.label}</span>
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />


                                            {(form.watch("method") === "account" || form.watch("method") === "card") && (
                                                <FormField
                                                    control={form.control}
                                                    name="bank_id"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Bank</FormLabel>
                                                            <FormControl>
                                                                <BankSelect
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    disabled={searchLoading}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            )}


                                            <FormField
                                                control={form.control}
                                                name="identifier"
                                                render={({field}) => (
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
                                                                disabled={searchLoading || !field.value || !form.getValues("sourceIpaAddress") || (form.watch("method") === "account" && !form.getValues("bank_id"))}
                                                                className="rounded-l-none"
                                                            >
                                                                {searchLoading ? 'Searching...' :
                                                                    <Search className="h-4 w-4"/>}
                                                            </Button>
                                                        </div>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        </form>
                                    </Form>
                                )}
                            </CardContent>
                        </>
                    )}

                    {step === 2 && recipient && selectedAccount && (
                        <>
                            <CardHeader>
                                <CardTitle>Enter Amount</CardTitle>
                                <CardDescription>You're sending money to {recipient.name}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div
                                    className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="w-12 h-12 rounded-full bg-falsopay-primary flex items-center justify-center text-white">
                                            <User className="h-6 w-6"/>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{recipient.name}</h3>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                {getMethodIcon(form.getValues("method") as TransferMethod)}
                                                <span className="ml-1">{recipient.identifier}</span>
                                            </p>
                                            {recipient.bank_name && (
                                                <p className="text-sm text-gray-500">
                                                    {recipient.bank_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Account Balance Card */}
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="font-medium text-gray-900 mb-1">Source Account</h3>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500">{selectedAccount.ipa_address}</p>
                                            <p className="text-sm text-gray-500">Bank ID: {selectedAccount.bank_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Available Balance</p>
                                            <p className="font-bold text-right">{formatCurrency(selectedAccount.balance, selectedAccount.currency)}</p>
                                        </div>
                                    </div>
                                </div>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleAmountSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Amount (€)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            {...field}
                                                            min="0"
                                                            step="0.01"
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                // Show warning if amount exceeds balance
                                                                const amount = parseFloat(e.target.value);
                                                                if (amount > selectedAccount.balance) {
                                                                    toast({
                                                                        title: "Warning",
                                                                        description: "The amount exceeds your available balance",
                                                                        variant: "destructive",
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    {parseFloat(field.value) > selectedAccount.balance && (
                                                        <div className="flex items-center mt-1 text-red-500 text-sm">
                                                            <AlertCircle className="h-4 w-4 mr-1"/>
                                                            Insufficient funds. Your maximum available amount
                                                            is {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                                                        </div>
                                                    )}
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex justify-between mt-4">
                                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    !form.getValues("amount") ||
                                                    parseFloat(form.getValues("amount")) <= 0 ||
                                                    parseFloat(form.getValues("amount")) > selectedAccount.balance
                                                }
                                            >
                                                Continue <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </>
                    )}

                    {step === 3 && recipient && selectedAccount && (
                        <>
                            <CardHeader>
                                <CardTitle>Verify PIN</CardTitle>
                                <CardDescription>Enter your IPA PIN to complete the transfer</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Sending from</p>
                                            <p className="font-medium">{selectedAccount.ipa_address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Available Balance</p>
                                            <p className="font-medium text-right">{formatCurrency(selectedAccount.balance, selectedAccount.currency)}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Sending to</p>
                                            <p className="font-medium">{recipient.name}</p>
                                            {form.getValues("method") === "account" && recipient.bank_name && (
                                                <p className="text-sm text-gray-500">{recipient.bank_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Amount</p>
                                            <p className="font-medium text-right">{formatCurrency(parseFloat(form.getValues("amount")))}</p>
                                        </div>
                                    </div>
                                </div>

                                <PinVerification
                                    ipaAddress={form.getValues("sourceIpaAddress")}
                                    onPinSubmit={handlePinSubmit}
                                    isLoading={sendLoading}
                                    title="Enter Your IPA PIN"
                                    maxLength={6}
                                />
                            </CardContent>

                            <CardFooter>
                                <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                                    Back
                                </Button>
                            </CardFooter>
                        </>
                    )}

                    {step === 4 && success && recipient && selectedAccount && (
                        <>
                            <CardHeader className="text-center">
                                <div className="flex justify-center mb-4">
                                    <div
                                        className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="h-8 w-8 text-green-600"/>
                                    </div>
                                </div>
                                <CardTitle>Transfer Complete!</CardTitle>
                                <CardDescription>
                                    You've successfully
                                    sent {formatCurrency(parseFloat(form.getValues("amount")))} to {recipient.name}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">From Account</span>
                                        <span className="font-medium">{selectedAccount.ipa_address}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Amount</span>
                                        <span
                                            className="font-medium">{formatCurrency(parseFloat(form.getValues("amount")))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Recipient</span>
                                        <span className="font-medium">{recipient.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span
                                            className="text-gray-500">{getMethodName(form.getValues("method") as TransferMethod)}</span>
                                        <span className="font-medium">{recipient.identifier}</span>
                                    </div>
                                    {recipient.bank_name && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Bank</span>
                                            <span className="font-medium">{recipient.bank_name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Date</span>
                                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={resetForm}>Send Another</Button>
                                <Button onClick={() => navigate('/dashboard')}>
                                    Back to Dashboard <ArrowRight className="ml-2 h-4 w-4"/>
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