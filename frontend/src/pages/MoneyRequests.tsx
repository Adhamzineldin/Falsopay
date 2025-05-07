import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import MainLayout from '@/components/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Clock, Send, Download, Calendar, DollarSign, ListFilter } from 'lucide-react';
import WebSocketService from '@/services/websocket.service';
import moneyRequestService from '@/services/money-request.service';
import { MoneyRequests } from '@/components/money-requests/MoneyRequests';
import { RequestMoney } from '@/components/money-requests/RequestMoney';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { Separator } from '@/components/ui/separator';

interface MoneyRequest {
  request_id: number;
  requester_user_id: number;
  requested_user_id: number;
  requester_name: string;
  requested_name: string;
  requester_ipa_address: string;
  requested_ipa_address: string;
  amount: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  transaction_id: number | null;
  created_at: string;
  updated_at: string;
}

export default function MoneyRequestsPage() {
  const { user } = useApp();
  const [allRequests, setAllRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Load all money requests
  const loadAllRequests = async () => {
    try {
      setLoading(true);
      const response = await moneyRequestService.getAllRequests();
      if (response.success) {
        setAllRequests(response.data || []);
      } else {
        toast.error('Failed to load money requests');
      }
    } catch (error) {
      console.error('Error loading money requests:', error);
      toast.error('Failed to load money requests');
    } finally {
      setLoading(false);
    }
  };

  // Handle WebSocket notifications for money requests
  useEffect(() => {
    const handleMoneyRequest = (data: any) => {
      // Refresh the list when a request is updated
      loadAllRequests();
    };

    // Subscribe to money request notifications
    const unsubscribe = WebSocketService.subscribe('money_request', handleMoneyRequest);
    
    // Load money requests on mount
    loadAllRequests();
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Helper to determine if the request was sent by the current user
  const isRequestSentByUser = (request: MoneyRequest) => {
    return request.requester_user_id === user?.user_id;
  };

  // Filter requests based on the active tab
  const getFilteredRequests = () => {
    if (activeTab === 'pending') {
      return allRequests.filter(req => req.status === 'pending');
    } else if (activeTab === 'sent') {
      return allRequests.filter(req => isRequestSentByUser(req));
    } else if (activeTab === 'received') {
      return allRequests.filter(req => !isRequestSentByUser(req));
    } else {
      return allRequests;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Declined</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get icon based on request status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <RefreshCw className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Money Requests</h1>
            <p className="text-muted-foreground mt-1">Request and manage payments between FalsoPay users</p>
          </div>
          <Button 
            variant="outline"
            onClick={loadAllRequests}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Request Money & Active Requests */}
          <div className="md:col-span-1 space-y-6">
            {/* Request Money Form */}
            <RequestMoney onRequestSent={loadAllRequests} />
            
            {/* Pending Money Requests */}
            <div>
              <MoneyRequests />
            </div>
          </div>

          {/* Right column - Money Request History */}
          <div className="md:col-span-2">
            <Card className="shadow-md border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg pb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Money Request History</CardTitle>
                    <CardDescription className="text-sm">View all your sent and received money requests</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-5 grid grid-cols-4 h-11">
                    <TabsTrigger value="all" className="flex items-center gap-1">
                      <ListFilter className="h-4 w-4" />
                      <span>All</span>
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Pending</span>
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center gap-1">
                      <Send className="h-4 w-4" />
                      <span>Sent</span>
                    </TabsTrigger>
                    <TabsTrigger value="received" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>Received</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab}>
                    {loading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      </div>
                    ) : getFilteredRequests().length === 0 ? (
                      <div className="text-center py-12 space-y-3">
                        <RefreshCw className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground text-lg">No money requests found</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {getFilteredRequests().map((request) => (
                          <Card key={request.request_id} className="border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row">
                              {/* Status indicator column */}
                              <div className={`w-full sm:w-2 
                                ${request.status === 'pending' ? 'bg-yellow-200' : 
                                  request.status === 'accepted' ? 'bg-green-200' : 
                                  request.status === 'declined' ? 'bg-red-200' : 'bg-gray-200'}`}
                              />
                              
                              <div className="flex-1 p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    {isRequestSentByUser(request) ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-sm text-muted-foreground">To:</span>
                                        <span className="font-medium">{request.requested_name}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-sm text-muted-foreground">From:</span>
                                        <span className="font-medium">{request.requester_name}</span>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                      <span>{isRequestSentByUser(request) 
                                        ? request.requested_ipa_address
                                        : request.requester_ipa_address}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(request.status)}
                                      {getStatusBadge(request.status)}
                                    </div>
                                    <div className="text-lg font-semibold mt-1">
                                      {formatCurrency(request.amount)}
                                    </div>
                                  </div>
                                </div>
                                
                                {request.message && (
                                  <div className="bg-muted/50 p-3 rounded-md mb-3">
                                    <p className="text-sm italic">"{request.message}"</p>
                                  </div>
                                )}
                                
                                <Separator className="my-3" />
                                
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Created: {new Date(request.created_at).toLocaleString()}</span>
                                  </div>
                                  {request.status !== 'pending' && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span>
                                        {request.status === 'accepted' 
                                          ? `Accepted: ${new Date(request.updated_at).toLocaleString()}`
                                          : `Declined: ${new Date(request.updated_at).toLocaleString()}`
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {request.transaction_id && (
                                  <div className="mt-2 bg-primary/5 rounded-md p-2 text-xs">
                                    <span className="text-muted-foreground">Transaction ID: </span>
                                    <span className="font-mono">{request.transaction_id}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 