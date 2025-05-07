import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { FavoritesService, Favorite } from '@/services/favorites.service';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  StarOff, 
  Trash2, 
  User, 
  CreditCard, 
  Phone, 
  Landmark, 
  Building,
  Plus,
  Pencil,
  Save
} from 'lucide-react';

const ManageFavorites = () => {
  const { user } = useApp();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentFavorite, setCurrentFavorite] = useState<Favorite | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await FavoritesService.getUserFavorites(user.user_id);
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFavorite = async (favoriteId: number) => {
    if (!user) return;
    
    try {
      await FavoritesService.deleteFavorite(favoriteId, user.user_id);
      
      // Update local state
      setFavorites(favorites.filter(fav => fav.favorite_id !== favoriteId));
      
      toast({
        title: "Success",
        description: "Favorite deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting favorite:', error);
      toast({
        title: "Error",
        description: "Failed to delete favorite",
        variant: "destructive",
      });
    }
  };

  const handleEditFavorite = (favorite: Favorite) => {
    setCurrentFavorite(favorite);
    setEditName(favorite.recipient_name);
    setShowEditDialog(true);
  };

  const saveEditedFavorite = async () => {
    if (!currentFavorite || !user) return;

    try {
      // Create a new favorite with the updated name (since the API doesn't provide a direct update)
      await FavoritesService.createFavorite({
        user_id: user.user_id,
        recipient_identifier: currentFavorite.recipient_identifier,
        recipient_name: editName,
        method: currentFavorite.method,
        bank_id: currentFavorite.bank_id ?? undefined,
      });

      // Delete the old favorite
      await FavoritesService.deleteFavorite(currentFavorite.favorite_id, user.user_id);
      
      // Refresh favorites
      await fetchFavorites();
      
      toast({
        title: "Success",
        description: "Favorite updated successfully",
      });
      
      // Reset state
      setShowEditDialog(false);
      setCurrentFavorite(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive",
      });
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'ipa':
        return <Star className="h-4 w-4" />;
      case 'mobile':
        return <Phone className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'account':
        return <Building className="h-4 w-4" />;
      case 'iban':
        return <Landmark className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const filteredFavorites = activeTab === 'all' 
    ? favorites 
    : favorites.filter(fav => fav.method === activeTab);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Favorites</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Favorites
            </TabsTrigger>
            <TabsTrigger value="ipa">
              IPA Address
            </TabsTrigger>
            <TabsTrigger value="mobile">
              Mobile Number
            </TabsTrigger>
            <TabsTrigger value="card">
              Card Number
            </TabsTrigger>
            <TabsTrigger value="account">
              Account Number
            </TabsTrigger>
            <TabsTrigger value="iban">
              IBAN
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {activeTab === 'all' ? 'All Favorites' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Favorites`}
                  </CardTitle>
                  <Badge variant="outline">{filteredFavorites.length}</Badge>
                </div>
                <CardDescription>
                  Manage your favorite recipients for quick access during transfers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="loader">Loading...</div>
                  </div>
                ) : filteredFavorites.length === 0 ? (
                  <div className="text-center py-8">
                    <StarOff className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No favorites found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Add favorites when sending money to save recipients for quick access
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFavorites.map((favorite) => (
                      <div 
                        key={favorite.favorite_id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                              {getMethodIcon(favorite.method)}
                            </div>
                            <div>
                              <div className="font-medium">{favorite.recipient_name}</div>
                              <div className="text-sm text-gray-500">
                                {favorite.method === 'ipa' && 'IPA: '}
                                {favorite.method === 'mobile' && 'Mobile: '}
                                {favorite.method === 'card' && 'Card: '}
                                {favorite.method === 'account' && 'Account: '}
                                {favorite.method === 'iban' && 'IBAN: '}
                                {favorite.recipient_identifier}
                              </div>
                              {favorite.bank_name && (
                                <div className="text-xs text-gray-400">{favorite.bank_name}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditFavorite(favorite)}
                            >
                              <Pencil className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteFavorite(favorite.favorite_id)}
                            >
                              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Favorite</DialogTitle>
              <DialogDescription>
                Change the display name for this favorite recipient
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-identifier">Recipient Identifier</Label>
                <Input 
                  id="recipient-identifier" 
                  value={currentFavorite?.recipient_identifier || ''} 
                  disabled 
                />
                <p className="text-xs text-gray-500">This identifier cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient-name">Display Name</Label>
                <Input 
                  id="recipient-name" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  placeholder="Enter a display name" 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={saveEditedFavorite} disabled={!editName.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ManageFavorites; 