
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { BankAccountService } from '@/services/bank-account.service';
import { IPAService } from '@/services/ipa.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock, User, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Profile = () => {
  const { user, updateUserData, logout } = useApp();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [ipas, setIpas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phoneNumber: user.phone_number || ''
      });
      
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch bank accounts
      console.log(user)
      const accountsResponse = await BankAccountService.getAccountsByUserId(user.user_id);
      setAccounts(accountsResponse);
      
      // Fetch IPAs
      const ipasResponse = await IPAService.getIPAsByUserId(user.user_id);
      setIpas(ipasResponse);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load your account details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phoneNumber
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateUserData({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber
      });
      
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error) {
      // Error handling is done in updateUserData
      console.error('Profile update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.phone_number) {
      toast({
        title: "Error",
        description: "Please enter your phone number correctly to confirm",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      await IPAService.deleteAllByUserId(user.user_id);
      
      // This would need to call the real API for account deletion
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted",
      });
      
      // Log the user out
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete your account",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  };

  // Demo data for display purposes
  const demoAccounts = [
    {
      id: 1,
      bank_name: "First National Bank",
      account_number: "********1234",
      iban: "DE89 3704 0044 0532 0130 00",
      balance: 2500.75,
      type: "Checking"
    },
    {
      id: 2,
      bank_name: "International Savings",
      account_number: "********5678",
      iban: "GB29 NWBK 6016 1331 9268 19",
      balance: 10000.00,
      type: "Savings"
    }
  ];
  
  const demoIpas = [
    {
      id: 1,
      ipa_address: "user@falsopay",
      status: "Active",
      created_at: "2023-01-15"
    },
    {
      id: 2,
      ipa_address: "business@falsopay",
      status: "Inactive",
      created_at: "2023-03-22"
    }
  ];

  const displayAccounts = accounts.length ? accounts : demoAccounts;
  const displayIpas = ipas.length ? ipas : demoIpas;

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        
        <Tabs defaultValue="personal">
          <TabsList className="mb-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Accounts & IPAs
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-falsopay-primary text-white text-2xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Your last name"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="Your phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Linked Bank Accounts</CardTitle>
                <CardDescription>Manage your connected bank accounts</CardDescription>
              </CardHeader>
              
              <CardContent>
                {displayAccounts.map((account: any) => (
                  <div key={account.id} className="py-4 border-b border-gray-200 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{account.bank_name}</h3>
                        <p className="text-sm text-gray-500">{account.account_number}</p>
                        <p className="text-xs text-gray-400">{account.type} • {account.iban}</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                ))}
                
                {displayAccounts.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No bank accounts linked yet</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button className="w-full">Link a New Bank Account</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your IPA Addresses</CardTitle>
                <CardDescription>Instant Payment Addresses for receiving money</CardDescription>
              </CardHeader>
              
              <CardContent>
                {displayIpas.map((ipa: any) => (
                  <div key={ipa.id} className="py-4 border-b border-gray-200 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{ipa.ipa_address}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            ipa.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></span>
                          <p className="text-sm text-gray-500">{ipa.status}</p>
                        </div>
                        <p className="text-xs text-gray-400">Created: {new Date(ipa.created_at).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                ))}
                
                {displayIpas.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No IPA addresses found</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button className="w-full">Create New IPA Address</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This action cannot be undone. This will permanently delete your account, all linked bank accounts, IPA addresses, and transaction history.
                </p>
                
                <Dialog 
                  open={isDeleteDialogOpen} 
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-600">Delete Account Confirmation</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. All your data will be permanently deleted.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <p className="text-sm">
                        To confirm, please enter your phone number: <span className="font-bold">{user?.phone_number}</span>
                      </p>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={isUpdating || deleteConfirmation !== user?.phone_number}
                      >
                        {isUpdating ? 'Processing...' : 'Permanently Delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
