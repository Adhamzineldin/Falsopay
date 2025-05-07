import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { UserService } from '@/services/user.service';
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
  Activity
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

interface UserData {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
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
      await SupportService.addAdminReply({
        ticket_id: activeTicket.ticket.ticket_id,
        message: reply.trim(),
      });
      
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

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin':
        return <Badge variant="default" className="bg-purple-500">Admin</Badge>;
      case 'user':
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="support">
          <TabsList className="mb-6">
            <TabsTrigger value="support">
              <TicketIcon className="h-4 w-4 mr-2" />
              Support Tickets
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="system">
              <Activity className="h-4 w-4 mr-2" />
              System Status
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="support">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Support Tickets</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={fetchTickets}
                        title="Refresh tickets"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Manage customer support tickets
                    </CardDescription>
                    
                    <div className="mt-4">
                      <Label htmlFor="status-filter">Filter by Status</Label>
                      <Select 
                        value={statusFilter} 
                        onValueChange={handleStatusFilterChange}
                      >
                        <SelectTrigger id="status-filter" className="mt-1">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tickets</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    {isLoadingTickets ? (
                      <div className="flex justify-center py-8">
                        <div className="loader">Loading...</div>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No tickets found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tickets && tickets.map((ticket) => (
                          <div 
                            key={ticket.ticket_id}
                            className={`border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors ${activeTicket?.ticket.ticket_id === ticket.ticket_id ? 'border-blue-500 bg-blue-50' : ''}`}
                            onClick={() => fetchTicketDetails(ticket.ticket_id)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(ticket.status)}
                              <h3 className="font-semibold text-sm">{ticket.subject}</h3>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                {ticket.first_name} {ticket.last_name}
                              </p>
                              <div className="flex items-center gap-1">
                                {getStatusBadge(ticket.status)}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(ticket.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                {activeTicket ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{activeTicket.ticket.subject}</CardTitle>
                          <CardDescription>
                            From: {activeTicket.ticket.first_name} {activeTicket.ticket.last_name} ({activeTicket.ticket.email})
                          </CardDescription>
                          <div className="text-sm text-gray-500 mt-1">
                            Created on {formatDate(activeTicket.ticket.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(activeTicket.ticket.status)}
                          <Select 
                            value={activeTicket.ticket.status} 
                            onValueChange={(status) => handleUpdateTicketStatus(activeTicket.ticket.ticket_id, status)}
                          >
                            <SelectTrigger className="w-32">
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
                    <CardContent className="space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold">
                            {activeTicket.ticket.first_name} {activeTicket.ticket.last_name}
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
                          <Label htmlFor="admin-reply">Add Admin Reply</Label>
                          <Textarea
                            id="admin-reply"
                            placeholder="Type your reply here..."
                            rows={4}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                          />
                          <Button 
                            onClick={handleSendReply} 
                            disabled={isSubmittingReply}
                          >
                            {isSubmittingReply ? (
                              "Sending..."
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Admin Reply
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <TicketIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">No ticket selected</h3>
                        <p className="text-gray-500 mt-2">
                          Select a ticket from the list to view details
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchUsers}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <CardDescription>
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="loader">Loading...</div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users && users.length > 0 ? users.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell>{user.user_id}</TableCell>
                            <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone_number}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    {user.role === 'admin' ? (
                                      <ShieldCheck className="h-4 w-4 mr-1" />
                                    ) : (
                                      <ShieldAlert className="h-4 w-4 mr-1" />
                                    )}
                                    Manage Role
                                  </Button>
                                </DialogTrigger>
                                {selectedUser && (
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Manage User Role</DialogTitle>
                                      <DialogDescription>
                                        Change the role for {selectedUser.first_name} {selectedUser.last_name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="user-role">Role</Label>
                                          <Select defaultValue={selectedUser.role}>
                                            <SelectTrigger id="user-role" className="mt-1">
                                              <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="user">User</SelectItem>
                                              <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          <p><strong>Current role:</strong> {selectedUser.role}</p>
                                          <p><strong>User ID:</strong> {selectedUser.user_id}</p>
                                          <p><strong>Email:</strong> {selectedUser.email}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setSelectedUser(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() => handleSetUserRole(
                                          selectedUser.user_id,
                                          selectedUser.role === 'admin' ? 'user' : 'admin'
                                        )}
                                        disabled={isChangingRole}
                                      >
                                        {isChangingRole ? 'Updating...' : 'Update Role'}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                )}
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system">
            <div className="grid grid-cols-1 gap-6">
              <AdminSystemStatus />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard; 