import { useEffect, useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Clock, Send, Download, Calendar, DollarSign, ListFilter, X, Check, Lock } from 'lucide-react';
import WebSocketService from '@/services/websocket.service';
import moneyRequestService from '@/services/money-request.service';
import { RequestMoney } from '@/components/money-requests/RequestMoney';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IPAService } from '@/services/ipa.service';
import PinVerification from '@/components/PinVerification';

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

interface IpaOption {
  ipa_id: number;
  ipa_address: string;
  account_number: string;
  bank_name?: string;
}

export default function MoneyRequestsPage() {
  const { user } = useApp();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allRequests, setAllRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<MoneyRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserIpas, setCurrentUserIpas] = useState<IpaOption[]>([]);
  const [selectedIpa, setSelectedIpa] = useState<string>('');
  const [isLoadingIpas, setIsLoadingIpas] = useState(false);
  const [requestToDecline, setRequestToDecline] = useState<number | null>(null);
  
  const pinInputRef = useRef<HTMLInputElement>(null);
  
  // Check for accept query parameter on mount
  useEffect(() => {
    const acceptRequestId = searchParams.get('accept');
    if (acceptRequestId) {
      // Load the specific request and open the dialog
      const requestId = parseInt(acceptRequestId);
      if (!isNaN(requestId)) {
        handleAcceptRequest(requestId);
      }
      // Remove the query parameter
      searchParams.delete('accept');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

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

  // Load user's IPA addresses
  const loadUserIpas = async () => {
    try {
      setIsLoadingIpas(true);
      const userId = user?.user_id;
      if (!userId) return;
      
      const ipas = await IPAService.getIPAsByUserId(userId);
      setCurrentUserIpas(ipas || []);
      // Set the default IPA if available
      if (ipas && ipas.length > 0) {
        setSelectedIpa(ipas[0].ipa_address);
      }
    } catch (error) {
      console.error('Error loading user IPAs:', error);
    } finally {
      setIsLoadingIpas(false);
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
    loadUserIpas();
    
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

  // Prepare to accept a request
  const handleAcceptRequest = async (requestId: number) => {
    // Find the request in our list
    const request = allRequests.find(req => req.request_id === requestId);
    
    if (!request) {
      // Try to load the request from the server
      try {
        const response = await moneyRequestService.getRequestById(requestId);
        if (response.success && response.data) {
          setSelectedRequest(response.data);
          setIsPinDialogOpen(true);
        } else {
          toast.error('Failed to find the money request');
        }
      } catch (error) {
        console.error('Error loading request:', error);
        toast.error('Failed to load money request details');
      }
    } else {
      setSelectedRequest(request);
      setIsPinDialogOpen(true);
    }
  };
  
  // Process the request with the PIN
  const processRequest = async (pin: string) => {
    if (!selectedRequest || !selectedIpa) {
      toast.error('Please provide all required information');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Accept the request with PIN and IPA
      const response = await moneyRequestService.acceptRequest(selectedRequest.request_id, {
        pin,
        sender_ipa_address: selectedIpa
      });
      
      if (response.success) {
        toast.success('Money request accepted', {
          description: `Payment of ${formatCurrency(response.data.request.amount)} was sent successfully`
        });
        
        // Update the list
        setAllRequests(prev => 
          prev.map(req => 
            req.request_id === selectedRequest.request_id 
              ? { ...req, status: 'accepted', transaction_id: response.data.transaction.transaction_id } 
              : req
          )
        );
        
        // Close dialog and reset state
        setIsPinDialogOpen(false);
        setPin('');
        setSelectedRequest(null);
      } else {
        toast.error('Failed to accept request', {
          description: response.message
        });
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    } finally {
      setIsProcessing(false);
    }
  };

  // Prepare to decline a request
  const handleDeclineRequest = (requestId: number) => {
    setRequestToDecline(requestId);
    setIsDeclineDialogOpen(true);
  };

  // Confirm decline of a money request
  const confirmDeclineRequest = async () => {
    if (!requestToDecline) return;
    
    try {
      setIsProcessing(true);
      const response = await moneyRequestService.declineRequest(requestToDecline);
      
      if (response.success) {
        toast.success('Money request declined');
        
        // Update the list
        setAllRequests(prev => 
          prev.map(req => 
            req.request_id === requestToDecline 
              ? { ...req, status: 'declined' } 
              : req
          )
        );
      } else {
        toast.error('Failed to decline request', {
          description: response.message
        });
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
    } finally {
      setIsProcessing(false);
      setIsDeclineDialogOpen(false);
      setRequestToDecline(null);
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
          {/* Left column - Request Money */}
          <div className="md:col-span-1 space-y-6">
            {/* Request Money Form */}
            <RequestMoney onRequestSent={loadAllRequests} />
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

                                <div className="flex items-center text-xs text-muted-foreground mb-4">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                  <span>Requested {new Date(request.created_at).toLocaleString()}</span>
                                </div>
                                
                                {/* Action buttons for pending requests that are not sent by the current user */}
                                {request.status === 'pending' && !isRequestSentByUser(request) && (
                                  <>
                                    <Separator className="my-3" />
                                    <div className="flex justify-end space-x-3 mt-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeclineRequest(request.request_id)}
                                        className="text-xs h-8"
                                      >
                                        <X className="h-3.5 w-3.5 mr-1.5" />
                                        Decline
                                      </Button>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleAcceptRequest(request.request_id)}
                                        className="text-xs h-8"
                                      >
                                        <Check className="h-3.5 w-3.5 mr-1.5" />
                                        Pay Now
                                      </Button>
                                    </div>
                                  </>
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

      {/* PIN Verification Dialog */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Please enter your PIN to accept this money request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/30 p-4 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-lg font-semibold text-primary">{formatCurrency(selectedRequest.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">From:</span>
                  <span className="text-sm">{selectedRequest.requester_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">IPA Address:</span>
                  <span className="text-sm text-muted-foreground">{selectedRequest.requester_ipa_address}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="select-ipa">Select your IPA to pay from:</Label>
                  <select 
                    id="select-ipa"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedIpa}
                    onChange={(e) => setSelectedIpa(e.target.value)}
                    disabled={isLoadingIpas || isProcessing}
                  >
                    {isLoadingIpas ? (
                      <option>Loading IPA addresses...</option>
                    ) : currentUserIpas.length === 0 ? (
                      <option value="">No IPA addresses found</option>
                    ) : (
                      currentUserIpas.map((ipa) => (
                        <option key={ipa.ipa_id} value={ipa.ipa_address}>
                          {ipa.ipa_address} {ipa.bank_name ? `(${ipa.bank_name})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pin-input" className="text-sm">Enter your PIN:</Label>
                  <PinVerification
                    onPinSubmit={processRequest}
                    isLoading={isProcessing}
                    title=""
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPinDialogOpen(false);
                setPin('');
                setSelectedRequest(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Decline</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this money request?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              The requester will be notified that you have declined their request. This action cannot be undone.
            </p>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeclineDialogOpen(false);
                setRequestToDecline(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeclineRequest}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 