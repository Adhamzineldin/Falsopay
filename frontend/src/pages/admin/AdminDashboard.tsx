import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { UserService, UserData } from '@/services/user.service';
import { SupportService, SupportTicket, TicketWithReplies } from '@/services/support.service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Users, 
  TicketIcon, 
  RefreshCw, 
  Filter, 
  User, 
  Check,
  Clock,
  X,
  ShieldAlert,
  ShieldCheck,
  Activity,
  DollarSign,
  Lock,
  Unlock
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminSystemStatus from '@/components/admin/AdminSystemStatus';
import AdminTransferSettings from '@/components/admin/AdminTransferSettings';

interface UserActionDialogProps {
  user: UserData;
  onClose: () => void;
  onBlock: (userId: number, reason: string) => Promise<void>;
  onUnblock: (userId: number) => Promise<void>;
}

const AdminDashboard = () => {
  const { user, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketWithReplies | null>(null);
  const [reply, setReply] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [isProcessingUserAction, setIsProcessingUserAction] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have administrator privileges",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
    
    fetchUsers();
    fetchTickets();
  }, [user, isAuthenticated, navigate]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const allUsers = await UserService.getAllUsers();
      // Make sure we have a valid array of users
      setUsers(Array.isArray(allUsers) ? allUsers : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      setUsers([]); // Initialize with empty array on error
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    try {
      let ticketList: SupportTicket[];
      
      if (statusFilter === 'all') {
        ticketList = await SupportService.getAllTickets();
      } else if (statusFilter === 'public') {
        // Get all tickets and filter for public ones
        const allTickets = await SupportService.getAllTickets();
        ticketList = allTickets.filter(ticket => ticket.is_public);
      } else {
        ticketList = await SupportService.getTicketsByStatus(statusFilter);
      }
      
      // Make sure we have a valid array of tickets
      setTickets(Array.isArray(ticketList) ? ticketList : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive",
      });
      setTickets([]); // Initialize with empty array on error
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const fetchTicketDetails = async (ticketId: number) => {
    try {
      const ticket = await SupportService.getTicketAdmin(ticketId);
      setActiveTicket(ticket);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket details",
        variant: "destructive",
      });
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    // Reset active ticket when changing filter
    setActiveTicket(null);
  };

  const handleSendReply = async () => {
    if (!user || !activeTicket || !reply.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingReply(true);
    try {
      // Check if this is a public ticket or regular ticket
      if (activeTicket.ticket.is_public) {
        // For public tickets, use the public reply endpoint
        await SupportService.addPublicTicketReply({
          ticket_id: activeTicket.ticket.ticket_id,
          message: reply.trim(),
        });
      } else {
        // For regular tickets with user_id, use the admin reply endpoint
        await SupportService.addAdminReply({
          admin_user_id: user.user_id,
          ticket_id: activeTicket.ticket.ticket_id,
          message: reply.trim(),
        });
      }
      
      setReply('');
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Warning",
        description: "There was an issue, but your reply might still have been sent. Refreshing to check.",
        variant: "destructive",
      });
    } finally {
      // Always refresh ticket details to show the new reply, regardless of success/failure
      // since the data might be saved even if the API returned an error
      await fetchTicketDetails(activeTicket.ticket.ticket_id);
      setIsSubmittingReply(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: number, status: string) => {
    try {
      await SupportService.updateTicketStatus(ticketId, status);
      
      toast({
        title: "Success",
        description: `Ticket status updated to ${status}`,
      });
      
      // Refresh active ticket if it's the same one
      if (activeTicket && activeTicket.ticket.ticket_id === ticketId) {
        fetchTicketDetails(ticketId);
      }
      
      // Refresh the ticket list
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const handleSetUserRole = async (userId: number, role: string) => {
    if (!selectedUser) return;
    
    // Prevent demoting user ID 1 from admin to regular user
    if (userId === 1 && role !== 'admin') {
      toast({
        title: "Access Denied",
        description: `FUCK YOU ${user?.first_name} YOU CAN'T DEMOTE YOUR FATHER`,
        variant: "destructive",
      });
      setIsChangingRole(false);
      setSelectedUser(null);
      return;
    }
    
    setIsChangingRole(true);
    try {
      await UserService.setUserRole(userId, role);
      
      toast({
        title: "Success",
        description: `User role updated to ${role}`,
      });
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.user_id === userId ? { ...u, role } : u
      ));
      
      // Close the dialog
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setIsChangingRole(false);
    }
  };

  // Block user handler
  const handleBlockUser = async (userId: number, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for blocking this user",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingUserAction(true);
    try {
      const success = await UserService.blockUser(userId, reason);
      
      if (success) {
        toast({
          title: "Success",
          description: "User has been blocked successfully",
        });
        
        // Update the user status in the list
        setUsers(users.map(u => 
          u.user_id === userId ? { ...u, status: 'blocked' } : u
        ));
        
        // Close the dialog and reset form
        setSelectedUser(null);
        setBlockReason('');
        setShowBlockDialog(false);
      } else {
        throw new Error("Failed to block user");
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    } finally {
      setIsProcessingUserAction(false);
    }
  };

  // Unblock user handler
  const handleUnblockUser = async (userId: number) => {
    setIsProcessingUserAction(true);
    try {
      const success = await UserService.unblockUser(userId);
      
      if (success) {
        toast({
          title: "Success",
          description: "User has been unblocked successfully",
        });
        
        // Update the user status in the list
        setUsers(users.map(u => 
          u.user_id === userId ? { ...u, status: 'active' } : u
        ));
        
        // Close the dialog
        setSelectedUser(null);
        setShowUnblockDialog(false);
      } else {
        throw new Error("Failed to unblock user");
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
    } finally {
      setIsProcessingUserAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">In Progress</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Closed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <Activity className="h-4 w-4 text-yellow-600" />;
      case 'closed':
        return <Check className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Admin</Badge>;
      case 'user':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">User</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">{role}</Badge>;
    }
  };

  const getUserStatusBadge = (status?: string) => {
    switch (status) {
      case 'blocked':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Blocked</Badge>;
      case 'active':
      default:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Active</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-2 py-2 md:px-4 md:py-4 max-w-full">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">Admin Dashboard</h1>
        
        <Tabs defaultValue="support" className="w-full">
          <TabsList className="mb-3 md:mb-4 w-full overflow-x-auto flex-nowrap whitespace-nowrap max-w-full">
            <TabsTrigger value="support" className="text-xs sm:text-sm px-1 py-1 sm:px-2">
              <TicketIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden xs:inline">Support</span> Tickets
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-1 py-1 sm:px-2">
              <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden xs:inline">User</span> Management
            </TabsTrigger>
            <TabsTrigger value="transfers" className="text-xs sm:text-sm px-1 py-1 sm:px-2">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden xs:inline">Transfer</span> Settings
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm px-1 py-1 sm:px-2">
              <Activity className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden xs:inline">System</span> Status
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="lg:col-span-1">
                <Card className="overflow-hidden">
                  <CardHeader className="p-3 md:p-4">
                    <CardTitle className="flex justify-between items-center text-base md:text-lg">
                      <span className="truncate">Support Tickets</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={fetchTickets}
                        title="Refresh tickets"
                        className="h-7 w-7"
                      >
                        <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Manage customer support tickets
                    </CardDescription>
                    
                    <div className="mt-2 md:mt-3">
                      <Label htmlFor="status-filter" className="text-xs md:text-sm">Filter by Status</Label>
                      <Select 
                        value={statusFilter} 
                        onValueChange={handleStatusFilterChange}
                      >
                        <SelectTrigger id="status-filter" className="mt-1 h-8 text-xs md:text-sm">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tickets</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="public">Public Tickets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4 pt-0 md:pt-0 max-h-[40vh] md:max-h-[calc(100vh-300px)] overflow-y-auto">
                    {isLoadingTickets ? (
                      <div className="flex justify-center py-3 md:py-4">
                        <div className="loader text-sm">Loading...</div>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="text-center py-3 md:py-4">
                        <p className="text-gray-500 text-xs md:text-sm">No tickets found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tickets && tickets.map((ticket) => (
                          <div 
                            key={ticket.ticket_id}
                            className={`border rounded-lg p-2 hover:bg-gray-50 cursor-pointer transition-colors ${activeTicket?.ticket.ticket_id === ticket.ticket_id ? 'border-blue-500 bg-blue-50' : ''}`}
                            onClick={() => fetchTicketDetails(ticket.ticket_id)}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {getStatusIcon(ticket.status)}
                              <h3 className="font-semibold text-xs line-clamp-1">{ticket.subject}</h3>
                              {ticket.is_public ? (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-[10px] px-1 py-0 h-4 shrink-0">Public</Badge>
                              ) : " "}
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 mr-1">
                                {ticket.is_public 
                                  ? ticket.contact_name || `${ticket.first_name} ${ticket.last_name}`
                                  : `${ticket.first_name} ${ticket.last_name}`
                                }
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                {getStatusBadge(ticket.status)}
                              </div>
                            </div>
                            <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                              {formatDate(ticket.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2 mt-3 lg:mt-0">
                {activeTicket ? (
                  <Card className="overflow-hidden">
                    <CardHeader className="p-3 md:p-4">
                      <div className="flex flex-col gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1 md:gap-2">
                            <CardTitle className="text-base md:text-lg break-words">{activeTicket.ticket.subject}</CardTitle>
                            {activeTicket.ticket.is_public ? (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">Public</Badge>
                            ) : " "}
                          </div>
                          <CardDescription className="mt-1 text-xs md:text-sm">
                            {activeTicket.ticket.is_public ? (
                              <>
                                <span className="block">From: {activeTicket.ticket.contact_name || `${activeTicket.ticket.first_name} ${activeTicket.ticket.last_name}`}</span> 
                                <span className="block">({activeTicket.ticket.contact_email || activeTicket.ticket.email})</span>
                                {activeTicket.ticket.contact_phone && (
                                  <span className="block mt-1">Phone: {activeTicket.ticket.contact_phone}</span>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="block">From: {activeTicket.ticket.first_name} {activeTicket.ticket.last_name}</span> 
                                <span className="block">({activeTicket.ticket.email})</span>
                              </>
                            )}
                          </CardDescription>
                          <div className="text-[10px] md:text-xs text-gray-500 mt-1">
                            Created on {formatDate(activeTicket.ticket.created_at)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {getStatusBadge(activeTicket.ticket.status)}
                          <Select 
                            value={activeTicket.ticket.status} 
                            onValueChange={(status) => handleUpdateTicketStatus(activeTicket.ticket.ticket_id, status)}
                          >
                            <SelectTrigger className="h-8 text-xs w-full md:w-32">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 pt-0 md:pt-0 space-y-3 md:space-y-4 max-h-[50vh] md:max-h-[calc(100vh-400px)] overflow-y-auto">
                      <div className="border rounded-lg p-2 md:p-3 bg-gray-50">
                        <div className="flex flex-col mb-1">
                          <div className="font-semibold text-xs md:text-sm">
                            {activeTicket.ticket.is_public 
                              ? activeTicket.ticket.contact_name || `${activeTicket.ticket.first_name} ${activeTicket.ticket.last_name}`
                              : `${activeTicket.ticket.first_name} ${activeTicket.ticket.last_name}`
                            }
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-500">
                            {formatDate(activeTicket.ticket.created_at)}
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-xs md:text-sm">{activeTicket.ticket.message}</p>
                      </div>
                      
                      {activeTicket.replies.length > 0 && (
                        <div className="space-y-2 md:space-y-3">
                          <h3 className="font-semibold text-sm md:text-base">Responses</h3>
                          {activeTicket.replies.map((reply) => (
                            <div 
                              key={reply.reply_id} 
                              className={`border rounded-lg p-2 md:p-3 ${reply.is_admin ? 'bg-blue-50' : 'bg-gray-50'}`}
                            >
                              <div className="flex flex-col mb-1">
                                <div className="font-semibold text-xs md:text-sm flex items-center flex-wrap gap-1">
                                  {[reply.first_name, reply.last_name].filter(Boolean).join(' ')}
                                  {reply.is_admin ? (
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1">Support</Badge>
                                  ) : " "}
                                </div>
                                <div className="text-[10px] md:text-xs text-gray-500">
                                  {formatDate(reply.created_at)}
                                </div>
                              </div>
                              <p className="whitespace-pre-wrap text-xs md:text-sm">{reply.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {activeTicket.ticket.status !== 'closed' && (
                        <div className="space-y-1 md:space-y-2">
                          <Label htmlFor="admin-reply" className="text-xs md:text-sm">Add Admin Reply</Label>
                          <Textarea
                            id="admin-reply"
                            placeholder="Type your reply here..."
                            rows={3}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            className="min-h-[80px] md:min-h-[100px] text-xs md:text-sm"
                          />
                          <Button 
                            onClick={handleSendReply} 
                            disabled={isSubmittingReply}
                            className="w-full md:w-auto h-8 text-xs"
                          >
                            {isSubmittingReply ? (
                              "Sending..."
                            ) : (
                              <>
                                <Send className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                Send Reply
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-6 md:py-8">
                      <div className="text-center">
                        <TicketIcon className="h-6 w-6 md:h-8 md:w-8 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-sm md:text-base font-medium">No ticket selected</h3>
                        <p className="text-gray-500 mt-1 text-xs md:text-sm">
                          Select a ticket from the list
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 md:p-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base md:text-lg truncate">User Management</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchUsers}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden xs:inline">Refresh</span>
                  </Button>
                </div>
                <CardDescription className="text-xs md:text-sm">
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 md:p-4 md:pt-0">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-6">
                    <div className="loader text-sm">Loading...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-2 md:mx-0">
                    <div className="inline-block min-w-full align-middle md:rounded-md md:border">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px] p-2 md:p-4 text-xs md:text-sm">ID</TableHead>
                            <TableHead className="p-2 md:p-4 text-xs md:text-sm">Name</TableHead>
                            <TableHead className="hidden md:table-cell p-2 md:p-4 text-xs md:text-sm">Email</TableHead>
                            <TableHead className="hidden md:table-cell p-2 md:p-4 text-xs md:text-sm">Phone</TableHead>
                            <TableHead className="p-2 md:p-4 text-xs md:text-sm">Role</TableHead>
                            <TableHead className="p-2 md:p-4 text-xs md:text-sm">Status</TableHead>
                            <TableHead className="hidden md:table-cell p-2 md:p-4 text-xs md:text-sm">Created</TableHead>
                            <TableHead className="text-right p-2 md:p-4 text-xs md:text-sm">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-6 text-xs md:text-sm">
                                No users found
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map((userData, index) => (
                              <TableRow key={userData.user_id}>
                                <TableCell className="font-medium p-2 md:p-4 text-xs md:text-sm">{index + 1}</TableCell>
                                <TableCell className="max-w-[80px] md:max-w-[120px] truncate p-2 md:p-4 text-xs md:text-sm">
                                  {userData.first_name} {userData.last_name}
                                </TableCell>
                                <TableCell className="hidden md:table-cell max-w-[200px] truncate p-2 md:p-4 text-xs md:text-sm">
                                  {userData.email}
                                </TableCell>
                                <TableCell className="hidden md:table-cell p-2 md:p-4 text-xs md:text-sm">
                                  {userData.phone_number}
                                </TableCell>
                                <TableCell className="p-2 md:p-4 text-xs md:text-sm">
                                  {getRoleBadge(userData.role || 'user')}
                                </TableCell>
                                <TableCell className="p-2 md:p-4 text-xs md:text-sm">
                                  {getUserStatusBadge(userData.status)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell p-2 md:p-4 text-xs md:text-sm">
                                  {formatDate(userData.created_at || '')}
                                </TableCell>
                                <TableCell className="text-right p-1 md:p-4">
                                  <div className="flex flex-wrap justify-end gap-1">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-7 w-7 md:h-8 md:w-auto md:px-2 p-0 md:py-0 text-xs"
                                          onClick={() => setSelectedUser(userData)}
                                        >
                                          <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                          <span className="hidden md:inline">Role</span>
                                        </Button>
                                      </DialogTrigger>
                                      {selectedUser && (
                                        <DialogContent className="max-w-[90vw] sm:max-w-md">
                                          <DialogHeader>
                                            <DialogTitle className="text-base">Change User Role</DialogTitle>
                                            <DialogDescription className="text-xs md:text-sm">
                                              Update role for {selectedUser.first_name} {selectedUser.last_name}
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="py-3">
                                            <Label htmlFor="role" className="text-xs md:text-sm">Select New Role</Label>
                                            <Select
                                              defaultValue={selectedUser.role || 'user'}
                                              onValueChange={(value) => handleSetUserRole(selectedUser.user_id, value)}
                                              disabled={isChangingRole}
                                            >
                                              <SelectTrigger className="h-8 text-xs md:text-sm mt-1">
                                                <SelectValue placeholder="Select role" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <DialogFooter>
                                            <Button variant="outline" onClick={() => setSelectedUser(null)} className="h-8 text-xs">
                                              Close
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      )}
                                    </Dialog>
                                    
                                    {/* Block User Dialog */}
                                    <Dialog open={showBlockDialog && selectedUser?.user_id === userData.user_id} onOpenChange={(open) => {
                                      if (!open) {
                                        setShowBlockDialog(false);
                                        setBlockReason('');
                                      }
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className={`h-7 w-7 md:h-8 md:w-auto md:px-2 p-0 md:py-0 text-xs ${userData.status === 'blocked' ? 'hidden' : ''}`}
                                          onClick={() => {
                                            setSelectedUser(userData);
                                            setShowBlockDialog(true);
                                          }}
                                        >
                                          <Lock className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                          <span className="hidden md:inline">Block</span>
                                        </Button>
                                      </DialogTrigger>
                                      {selectedUser && (
                                        <DialogContent className="max-w-[90vw] sm:max-w-md">
                                          <DialogHeader>
                                            <DialogTitle className="text-base">Block User</DialogTitle>
                                            <DialogDescription className="text-xs md:text-sm">
                                              Block access for {selectedUser.first_name} {selectedUser.last_name}
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="py-3">
                                            <Label htmlFor="block-reason" className="text-xs md:text-sm">Reason for Blocking</Label>
                                            <Textarea
                                              id="block-reason"
                                              placeholder="Please provide a reason"
                                              value={blockReason}
                                              onChange={(e) => setBlockReason(e.target.value)}
                                              className="mt-1 text-xs md:text-sm"
                                              rows={2}
                                            />
                                          </div>
                                          <DialogFooter className="flex-col sm:flex-row gap-2">
                                            <Button variant="outline" onClick={() => {
                                              setShowBlockDialog(false);
                                              setBlockReason('');
                                            }} className="h-8 text-xs">
                                              Cancel
                                            </Button>
                                            <Button 
                                              variant="destructive" 
                                              onClick={() => handleBlockUser(selectedUser.user_id, blockReason)}
                                              disabled={isProcessingUserAction || !blockReason.trim()}
                                              className="h-8 text-xs"
                                            >
                                              {isProcessingUserAction ? 'Processing...' : 'Block'}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      )}
                                    </Dialog>
                                    
                                    {/* Unblock User Button */}
                                    <Dialog open={showUnblockDialog && selectedUser?.user_id === userData.user_id} onOpenChange={(open) => {
                                      if (!open) setShowUnblockDialog(false);
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className={`h-7 w-7 md:h-8 md:w-auto md:px-2 p-0 md:py-0 text-xs ${userData.status !== 'blocked' ? 'hidden' : ''}`}
                                          onClick={() => {
                                            setSelectedUser(userData);
                                            setShowUnblockDialog(true);
                                          }}
                                        >
                                          <Unlock className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                          <span className="hidden md:inline">Unblock</span>
                                        </Button>
                                      </DialogTrigger>
                                      {selectedUser && (
                                        <DialogContent className="max-w-[90vw] sm:max-w-md">
                                          <DialogHeader>
                                            <DialogTitle className="text-base">Unblock User</DialogTitle>
                                            <DialogDescription className="text-xs md:text-sm">
                                              Restore access for {selectedUser.first_name} {selectedUser.last_name}
                                            </DialogDescription>
                                          </DialogHeader>
                                          <DialogFooter className="flex-col sm:flex-row gap-2">
                                            <Button variant="outline" onClick={() => setShowUnblockDialog(false)} className="h-8 text-xs">
                                              Cancel
                                            </Button>
                                            <Button 
                                              onClick={() => handleUnblockUser(selectedUser.user_id)}
                                              disabled={isProcessingUserAction}
                                              className="h-8 text-xs"
                                            >
                                              {isProcessingUserAction ? 'Processing...' : 'Unblock'}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      )}
                                    </Dialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transfers">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <AdminTransferSettings />
            </div>
          </TabsContent>
          
          <TabsContent value="system">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <AdminSystemStatus />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard; 