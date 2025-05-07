import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Loader2, Check, X, BanknoteIcon, Clock, RefreshCw, UserRound } from 'lucide-react';
import moneyRequestService from '@/services/money-request.service';
import WebSocketService from '@/services/websocket.service';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface MoneyRequest {
  request_id: number;
  requester_name: string;
  requester_ipa_address: string;
  amount: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
}

export function MoneyRequests() {
  const [pendingRequests, setPendingRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Load pending requests
  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await moneyRequestService.getPendingRequests();
      if (response.success) {
        setPendingRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
      toast.error('Failed to load money requests');
    } finally {
      setLoading(false);
    }
  };

  // Handle WebSocket notifications
  useEffect(() => {
    const handleMoneyRequest = (data: any) => {
      if (data.action === 'new') {
        // Add the new request to the list
        setPendingRequests(prev => [data.data, ...prev]);
        
        // Show a notification toast
        toast('New Money Request', {
          description: `${data.data.requester_name} requested ${formatCurrency(data.data.amount)}`,
          action: {
            label: 'View',
            onClick: () => {
              // Could navigate to requests page
            }
          }
        });
      }
    };

    // Subscribe to money request notifications
    const unsubscribe = WebSocketService.subscribe('money_request', handleMoneyRequest);
    
    // Load pending requests on mount
    loadPendingRequests();
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Accept a money request
  const acceptRequest = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      const response = await moneyRequestService.acceptRequest(requestId);
      
      if (response.success) {
        // Handle WhatsApp notification response
        if (response.whatsapp_notification) {
          // If we received a WhatsApp notification response
          toast.success('Money request accepted', {
            description: response.message || 'Payment was sent successfully with notification.'
          });
        } else {
          // Original success handling
          toast.success('Money request accepted', {
            description: `Payment of ${formatCurrency(response.data?.request?.amount)} was sent successfully`
          });
        }
        
        // Remove the request from the list
        setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
      } else {
        toast.error('Failed to accept request', {
          description: response.message
        });
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  // Decline a money request
  const declineRequest = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      const response = await moneyRequestService.declineRequest(requestId);
      
      if (response.success) {
        // Remove the request from the list
        setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
        toast.success('Money request declined');
      } else {
        toast.error('Failed to decline request', {
          description: response.message
        });
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-md border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Pending Requests</CardTitle>
              <CardDescription className="text-sm">Requests waiting for your action</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card className="shadow-md border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Pending Requests</CardTitle>
              <CardDescription className="text-sm">Requests waiting for your action</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-10 px-6">
          <BanknoteIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground text-lg">No pending requests</p>
          <p className="text-xs text-muted-foreground mt-2">
            When someone requests money from you, it will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-full">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Pending Requests</CardTitle>
            <CardDescription className="text-sm">
              {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} waiting for your action
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {pendingRequests.map((request) => (
          <Card key={request.request_id} className="overflow-hidden border-border/50 hover:shadow-sm transition-shadow">
            <div className="bg-yellow-50 py-1 border-b border-yellow-100">
              <div className="px-4 flex items-center justify-between">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  Pending
                </Badge>
                <div className="text-xl font-semibold text-primary">
                  {formatCurrency(request.amount)}
                </div>
              </div>
            </div>
            <CardContent className="p-4 pt-3">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <UserRound className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{request.requester_name}</h4>
                  <p className="text-xs text-muted-foreground">{request.requester_ipa_address}</p>
                </div>
              </div>
              
              {request.message && (
                <div className="bg-muted/50 p-3 rounded-md my-3">
                  <p className="text-sm italic">"{request.message}"</p>
                </div>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground mb-4 mt-2">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span>Requested {new Date(request.created_at).toLocaleString()}</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex space-x-3 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => declineRequest(request.request_id)}
                  disabled={processingId === request.request_id}
                  className="h-9"
                >
                  {processingId === request.request_id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <X className="h-4 w-4 mr-1.5" />
                  )}
                  Decline
                </Button>
                
                <Button
                  variant="default"
                  onClick={() => acceptRequest(request.request_id)}
                  disabled={processingId === request.request_id}
                  className="h-9"
                >
                  {processingId === request.request_id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Check className="h-4 w-4 mr-1.5" />
                  )}
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={loadPendingRequests}
          className="text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh Requests
        </Button>
      </CardFooter>
    </Card>
  );
} 