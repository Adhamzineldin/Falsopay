import { useEffect, useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { BankAccountService } from '@/services/bank-account.service';
import BalanceCard from '@/components/cards/BalanceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader, CreditCard, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface BankAccount {
    bank_id: number;
    account_number: string;
    iban: string;
    balance: number;
    type: string;
    status: string;
}

const Accounts = () => {
    const { user } = useApp();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const { toast } = useToast();

    // Fetch accounts
    useEffect(() => {
        if (!user) return;

        const fetchAccounts = async () => {
            setIsLoading(true);
            try {
                const response = await BankAccountService.getAccountsByUserPhoneNumber(user.phone_number);
                setAccounts(response);
                setFilteredAccounts(response);
            } catch (error) {
                console.error('Error fetching accounts:', error);
                toast({
                    title: "Error",
                    description: "Failed to load your bank accounts",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccounts();
    }, [user, toast]);

    // For demo/testing purposes - remove in production
    const demoAccounts: BankAccount[] = [];

    // Use either real data or demo data
    const displayAccounts = accounts.length ? accounts : demoAccounts;

    // Apply filters when dependencies change
    useEffect(() => {
        const filteredResults = displayAccounts.filter((account) => {
            // Filter by search query (account number or IBAN)
            const matchesSearch =
                account.account_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.iban.toLowerCase().includes(searchQuery.toLowerCase());

            // Filter by account type
            const matchesType =
                selectedType === 'all' ||
                account.type === selectedType;

            // Filter by status
            const matchesStatus =
                selectedStatus === 'all' ||
                account.status === selectedStatus;

            return matchesSearch && matchesType && matchesStatus;
        });

        setFilteredAccounts(filteredResults);
    }, [searchQuery, selectedType, selectedStatus, displayAccounts]);

    // Calculate total balance
    const getTotalBalance = () => {
        return filteredAccounts.reduce((total, account) => total + account.balance, 0);
    };

    return (
        <MainLayout>
            <div className="space-y-6 px-2 sm:px-4 md:px-0">
                {/* Header with Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Accounts</h1>
                    <Link to="/link-account">
                        <Button className="flex items-center w-full sm:w-auto">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Link New Account
                        </Button>
                    </Link>
                </div>

                {/* Total Balance Card */}
                <BalanceCard
                    balance={getTotalBalance()}
                    title="Total Balance"
                    subtitle="Filtered accounts"
                />

                {/* Filters */}
                <Card className="overflow-hidden">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="Account number or IBAN"
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Account Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="current">Current</SelectItem>
                                    <SelectItem value="savings">Savings</SelectItem>
                                    <SelectItem value="checking">Checking</SelectItem>
                                    <SelectItem value="investment">Investment</SelectItem>
                                    <SelectItem value="credit">Credit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="mt-6">
                    <Tabs defaultValue="all">
                        <div className="overflow-x-auto pb-2">
                            <TabsList className="mb-4 w-full sm:w-auto flex sm:inline-flex">
                                <TabsTrigger value="all" className="flex-1 sm:flex-none text-xs sm:text-sm">All</TabsTrigger>
                                <TabsTrigger value="current" className="flex-1 sm:flex-none text-xs sm:text-sm">Current</TabsTrigger>
                                <TabsTrigger value="savings" className="flex-1 sm:flex-none text-xs sm:text-sm">Savings</TabsTrigger>
                                <TabsTrigger value="checking" className="flex-1 sm:flex-none text-xs sm:text-sm">Checking</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-8 sm:p-12">
                                    <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-falsopay-primary" />
                                </div>
                            ) : filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account) => (
                                    <BalanceCard
                                        key={`${account.bank_id}-${account.account_number}`}
                                        balance={account.balance}
                                        title={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                        subtitle={`IBAN: ${account.iban}`}
                                        cardNumber={account.account_number}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-sm sm:text-base">No accounts found</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="current" className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-8 sm:p-12">
                                    <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-falsopay-primary" />
                                </div>
                            ) : filteredAccounts.filter(acc => acc.type === 'current').length > 0 ? (
                                filteredAccounts
                                    .filter(acc => acc.type === 'current')
                                    .map((account) => (
                                        <BalanceCard
                                            key={`${account.bank_id}-${account.account_number}`}
                                            balance={account.balance}
                                            title={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                            subtitle={`IBAN: ${account.iban}`}
                                            cardNumber={account.account_number}
                                        />
                                    ))
                            ) : (
                                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-sm sm:text-base">No current accounts found</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="savings" className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-8 sm:p-12">
                                    <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-falsopay-primary" />
                                </div>
                            ) : filteredAccounts.filter(acc => acc.type === 'savings').length > 0 ? (
                                filteredAccounts
                                    .filter(acc => acc.type === 'savings')
                                    .map((account) => (
                                        <BalanceCard
                                            key={`${account.bank_id}-${account.account_number}`}
                                            balance={account.balance}
                                            title={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                            subtitle={`IBAN: ${account.iban}`}
                                            cardNumber={account.account_number}
                                        />
                                    ))
                            ) : (
                                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-sm sm:text-base">No savings accounts found</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="checking" className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-8 sm:p-12">
                                    <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-falsopay-primary" />
                                </div>
                            ) : filteredAccounts.filter(acc => acc.type === 'checking').length > 0 ? (
                                filteredAccounts
                                    .filter(acc => acc.type === 'checking')
                                    .map((account) => (
                                        <BalanceCard
                                            key={`${account.bank_id}-${account.account_number}`}
                                            balance={account.balance}
                                            title={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                            subtitle={`IBAN: ${account.iban}`}
                                            cardNumber={account.account_number}
                                        />
                                    ))
                            ) : (
                                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-sm sm:text-base">No checking accounts found</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    );
};

export default Accounts;