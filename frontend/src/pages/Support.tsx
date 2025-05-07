import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { SupportService, SupportTicket, TicketWithReplies } from '@/services/support.service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Plus, Check, Clock, X, ArrowRight, HelpCircle, MessageSquare, RotateCw } from 'lucide-react';

const Support = () => {
  const { user, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketWithReplies | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(
    ticketId ? "activeTicket" : "newTicket"
  );

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    
    fetchTickets();
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    if (ticketId && user) {
      fetchTicket(parseInt(ticketId, 10));
      setActiveTab("activeTicket");
    }
  }, [ticketId, user]);

  useEffect(() => {
    if (tickets.length > 0 && !ticketId && activeTab !== "newTicket") {
      setActiveTab("myTickets");
    }
  }, [tickets, ticketId]);

  const fetchTickets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userTickets = await SupportService.getUserTickets(user.user_id);
      setTickets(userTickets);
      
      if (userTickets.length > 0 && !ticketId) {
        // Load the first ticket if none is selected
        fetchTicket(userTickets[0].ticket_id);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicket = async (id: number) => {
    if (!user) return;
    
    try {
      const ticket = await SupportService.getTicket(id, user.user_id);
      setActiveTicket(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket details",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please provide both subject and message",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Add SupportService implementation
      // await SupportService.createTicket({
      //   user_id: user.user_id,
      //   subject,
      //   message
      // });
      
      toast({
        title: "Success",
        description: "Your support ticket has been submitted",
      });
      
      // Reset form and refresh tickets
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Error",
        description: "Failed to submit support ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!user || !activeTicket) return;
    
    if (!reply.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    
    setIsReplying(true);
    try {
      await SupportService.addReply({
        ticket_id: activeTicket.ticket.ticket_id,
        message: reply.trim(),
        user_id: user.user_id
      });
      
      setReply('');
      toast({
        title: "Success",
        description: "Your reply has been sent",
      });
      
      // Refresh the active ticket to show the new reply
      fetchTicket(activeTicket.ticket.ticket_id);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send your reply",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open':
        return <Badge variant="default" className="bg-green-500">Open</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'open':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'closed':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Support Center</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="newTicket">New Ticket</TabsTrigger>
            <TabsTrigger value="myTickets">My Tickets</TabsTrigger>
            {activeTicket && (
              <TabsTrigger value="activeTicket">
                Ticket #{activeTicket.ticket.ticket_id}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="newTicket">
            <Card>
              <CardHeader>
                <CardTitle>Submit Support Request</CardTitle>
                <CardDescription>
                  Our team will respond to your request as soon as possible.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="Enter the subject of your request" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Describe your issue or question in detail" 
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="myTickets">
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>
                  View and manage your existing support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="loader">Loading...</div>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't created any support tickets yet.</p>
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("newTicket")}
                    >
                      Create your first ticket
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div 
                        key={ticket.ticket_id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
                        onClick={() => {
                          fetchTicket(ticket.ticket_id);
                          setActiveTab("activeTicket");
                        }}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(ticket.status)}
                            <h3 className="font-semibold">{ticket.subject}</h3>
                          </div>
                          <p className="text-sm text-gray-500">
                            Created on {formatDate(ticket.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.status)}
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("newTicket")}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {activeTicket && (
            <TabsContent value="activeTicket">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{activeTicket.ticket.subject}</CardTitle>
                      <CardDescription>
                        Created on {formatDate(activeTicket.ticket.created_at)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(activeTicket.ticket.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold">
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(activeTicket.ticket.created_at)}
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{activeTicket.ticket.message}</p>
                  </div>
                  
                  {activeTicket.replies.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Responses</h3>
                      {activeTicket.replies.map((reply) => (
                        <div 
                          key={reply.reply_id} 
                          className={`border rounded-lg p-4 ${reply.is_admin ? 'bg-blue-50' : 'bg-gray-50'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold flex items-center gap-2">
                              {reply.first_name} {reply.last_name}
                              {reply.is_admin && (
                                <Badge variant="secondary" className="text-xs">Support Team</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(reply.created_at)}
                            </div>
                          </div>
                          <p className="whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTicket.ticket.status !== 'closed' && (
                    <div className="space-y-2">
                      <Label htmlFor="reply">Add a Reply</Label>
                      <Textarea
                        id="reply"
                        placeholder="Type your message here..."
                        rows={4}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                      />
                      <Button 
                        onClick={handleSendReply} 
                        disabled={isReplying}
                        className="mt-2"
                      >
                        {isReplying ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("myTickets")}
                  >
                    Back to My Tickets
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Support; 