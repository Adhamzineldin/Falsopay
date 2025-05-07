import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, WrenchIcon } from 'lucide-react';

interface MaintenanceScreenProps {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}

const MaintenanceScreen = ({ message, onRetry, isRetrying }: MaintenanceScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 px-6 pb-8 flex flex-col items-center text-center">
          <div className="bg-amber-100 p-3 rounded-full mb-4">
            <WrenchIcon className="h-10 w-10 text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-falsopay-primary">FalsoPay Maintenance</h1>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">{message || 'Our system is currently unavailable due to scheduled maintenance. Please try again later.'}</p>
          </div>
          
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Checking System Status...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Connection
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500 mt-6 max-w-md text-center">
        If this issue persists, please contact our support team for assistance.
      </p>
    </div>
  );
};

export default MaintenanceScreen; 