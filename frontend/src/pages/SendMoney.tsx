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
import {ArrowRight, CheckCircle, Search, User, Send, CreditCard, Phone, Banknote, AlertCircle, Star, AlertTriangle, Info} from 'lucide-react';
import {
    Alert,
    AlertTitle,
    AlertDescription
} from "@/components/ui/alert";
import PinVerification from '@/components/PinVerification';
import {useForm} from 'react-hook-form';
import BankSelect from '@/components/BankSelect';
import {BankService} from "@/services/bank.service.ts";
import {CardService} from "@/services/card.service.ts";
import SendMoneyFavorites from '@/components/SendMoneyFavorites';
import {FavoritesService, Favorite} from '@/services/favorites.service';
import {SystemService, PublicSystemStatus} from '@/services/system.service';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
const formatCurrency = (value: number, currency = 'EGP') => {
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
    const [showAddFavoriteDialog, setShowAddFavoriteDialog] = useState(false);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [customFavoriteName, setCustomFavoriteName] = useState('');
    const [isSavingFavorite, setIsSavingFavorite] = useState(false);
    const [favoriteToRemove, setFavoriteToRemove] = useState<Favorite | null>(null);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const {toast} = useToast();
    const navigate = useNavigate();
    const [systemStatus, setSystemStatus] = useState<PublicSystemStatus | null>(null);
    const [isLoadingSystemStatus, setIsLoadingSystemStatus] = useState(false);

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
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch linked accounts
        const fetchAccounts = async () => {
            setIsLoadingAccounts(true);
            try {
                if (!user) return;
                
                const ipaAccounts = await IPAService.getIPAsByUserId(user.user_id);
                
                // Fetch balances for each IPA
                const accountsWithBalances = await Promise.all(
                    ipaAccounts.map(async (account) => {
                        try {
                            const balance = await BankAccountService.getAccountBalance(account.bank_id, account.account_number);
                            return {
                                ...account,
                                balance: balance?.balance || 0,
                                currency: balance?.currency || 'EGP'
                            };
                        } catch (e) {
                            console.error(`Error fetching balance for ${account.bank_id}:${account.account_number}:`, e);
                            return {
                                ...account,
                                balance: 0,
                                currency: 'EGP'
                            };
                        }
                    })
                );
                
                setLinkedAccounts(accountsWithBalances);
                
                // Set first account as default if available
                if (accountsWithBalances.length > 0) {
                    setSelectedAccount(accountsWithBalances[0]);
                    form.setValue('sourceIpaAddress', accountsWithBalances[0].ipa_address);
                }
            } catch (error) {
                console.error('Error fetching IPA accounts:', error);
                toast({
                    title: "Error",
                    description: "Failed to load your accounts",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingAccounts(false);
            }
        };
        
        // Load user's accounts
        fetchAccounts();
        
        // Load user's favorites
        const fetchFavorites = async () => {
            try {
                if (!user) return;
                const userFavorites = await FavoritesService.getUserFavorites(user.user_id);
                setFavorites(userFavorites);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };
        
        fetchFavorites();
        
        // Fetch system status
        fetchSystemStatus();
    }, [user, navigate, toast, form]);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;
            
            try {
                const userFavorites = await FavoritesService.getUserFavorites(user.user_id);
                setFavorites(userFavorites);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, [user, toast]);

    // Set custom name when recipient changes
    useEffect(() => {
        if (recipient) {
            setCustomFavoriteName(recipient.name);
        }
    }, [recipient]);

    // Fetch system status
    useEffect(() => {
        fetchSystemStatus();
    }, []);

    // Fetch system status to check for transfer limits and blocked transactions
    const fetchSystemStatus = async () => {
        setIsLoadingSystemStatus(true);
        try {
            const status = await SystemService.getPublicSystemStatus();
            console.log('System status fetched successfully:', status);
            setSystemStatus(status);
        } catch (error) {
            console.error('Error fetching system status:', error);
        } finally {
            setIsLoadingSystemStatus(false);
        }
    };

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

        // Check system status - transactions might be blocked
        if (systemStatus && !systemStatus.transactions_enabled) {
            toast({
                title: "Transactions Blocked",
                description: systemStatus.message || "Transactions are currently disabled by the administrator",
                variant: "destructive",
            });
            return;
        }

        // Check transfer limit if enabled
        if (systemStatus && systemStatus.transfer_limit && amount > systemStatus.transfer_limit) {
            toast({
                title: "Transfer Limit Exceeded",
                description: `Transaction amount exceeds the current transfer limit of ${formatCurrency(systemStatus.transfer_limit)}`,
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

        // Refetch system status to ensure we have the latest
        try {
            const freshStatus = await SystemService.getPublicSystemStatus();
            setSystemStatus(freshStatus);
            
            // Re-check system status - transactions might have been blocked
            if (!freshStatus.transactions_enabled) {
                toast({
                    title: "Transactions Blocked",
                    description: freshStatus.message || "Transactions are currently disabled by the administrator",
                    variant: "destructive",
                });
                return;
            }

            // Re-check transfer limit if enabled
            if (freshStatus.transfer_limit && amount > freshStatus.transfer_limit) {
                toast({
                    title: "Transfer Limit Exceeded",
                    description: `Transaction amount exceeds the current transfer limit of ${formatCurrency(freshStatus.transfer_limit)}`,
                    variant: "destructive",
                });
                return;
            }
        } catch (error) {
            console.error('Error refreshing system status:', error);
            // Continue with the cached status
        }

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

            console.log('Sending money with data:', transactionData);
            // Use the TransactionService.sendMoney method which calls the /api/transactions/send-money endpoint
            const result = await TransactionService.sendMoney(transactionData);
            console.log('Transaction result:', result);

            setSuccess(true);
            setStep(4);

            toast({
                title: "Success",
                description: `You've sent ${formatCurrency(amount)} to ${recipient.name}`,
            });
        } catch (error: any) {
            console.error('Error sending money:', error);
            
            let errorMessage = "Could not complete the transaction. Please try again.";
            
            // Check for transfer limit error in the response
            if (error.response?.data?.code === 'TRANSFER_LIMIT_EXCEEDED') {
                const limit = error.response.data.limit || systemStatus?.transfer_limit;
                errorMessage = `Transaction amount exceeds the current transfer limit of ${formatCurrency(limit || 0)}.`;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast({
                title: "Transaction Failed",
                description: errorMessage,
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

    // Handle selecting a favorite
    const handleSelectFavorite = (favorite: Favorite) => {
        // Set the form values based on the selected favorite
        form.setValue('method', favorite.method as TransferMethod);
        form.setValue('identifier', favorite.recipient_identifier);
        
        if (favorite.bank_id) {
            form.setValue('bank_id', favorite.bank_id.toString());
        }
        
        // Trigger the search automatically
        searchRecipient({
            ...form.getValues(),
            method: favorite.method as TransferMethod,
            identifier: favorite.recipient_identifier,
            bank_id: favorite.bank_id?.toString()
        });
    };
    
    // Handle adding to favorites
    const handleAddToFavorites = async () => {
        if (!recipient || !user) return;
        
        if (!customFavoriteName.trim()) {
            toast({
                title: "Name required",
                description: "Please enter a display name for this favorite",
                variant: "destructive",
            });
            return;
        }
        
        setIsSavingFavorite(true);
        try {
            await FavoritesService.createFavorite({
                user_id: user.user_id,
                recipient_identifier: recipient.identifier,
                recipient_name: customFavoriteName.trim(),
                method: form.getValues("method") as any,
                bank_id: form.getValues('bank_id') ? parseInt(form.getValues('bank_id')) : undefined
            });
            
            // Refresh favorites
            const updatedFavorites = await FavoritesService.getUserFavorites(user.user_id);
            setFavorites(updatedFavorites);
            
            toast({
                title: "Success",
                description: "Recipient added to favorites",
            });
            
            // Close dialog
            setShowAddFavoriteDialog(false);
        } catch (error: any) {
            console.error('Error adding favorite:', error);
            if (error.response?.status === 409) {
                toast({
                    title: "Already in favorites",
                    description: "This recipient is already in your favorites",
                    variant: "default",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add to favorites",
                    variant: "destructive",
                });
            }
        } finally {
            setIsSavingFavorite(false);
        }
    };
    
    // Handle removing from favorites
    const handleRemoveFavorite = async (favoriteId: number) => {
        if (!user) return;
        
        try {
            await FavoritesService.deleteFavorite(favoriteId, user.user_id);
            
            // Refresh favorites
            const updatedFavorites = await FavoritesService.getUserFavorites(user.user_id);
            setFavorites(updatedFavorites);
            
            toast({
                title: "Success",
                description: "Removed from favorites",
            });
            
            // Close dialog
            setShowRemoveDialog(false);
            setFavoriteToRemove(null);
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast({
                title: "Error",
                description: "Failed to remove from favorites",
                variant: "destructive",
            });
        }
    };

    return (
        <MainLayout>
            {/* Responsive container - Improved with animations and better spacing */}
            <div className="w-full max-w-lg mx-auto px-4 sm:px-0">
                <motion.h1 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8"
                >
                    Send Money
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-lg border border-gray-200/60 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-falsopay-primary/5 to-falsopay-primary/10 border-b border-gray-100">
                                        <CardTitle className="text-lg sm:text-xl flex items-center">
                                            <Send className="h-5 w-5 mr-2 text-falsopay-primary" />
                                            Find Recipient
                                        </CardTitle>
                                        <CardDescription>Select how you want to send money</CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                                        {linkedAccounts.length === 0 && !isLoadingAccounts ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 sm:p-5 bg-amber-50 text-amber-800 rounded-md text-sm sm:text-base border border-amber-200"
                                            >
                                                <div className="flex items-center">
                                                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
                                                    <span>You don't have any linked accounts. Please link an account first to send money.</span>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(searchRecipient)} className="space-y-5">
                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        <FormField
                                                            control={form.control}
                                                            name="sourceIpaAddress"
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm sm:text-base font-medium">Send from</FormLabel>
                                                                    <Select
                                                                        onValueChange={(value) => {
                                                                            field.onChange(value);
                                                                            handleAccountChange(value);
                                                                        }}
                                                                        defaultValue={field.value}
                                                                        disabled={isLoadingAccounts}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="text-sm sm:text-base h-11 bg-white transition-all hover:border-falsopay-primary/50 focus:border-falsopay-primary focus:ring-1 focus:ring-falsopay-primary/20">
                                                                                <SelectValue
                                                                                    placeholder={isLoadingAccounts ? "Loading accounts..." : "Select account"}/>
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {linkedAccounts.map((account) => (
                                                                                <SelectItem
                                                                                    key={account.ipa_address}
                                                                                    value={account.ipa_address}
                                                                                    className="text-sm sm:text-base"
                                                                                >
                                                                                    {account.ipa_address}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-xs sm:text-sm"/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </motion.div>

                                                    {/* Display account balance information */}
                                                    {selectedAccount && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="p-4 sm:p-5 bg-white rounded-lg border border-gray-200 shadow-sm mb-4 transition-all hover:border-falsopay-primary/30 hover:shadow-md"
                                                        >
                                                            <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Account Details</h3>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs sm:text-sm text-gray-600">Available balance</span>
                                                                <span className="text-base sm:text-lg font-bold text-falsopay-primary">
                                                                  {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        <FormField
                                                            control={form.control}
                                                            name="method"
                                                            render={({field}) => (
                                                                <FormItem className="space-y-3 sm:space-y-4">
                                                                    <FormLabel className="text-sm sm:text-base font-medium">Send using</FormLabel>
                                                                    <FormControl>
                                                                        <RadioGroup
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value}
                                                                            className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
                                                                        >
                                                                            {[
                                                                                {
                                                                                    value: 'ipa',
                                                                                    label: 'IPA Address',
                                                                                    icon: <User className="h-4 w-4 sm:h-5 sm:w-5"/>
                                                                                },
                                                                                {
                                                                                    value: 'mobile',
                                                                                    label: 'Mobile Number',
                                                                                    icon: <Phone className="h-4 w-4 sm:h-5 sm:w-5"/>
                                                                                },
                                                                                {
                                                                                    value: 'card',
                                                                                    label: 'Card Number',
                                                                                    icon: <CreditCard className="h-4 w-4 sm:h-5 sm:w-5"/>
                                                                                },
                                                                                {
                                                                                    value: 'account',
                                                                                    label: 'Account Number',
                                                                                    icon: <Banknote className="h-4 w-4 sm:h-5 sm:w-5"/>
                                                                                },
                                                                                {
                                                                                    value: 'iban',
                                                                                    label: 'IBAN',
                                                                                    icon: <Banknote className="h-4 w-4 sm:h-5 sm:w-5"/>
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
                                                                                        className={`flex flex-col items-center justify-center rounded-md border-2 border-muted bg-white p-3 sm:p-4 
                                                                                          hover:bg-gray-50 hover:border-gray-300 
                                                                                          ${field.value === option.value ? 'border-falsopay-primary bg-falsopay-primary/5' : ''}
                                                                                          peer-focus:ring-1 peer-focus:ring-falsopay-primary peer-focus:border-falsopay-primary
                                                                                          cursor-pointer text-center h-full transition-all`}
                                                                                    >
                                                                                        <div
                                                                                            className={`mb-2 sm:mb-3 rounded-full p-2 sm:p-2.5 
                                                                                            ${field.value === option.value ? 'bg-falsopay-primary text-white' : 'bg-gray-100 text-gray-500'} 
                                                                                            transition-all duration-200`}
                                                                                        >
                                                                                            {option.icon}
                                                                                        </div>
                                                                                        <span
                                                                                            className="font-medium text-xs sm:text-sm">{option.label}</span>
                                                                                    </Label>
                                                                                </div>
                                                                            ))}
                                                                        </RadioGroup>
                                                                    </FormControl>
                                                                    <FormMessage className="text-xs sm:text-sm"/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </motion.div>

                                                    {(form.watch("method") === "account" || form.watch("method") === "card") && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3 }}
                                                        >
                                                            <FormField
                                                                control={form.control}
                                                                name="bank_id"
                                                                render={({field}) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-sm sm:text-base font-medium">Bank</FormLabel>
                                                                        <FormControl>
                                                                            <BankSelect
                                                                                value={field.value}
                                                                                onChange={field.onChange}
                                                                                disabled={searchLoading}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage className="text-xs sm:text-sm"/>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </motion.div>
                                                    )}

                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.4 }}
                                                    >
                                                        <FormField
                                                            control={form.control}
                                                            name="identifier"
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm sm:text-base font-medium">{getMethodName(form.watch("method") as TransferMethod)}</FormLabel>
                                                                    <div className="flex">
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder={`Enter ${getMethodName(form.watch("method") as TransferMethod).toLowerCase()}`}
                                                                                {...field}
                                                                                className="rounded-r-none text-sm sm:text-base h-11 focus:border-falsopay-primary focus:ring-1 focus:ring-falsopay-primary/20"
                                                                            />
                                                                        </FormControl>
                                                                        <Button
                                                                            type="submit"
                                                                            disabled={searchLoading || !field.value || !form.getValues("sourceIpaAddress") || (form.watch("method") === "account" && !form.getValues("bank_id"))}
                                                                            className="rounded-l-none bg-falsopay-primary hover:bg-falsopay-primary/90 transition-all disabled:bg-gray-300"
                                                                        >
                                                                            {searchLoading ? 
                                                                                <div className="flex items-center">
                                                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                                                                    <span>Searching</span>
                                                                                </div> 
                                                                                : <Search className="h-4 w-4"/>
                                                                            }
                                                                        </Button>
                                                                    </div>
                                                                    <FormMessage className="text-xs sm:text-sm"/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </motion.div>
                                                </form>
                                            </Form>
                                        )}
                                        
                                        {/* Add the Favorites list in step 1 for selecting contacts */}
                                        {user && (
                                            <div className="flex justify-end mt-5">
                                                <SendMoneyFavorites 
                                                    userId={user.user_id} 
                                                    method={form.getValues('method')}
                                                    onSelectFavorite={handleSelectFavorite}
                                                    recipientValidated={false}
                                                    showOnlyFavoriteButton={false}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </motion.div>
                            )}

                            {step === 2 && recipient && selectedAccount && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-falsopay-primary/5 to-falsopay-primary/10 border-b border-gray-100">
                                        <CardTitle className="text-lg sm:text-xl flex items-center">
                                            <Banknote className="h-5 w-5 mr-2 text-falsopay-primary" />
                                            Enter Amount
                                        </CardTitle>
                                        <CardDescription className="text-sm sm:text-base">You're sending money to {recipient.name}</CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                                        {/* System status alerts */}
                                        {systemStatus && !systemStatus.transactions_enabled && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                <Alert variant="destructive" className="bg-red-50 border border-red-200">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertTitle>Transactions Temporarily Blocked</AlertTitle>
                                                    <AlertDescription>
                                                        {systemStatus.message || "Money transfers are currently disabled by the administrator."}
                                                    </AlertDescription>
                                                </Alert>
                                            </motion.div>
                                        )}
                                        
                                        {systemStatus && systemStatus.transfer_limit && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <Alert variant="default" className="bg-blue-50 text-blue-700 border border-blue-200">
                                                    <Info className="h-4 w-4" />
                                                    <AlertTitle>Transfer Limit: {formatCurrency(systemStatus.transfer_limit)}</AlertTitle>
                                                    <AlertDescription>
                                                        The maximum amount you can transfer in a single transaction is {formatCurrency(systemStatus.transfer_limit)}.
                                                    </AlertDescription>
                                                </Alert>
                                            </motion.div>
                                        )}

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex items-center justify-between p-4 sm:p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-falsopay-primary/30 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center space-x-3 sm:space-x-4">
                                                <div
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-falsopay-primary to-falsopay-secondary flex items-center justify-center text-white shadow-md">
                                                    <User className="h-5 w-5 sm:h-6 sm:w-6"/>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-sm sm:text-base">{recipient.name}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                                                        {getMethodIcon(form.getValues("method") as TransferMethod)}
                                                        <span className="ml-1">{recipient.identifier}</span>
                                                    </p>
                                                    {recipient.bank_name && (
                                                        <p className="text-xs sm:text-sm text-gray-500">
                                                            {recipient.bank_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Favorite button positioned on the right */}
                                            {user && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    // Prevent default to avoid form submission
                                                                    e.preventDefault();
                                                                    
                                                                    const isInFavorites = favorites.some(fav => 
                                                                        fav.recipient_identifier === recipient.identifier && 
                                                                        fav.method === form.getValues("method")
                                                                    );
                                                                    
                                                                    if (isInFavorites) {
                                                                        // Find the favorite ID
                                                                        const favorite = favorites.find(fav => 
                                                                            fav.recipient_identifier === recipient.identifier && 
                                                                            fav.method === form.getValues("method")
                                                                        );
                                                                        
                                                                        if (favorite) {
                                                                            // Set the favorite to remove and open the dialog
                                                                            setFavoriteToRemove(favorite);
                                                                            setShowRemoveDialog(true);
                                                                            return;
                                                                        }
                                                                        return;
                                                                    }
                                                                    
                                                                    // Show dialog to add to favorites
                                                                    setShowAddFavoriteDialog(true);
                                                                }}
                                                                className="h-9 w-9 transition-all hover:bg-gray-100 hover:text-falsopay-primary hover:border-falsopay-primary/50"
                                                            >
                                                                {favorites.some(fav => 
                                                                    fav.recipient_identifier === recipient.identifier && 
                                                                    fav.method === form.getValues("method")
                                                                ) ? (
                                                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                                ) : (
                                                                    <Star className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {favorites.some(fav => 
                                                                fav.recipient_identifier === recipient.identifier && 
                                                                fav.method === form.getValues("method")
                                                            )
                                                                ? "Remove from favorites" 
                                                                : "Add to favorites"
                                                            }
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </motion.div>

                                        {/* Account Balance Card */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="p-4 sm:p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Source Account</h3>
                                            <div className="flex justify-between items-center flex-wrap">
                                                <div className="text-xs sm:text-sm">
                                                    <p className="text-gray-600">{selectedAccount.ipa_address}</p>
                                                    <p className="text-gray-600">Bank ID: {selectedAccount.bank_id}</p>
                                                </div>
                                                <div className="text-right mt-1 sm:mt-0">
                                                    <p className="text-xs sm:text-sm text-gray-500">Available Balance</p>
                                                    <p className="font-bold text-sm sm:text-base text-falsopay-primary">{formatCurrency(selectedAccount.balance, selectedAccount.currency)}</p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(handleAmountSubmit)} className="space-y-5">
                                                    <FormField
                                                        control={form.control}
                                                        name="amount"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm sm:text-base font-medium">Amount (£)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0.00"
                                                                        {...field}
                                                                        min="0"
                                                                        step="0.01"
                                                                        className="text-sm sm:text-base h-12 text-lg focus:border-falsopay-primary focus:ring-1 focus:ring-falsopay-primary/20"
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
                                                                    <div className="flex items-center mt-2 text-red-500 text-xs sm:text-sm">
                                                                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/>
                                                                        Insufficient funds. Your maximum available amount
                                                                        is {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                                                                    </div>
                                                                )}
                                                                <FormMessage className="text-xs sm:text-sm"/>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex justify-between mt-6 pt-2">
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => setStep(1)} 
                                                            className="text-xs sm:text-sm hover:bg-gray-100 hover:border-gray-300 transition-all"
                                                        >
                                                            Back
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                !form.getValues("amount") ||
                                                                parseFloat(form.getValues("amount")) <= 0 ||
                                                                parseFloat(form.getValues("amount")) > selectedAccount.balance
                                                            }
                                                            className="text-xs sm:text-sm bg-falsopay-primary hover:bg-falsopay-primary/90 transition-all"
                                                        >
                                                            Continue <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4"/>
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </motion.div>
                                    </CardContent>
                                </motion.div>
                            )}

                            {step === 3 && recipient && selectedAccount && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-falsopay-primary/5 to-falsopay-primary/10 border-b border-gray-100">
                                        <CardTitle className="text-lg sm:text-xl flex items-center">
                                            <CheckCircle className="h-5 w-5 mr-2 text-falsopay-primary" />
                                            Verify PIN
                                        </CardTitle>
                                        <CardDescription className="text-sm sm:text-base">Enter your IPA PIN to complete the transfer</CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="p-4 sm:p-5 bg-white rounded-lg border border-gray-200 space-y-3 sm:space-y-4 shadow-sm"
                                        >
                                            <div className="flex justify-between flex-wrap">
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-500">Sending from</p>
                                                    <p className="text-sm sm:text-base font-medium text-gray-800">{selectedAccount.ipa_address}</p>
                                                </div>
                                                <div className="mt-1 sm:mt-0">
                                                    <p className="text-xs sm:text-sm text-gray-500">Available Balance</p>
                                                    <p className="text-sm sm:text-base font-medium text-right text-falsopay-primary">{formatCurrency(selectedAccount.balance, selectedAccount.currency)}</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-200 pt-3 sm:pt-4 flex justify-between flex-wrap">
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-500">Sending to</p>
                                                    <p className="text-sm sm:text-base font-medium text-gray-800">{recipient.name}</p>
                                                    {form.getValues("method") === "account" && recipient.bank_name && (
                                                        <p className="text-xs sm:text-sm text-gray-500">{recipient.bank_name}</p>
                                                    )}
                                                </div>
                                                <div className="mt-1 sm:mt-0">
                                                    <p className="text-xs sm:text-sm text-gray-500">Amount</p>
                                                    <p className="text-sm sm:text-base font-medium text-right text-falsopay-primary">{formatCurrency(parseFloat(form.getValues("amount")))}</p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <PinVerification
                                                ipaAddress={form.getValues("sourceIpaAddress")}
                                                onPinSubmit={handlePinSubmit}
                                                isLoading={sendLoading}
                                                title="Enter Your IPA PIN"
                                                maxLength={6}
                                            />
                                        </motion.div>
                                    </CardContent>

                                    <CardFooter className="px-5 pb-5 sm:px-6 sm:pb-6">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setStep(2)} 
                                            className="w-full text-xs sm:text-sm hover:bg-gray-100 hover:border-gray-300 transition-all"
                                        >
                                            Back
                                        </Button>
                                    </CardFooter>
                                </motion.div>
                            )}

                            {step === 4 && success && recipient && selectedAccount && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <CardHeader className="text-center p-5 sm:p-6 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                            className="flex justify-center mb-4 sm:mb-5"
                                        >
                                            <div
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                                                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white"/>
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <CardTitle className="text-xl sm:text-2xl text-green-700">Transfer Complete!</CardTitle>
                                            <CardDescription className="text-sm sm:text-base text-green-600 mt-1">
                                                You've successfully
                                                sent {formatCurrency(parseFloat(form.getValues("amount")))} to {recipient.name}
                                            </CardDescription>
                                        </motion.div>
                                    </CardHeader>

                                    <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                                        <motion.div 
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 space-y-3 sm:space-y-4 shadow-sm"
                                        >
                                            <div className="flex justify-between">
                                                <span className="text-xs sm:text-sm text-gray-500">From Account</span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-800">{selectedAccount.ipa_address}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs sm:text-sm text-gray-500">Amount</span>
                                                <span
                                                    className="text-xs sm:text-sm font-medium text-falsopay-primary">{formatCurrency(parseFloat(form.getValues("amount")))}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs sm:text-sm text-gray-500">Recipient</span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-800">{recipient.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span
                                                    className="text-xs sm:text-sm text-gray-500">{getMethodName(form.getValues("method") as TransferMethod)}</span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-800">{recipient.identifier}</span>
                                            </div>
                                            {recipient.bank_name && (
                                                <div className="flex justify-between">
                                                    <span className="text-xs sm:text-sm text-gray-500">Bank</span>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-800">{recipient.bank_name}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-xs sm:text-sm text-gray-500">Date</span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-800">{new Date().toLocaleDateString()}</span>
                                            </div>
                                        </motion.div>
                                    </CardContent>

                                    <CardFooter className="flex justify-between px-5 pb-5 sm:px-6 sm:pb-6">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="w-full flex flex-col sm:flex-row gap-3 sm:justify-between"
                                        >
                                            <Button 
                                                variant="outline" 
                                                onClick={resetForm} 
                                                className="text-xs sm:text-sm hover:bg-gray-100 hover:border-gray-300 transition-all sm:flex-1"
                                            >
                                                Send Another
                                            </Button>
                                            <Button 
                                                onClick={() => navigate('/dashboard')} 
                                                className="text-xs sm:text-sm bg-falsopay-primary hover:bg-falsopay-primary/90 transition-all sm:flex-1"
                                            >
                                                Back to Dashboard <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4"/>
                                            </Button>
                                        </motion.div>
                                    </CardFooter>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </motion.div>
            </div>
            
            {/* Dialog for adding to favorites */}
            <Dialog open={showAddFavoriteDialog} onOpenChange={setShowAddFavoriteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add to Favorites</DialogTitle>
                        <DialogDescription>
                            Save this recipient to your favorites list for quick access.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {recipient && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="favoriteName" className="text-sm">Favorite Name</Label>
                                <Input 
                                    id="favoriteName" 
                                    value={customFavoriteName}
                                    onChange={(e) => setCustomFavoriteName(e.target.value)}
                                    placeholder="Enter a name for this favorite"
                                    className="text-sm"
                                />
                            </div>
                            
                            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                                <div className="flex items-center mb-2">
                                    <span className="text-gray-500 w-24">Method:</span>
                                    <span className="font-medium">{getMethodName(form.getValues("method") as TransferMethod)}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-gray-500 w-24">Identifier:</span>
                                    <span className="font-medium">{recipient.identifier}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter className="sm:justify-between">
                        <Button variant="outline" onClick={() => setShowAddFavoriteDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddToFavorites}
                            disabled={isSavingFavorite || !customFavoriteName}
                            className="bg-falsopay-primary hover:bg-falsopay-primary/90"
                        >
                            {isSavingFavorite ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                    Saving...
                                </>
                            ) : (
                                <>Add to Favorites</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Dialog for removing favorites */}
            <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove from Favorites</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this recipient from your favorites?
                        </DialogDescription>
                    </DialogHeader>
                    
                    {favoriteToRemove && (
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm my-2">
                            <div className="flex items-center mb-2">
                                <span className="text-gray-500 w-24">Name:</span>
                                <span className="font-medium">{favoriteToRemove.recipient_name}</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <span className="text-gray-500 w-24">Method:</span>
                                <span className="font-medium">{getMethodName(favoriteToRemove.method as TransferMethod)}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500 w-24">Identifier:</span>
                                <span className="font-medium">{favoriteToRemove.recipient_identifier}</span>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter className="sm:justify-between">
                        <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={() => {
                                if (favoriteToRemove) {
                                    handleRemoveFavorite(favoriteToRemove.favorite_id);
                                }
                            }}
                            disabled={isSavingFavorite}
                        >
                            {isSavingFavorite ? 'Removing...' : 'Remove'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};

export default SendMoney;