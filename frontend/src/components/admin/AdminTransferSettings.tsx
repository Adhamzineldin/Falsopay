import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SystemService, SystemSettings } from '@/services/system.service';
import { AlertCircle, AlertTriangle, Ban, Check, DollarSign, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminTransferSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Local state for form 
  const [transferLimitEnabled, setTransferLimitEnabled] = useState(false);
  const [transferLimitAmount, setTransferLimitAmount] = useState('5000');
  const [transactionsBlocked, setTransactionsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setTransferLimitEnabled(settings.transfer_limit_enabled);
      setTransferLimitAmount(settings.transfer_limit_amount.toString());
      setTransactionsBlocked(settings.transactions_blocked);
      setBlockMessage(settings.block_message);
    }
  }, [settings]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await SystemService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Validate the transfer limit amount
      const amount = parseFloat(transferLimitAmount);
      if (transferLimitEnabled && (isNaN(amount) || amount <= 0)) {
        toast({
          title: "Validation Error",
          description: "Transfer limit must be a positive number",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Validate block message if blocking transactions
      if (transactionsBlocked && !blockMessage.trim()) {
        toast({
          title: "Validation Error",
          description: "Please provide a message explaining why transactions are blocked",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const updatedSettings = await SystemService.updateSystemSettings({
        transfer_limit_enabled: transferLimitEnabled,
        transfer_limit_amount: amount,
        transactions_blocked: transactionsBlocked,
        block_message: blockMessage,
      });

      setSettings(updatedSettings);
      toast({
        title: "Success",
        description: "Transfer settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Transfer Settings
        </CardTitle>
        <CardDescription>
          Configure system-wide transfer limits and transaction status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transfer Limit Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Transfer Limit</h3>
              <p className="text-sm text-muted-foreground">
                Set a maximum amount users can transfer in a single transaction
              </p>
            </div>
            <Switch 
              checked={transferLimitEnabled} 
              onCheckedChange={setTransferLimitEnabled}
            />
          </div>
          
          {transferLimitEnabled && (
            <div className="mt-2">
              <Label htmlFor="transfer-limit">Maximum Transfer Amount</Label>
              <div className="flex items-center mt-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">EGP</span>
                  <Input
                    id="transfer-limit"
                    type="number"
                    min="1"
                    step="1"
                    className="pl-14"
                    value={transferLimitAmount}
                    onChange={(e) => setTransferLimitAmount(e.target.value)}
                    placeholder="Enter maximum transfer amount"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Users will not be able to transfer more than this amount in a single transaction
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Block Transactions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Block All Transactions</h3>
              <p className="text-sm text-muted-foreground">
                Temporarily disable all money transfers system-wide
              </p>
            </div>
            <Switch 
              checked={transactionsBlocked} 
              onCheckedChange={setTransactionsBlocked}
            />
          </div>
          
          {transactionsBlocked && (
            <div className="mt-2">
              <Label htmlFor="block-message">Message to Users</Label>
              <Textarea
                id="block-message"
                value={blockMessage}
                onChange={(e) => setBlockMessage(e.target.value)}
                placeholder="Explain why transactions are blocked (e.g., Maintenance from 2-4 PM)"
                rows={3}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be displayed to users when they attempt to make a transaction
              </p>
            </div>
          )}
        </div>

        {/* Current Status Alert */}
        {(transferLimitEnabled || transactionsBlocked) && (
          <Alert variant={transactionsBlocked ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {transactionsBlocked 
                ? "Transactions are currently blocked" 
                : transferLimitEnabled 
                  ? `Transfer limit of EGP ${transferLimitAmount} is active`
                  : ""}
            </AlertTitle>
            <AlertDescription>
              {transactionsBlocked 
                ? blockMessage || "All money transfers are disabled"
                : transferLimitEnabled
                  ? "Users cannot transfer more than this amount in a single transaction"
                  : ""}
            </AlertDescription>
          </Alert>
        )}

        {settings && (
          <div className="text-xs text-muted-foreground">
            Last updated: {formatDate(settings.updated_at || settings.last_updated)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={fetchSettings} disabled={isSaving}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Separator component
const Separator = () => (
  <div className="my-4 h-[1px] w-full bg-border" />
);

export default AdminTransferSettings; 