import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  currency?: string;
  title: string;
  subtitle?: string;
  className?: string;
  cardNumber?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
                                                   balance,
                                                   currency = '€',
                                                   title,
                                                   subtitle,
                                                   className,
                                                   cardNumber
                                                 }) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatCardNumber = (number?: string) => {
    if (!number) return null;
    // Show only last 4 digits
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  return (
      <Card className={cn("overflow-hidden w-full", className)}>
        <CardContent className="p-4 sm:p-6 card-pattern text-white relative">
          <div className="absolute top-4 right-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleBalanceVisibility}
                className="text-white hover:text-white/80 hover:bg-white/10"
            >
              {isBalanceHidden ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm font-medium text-white/80">{title}</h3>
              {subtitle && <p className="text-xs text-white/60 mt-1">{subtitle}</p>}
            </div>

            <div>
              <div className="flex items-end">
              <span className="text-xl sm:text-3xl font-bold">
                {isBalanceHidden ? '••••••' : `${currency} ${formatBalance(balance)}`}
              </span>
              </div>
            </div>

            {cardNumber && (
                <div className="mt-2 sm:mt-4">
                  <p className="text-xs sm:text-sm text-white/80">{formatCardNumber(cardNumber)}</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
  );
};

export default BalanceCard;