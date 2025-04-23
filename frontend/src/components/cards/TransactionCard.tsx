
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Transaction {
  transaction_id: string;
  amount: number;
  currency: string;
  sender: {
    name: string;
    user_id: string;
  };
  receiver: {
    name: string;
    user_id: string;
  };
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'incoming' | 'outgoing';
}

interface TransactionCardProps {
  transaction: Transaction;
  currentUserId: string;
  className?: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  currentUserId,
  className
}) => {
  const isIncoming = transaction.receiver.user_id === currentUserId;
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isIncoming ? "bg-green-100" : "bg-blue-100"
            )}>
              {isIncoming ? (
                <ArrowDownRight className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
              )}
            </div>
            
            <div>
              <h3 className="font-medium">
                {isIncoming ? 'Received from' : 'Sent to'} {isIncoming ? transaction.sender.name : transaction.receiver.name}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={cn(
              "font-semibold text-lg",
              isIncoming ? "text-green-600" : "text-gray-800"
            )}>
              {isIncoming ? '+' : '-'} {transaction.currency} {formatAmount(transaction.amount)}
            </p>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              getStatusColor(transaction.status)
            )}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
