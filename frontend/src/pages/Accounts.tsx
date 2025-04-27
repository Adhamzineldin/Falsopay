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
                const response = await BankAccountService.getAccountsByUserId(user.user_id);
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
            {/* Center-aligned content wrapper with proper padding */}
            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 space-y-8">
                {/* Header with Button */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                    <h1 className="text-2xl font-bold text-gray-900 text-center sm:text-left">Your Accounts</h1>
                    <Link to="/link-account" className="w-full sm:w-auto">
                        <Button className="flex items-center justify-center w-full">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Link New Account
                        </Button>
                    </Link>
                </div>

                {/* Total Balance Card */}
                <div className="w-full">
                    <BalanceCard
                        balance={getTotalBalance()}
                        title="Total Balance"
                        subtitle="Filtered accounts"
                    />
                </div>

                {/* Filters */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-center sm:text-left">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2 w-full">
                            <Label htmlFor="search" className="block text-center sm:text-left">Search</Label>
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="Account number or IBAN"
                                    className="pl-9 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 w-full">
                            <Label htmlFor="type" className="block text-center sm:text-left">Account Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger id="type" className="w-full">
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

                        <div className="space-y-2 w-full">
                            <Label htmlFor="status" className="block text-center sm:text-left">Status</Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger id="status" className="w-full">
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
                <div className="w-full">
                    <Tabs defaultValue="all" className="w-full">
                        {/* Center-aligned tabs on mobile */}
                        <div className="flex justify-center sm:justify-start overflow-x-auto pb-2">
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">All Accounts</TabsTrigger>
                                <TabsTrigger value="current">Current</TabsTrigger>
                                <TabsTrigger value="savings">Savings</TabsTrigger>
                                <TabsTrigger value="checking">Checking</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="space-y-4 w-full">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader className="h-8 w-8 animate-spin text-falsopay-primary" />
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
                                <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
                                    <p className="text-gray-500">No accounts found</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="current" className="space-y-4 w-full">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader className="h-8 w-8 animate-spin text-falsopay-primary" />
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
                                <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
                                    <p className="text-gray-500">No current accounts found</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="savings" className="space-y-4 w-full">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader className="h-8 w-8 animate-spin text-falsopay-primary" />
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
                                <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
                                    <p className="text-gray-500">No savings accounts found</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="checking" className="space-y-4 w-full">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader className="h-8 w-8 animate-spin text-falsopay-primary" />
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
                                <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
                                    <p className="text-gray-500">No checking accounts found</p>
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