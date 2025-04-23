
import { useEffect, useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { TransactionService } from '@/services/transaction.service';
import TransactionCard, { Transaction } from '@/components/cards/TransactionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader } from 'lucide-react';

const Transactions = () => {
  const { user } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { toast } = useToast();

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await TransactionService.getTransactionsByUserId(user.user_id);
        
        // Map transactions to our Transaction type
        const mappedTransactions = response.map((tx: any) => ({
          transaction_id: tx.transaction_id,
          amount: tx.amount,
          currency: tx.currency || '€',
          sender: {
            name: tx.sender_name || 'Unknown',
            user_id: tx.sender_user_id?.toString() || '0'
          },
          receiver: {
            name: tx.receiver_name || 'Unknown',
            user_id: tx.receiver_user_id?.toString() || '0'
          },
          timestamp: tx.transaction_time || new Date().toISOString(),
          status: tx.status || 'completed',
          // Ensure type is strictly "incoming" or "outgoing"
          type: tx.sender_user_id === user.user_id ? 'outgoing' as const : 'incoming' as const
        }));
        
        setTransactions(mappedTransactions);
        setFilteredTransactions(mappedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load your transactions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [user, toast]);

  // For demo/testing purposes - remove in production
  const demoTransactions = [];

  // Use either real data or demo data
  const displayTransactions = transactions.length ? transactions : demoTransactions;

  // Apply filters when dependencies change
  useEffect(() => {
    const filteredResults = displayTransactions.filter((tx) => {
      // Filter by search query (name)
      const matchesSearch = 
        tx.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.receiver.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by transaction type
      const matchesType = 
        selectedType === 'all' || 
        tx.type === selectedType;
      
      // Filter by status
      const matchesStatus = 
        selectedStatus === 'all' || 
        tx.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
    
    setFilteredTransactions(filteredResults);
  }, [searchQuery, selectedType, selectedStatus, displayTransactions]);

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="All Transactions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader className="h-8 w-8 animate-spin text-falsopay-primary" />
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.transaction_id}
                  transaction={transaction}
                  currentUserId={user?.user_id.toString() || ""}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="incoming" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader className="h-8 w-8 animate-spin text-falsopay-primary" />
              </div>
            ) : filteredTransactions.filter(tx => tx.type === 'incoming').length > 0 ? (
              filteredTransactions
                .filter(tx => tx.type === 'incoming')
                .map((transaction) => (
                  <TransactionCard
                    key={transaction.transaction_id}
                    transaction={transaction}
                    currentUserId={user?.user_id.toString() || ""}
                  />
                ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No incoming transactions found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="outgoing" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader className="h-8 w-8 animate-spin text-falsopay-primary" />
              </div>
            ) : filteredTransactions.filter(tx => tx.type === 'outgoing').length > 0 ? (
              filteredTransactions
                .filter(tx => tx.type === 'outgoing')
                .map((transaction) => (
                  <TransactionCard
                    key={transaction.transaction_id}
                    transaction={transaction}
                    currentUserId={user?.user_id.toString() || ""}
                  />
                ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No outgoing transactions found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Transactions;
