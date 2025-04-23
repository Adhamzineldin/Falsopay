import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import MainLayout from '@/components/layouts/MainLayout';
import BalanceCard from '@/components/cards/BalanceCard';
import TransactionCard, { Transaction } from '@/components/cards/TransactionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BankAccountService } from '@/services/bank-account.service';
import { TransactionService } from '@/services/transaction.service';
import { Send, CreditCard, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BankAccount {
  bank_id: number;
  account_number: string;
  iban: string;
  balance: number;
  type: string;
  status: string;
}

const Dashboard = () => {
  const { user } = useApp();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const accountsResponse = await BankAccountService.getAccountsByUserId(user.user_id);
        setAccounts(accountsResponse);
        
        const transactionsResponse = await TransactionService.getTransactionsByUserId(user.user_id);
        
        const mappedTransactions = transactionsResponse.map((tx: any) => ({
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
          type: tx.sender_user_id === user.user_id ? 'outgoing' as const : 'incoming' as const
        }));
        
        setTransactions(mappedTransactions.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load your account information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  const demoAccounts = [];
  
  const demoTransactions = [];

  const displayAccounts = accounts.length ? accounts : demoAccounts;
  const displayTransactions = transactions.length ? transactions : demoTransactions;
  
  const getTotalBalance = () => {
    return displayAccounts.reduce((total, account) => total + account.balance, 0);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-4">
            <Link to="/send-money">
              <Button className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Send Money
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BalanceCard
            balance={getTotalBalance()}
            title="Total Balance"
            subtitle="Across all accounts"
            className="md:col-span-2"
          />
          
          <Card>
            <CardContent className="p-6 flex flex-col h-full justify-center">
              <h3 className="text-lg font-medium mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/send-money">
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-3" />
                    Send Money
                  </Button>
                </Link>
                <Link to="/link-account">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-3" />
                    Link Bank Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Accounts */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Accounts</h2>
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayAccounts.map((account) => (
              <BalanceCard
                key={`${account.bank_id}-${account.account_number}`}
                balance={account.balance}
                title={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                subtitle={`IBAN: ${account.iban}`}
                cardNumber={account.account_number}
              />
            ))}
          </div>
        </div>
        
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
            <Link to="/transactions">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.transaction_id}
                  transaction={transaction}
                  currentUserId={user?.user_id.toString() || ""}
                />
              ))}
              
              {displayTransactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
