import { useEffect, useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Clock, Send, Download, Calendar, DollarSign, ListFilter, X, Check, Lock, Mail } from 'lucide-react';
import WebSocketService from '@/services/websocket.service';
import moneyRequestService from '@/services/money-request.service';
import { RequestMoney } from '@/components/money-requests/RequestMoney';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IPAService } from '@/services/ipa.service';
import PinVerification from '@/components/PinVerification';
import WhatsAppHelper from '@/utils/whatsapp-helper';

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
      
      // First check if the response contains a WhatsApp notification
      if (response && response.whatsapp_notification) {
        // We received a WhatsApp notification response
        toast.success('Money request accepted', {
          description: response.message || `Payment of ${formatCurrency(selectedRequest.amount)} was sent successfully with notification.`
        });
        
        // Update the UI to show the request as accepted
        setAllRequests(prev => 
          prev.map(req => 
            req.request_id === selectedRequest.request_id 
              ? { 
                  ...req, 
                  status: 'accepted', 
                  transaction_id: response.transaction_id || 0
                } 
              : req
          )
        );
        
        // Close the dialogs
        setIsPinDialogOpen(false);
        setPin('');
        setSelectedRequest(null);
        return;
      }
      
      // Handle regular success response
      if (response && response.success === true) {
        toast.success('Money request accepted', {
          description: response.message || `Payment of ${formatCurrency(selectedRequest.amount)} was sent successfully`
        });
        
        // Update the UI to show the request as accepted
        setAllRequests(prev => 
          prev.map(req => 
            req.request_id === selectedRequest.request_id 
              ? { 
                  ...req, 
                  status: 'accepted', 
                  transaction_id: response.data?.transaction?.transaction_id || response.transaction_id || 0
                } 
              : req
          )
        );
        
        // Close the dialog
        setIsPinDialogOpen(false);
        setPin('');
        setSelectedRequest(null);
        return;
      }
      
      // Handle success response with just a transaction ID
      if (response && response.transaction_id > 0) {
        toast.success('Money request accepted', {
          description: `Payment of ${formatCurrency(selectedRequest.amount)} was processed successfully`
        });
        
        // Update the UI to show the request as accepted
        setAllRequests(prev => 
          prev.map(req => 
            req.request_id === selectedRequest.request_id 
              ? { 
                  ...req, 
                  status: 'accepted', 
                  transaction_id: response.transaction_id
                } 
              : req
          )
        );
        
        // Close the dialog
        setIsPinDialogOpen(false);
        setPin('');
        setSelectedRequest(null);
        return;
      }
      
      // If we get here, something went wrong
      toast.error('Failed to process the request', {
        description: response?.message || 'An unexpected error occurred'
      });
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Failed to process the request', {
        description: error.message || 'An unexpected error occurred'
      });
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Money Requests</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={loadAllRequests} variant="outline" size="sm" className="text-xs flex-1 sm:flex-auto">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4 sm:mb-6 text-xs sm:text-sm">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                <Card className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {activeTab === 'all' && 'All Requests'}
                        {activeTab === 'pending' && 'Pending Requests'}
                        {activeTab === 'sent' && 'Sent Requests'}
                        {activeTab === 'received' && 'Received Requests'}
                      </CardTitle>
                      {loading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>
                      {getFilteredRequests().length} request{getFilteredRequests().length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                      </div>
                    ) : getFilteredRequests().length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No money requests found</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                          {activeTab === 'pending' && "You don't have any pending money requests"}
                          {activeTab === 'sent' && "You haven't sent any money requests yet"}
                          {activeTab === 'received' && "You haven't received any money requests yet"}
                          {activeTab === 'all' && "No money requests found in your account"}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {getFilteredRequests().map((request) => (
                          <div 
                            key={request.request_id} 
                            className="p-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(request.status)}
                                <h3 className="font-medium truncate">
                                  {isRequestSentByUser(request) 
                                    ? `To: ${request.requested_name}` 
                                    : `From: ${request.requester_name}`}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(request.status)}
                                <span className="font-semibold text-primary whitespace-nowrap">
                                  {formatCurrency(request.amount)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1 text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="text-xs truncate">
                                  {isRequestSentByUser(request) 
                                    ? request.requested_ipa_address 
                                    : request.requester_ipa_address}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-xs">
                                  {new Date(request.created_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            
                            {request.message && (
                              <div className="bg-muted/30 p-2 rounded-md mt-3 mb-1">
                                <p className="text-sm italic">"{request.message}"</p>
                              </div>
                            )}
                            
                            {request.status === 'pending' && !isRequestSentByUser(request) && (
                              <div className="flex flex-col xs:flex-row gap-2 mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDeclineRequest(request.request_id)}
                                  className="flex-1 xs:flex-initial h-9"
                                >
                                  <X className="h-4 w-4 mr-1.5" />
                                  Decline
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAcceptRequest(request.request_id)}
                                  className="flex-1 xs:flex-initial h-9"
                                >
                                  <Check className="h-4 w-4 mr-1.5" />
                                  Pay {formatCurrency(request.amount)}
                                </Button>
                              </div>
                            )}
                            
                            {request.transaction_id && request.status === 'accepted' && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Transaction ID: {request.transaction_id}
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-5 w-full">
            <RequestMoney onRequestSent={() => loadAllRequests()} />
          </div>
        </div>
      </div>
      
      {/* PIN verification dialog */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="text-sm mt-2">
                  Pay <span className="font-semibold">{formatCurrency(selectedRequest.amount)}</span> to{' '}
                  <span className="font-semibold">{selectedRequest.requester_name}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-sm font-medium">Your PIN</Label>
              <PinVerification 
                maxLength={4} 
                onPinSubmit={val => setPin(val)}
                hideVerifyButton={false}
                autoSubmit={true}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ipa" className="text-sm font-medium">From IPA Address</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedIpa}
                onChange={(e) => setSelectedIpa(e.target.value)}
                disabled={isLoadingIpas}
              >
                {isLoadingIpas && <option value="">Loading...</option>}
                {!isLoadingIpas && currentUserIpas.length === 0 && (
                  <option value="">No IPAs available</option>
                )}
                {currentUserIpas.map(ipa => (
                  <option key={ipa.ipa_id} value={ipa.ipa_address}>
                    {ipa.ipa_address} ({ipa.bank_name || 'Unknown Bank'})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPinDialogOpen(false);
                setPin('');
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => processRequest(pin)}
              disabled={pin.length < 4 || !selectedIpa || isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Confirm & Pay
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Decline confirmation dialog */}
      <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Confirm Decline</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this money request?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeclineDialogOpen(false);
                setRequestToDecline(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeclineRequest}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Decline Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 