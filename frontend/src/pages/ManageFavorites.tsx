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
  Save,
  Edit,
  RotateCw
} from 'lucide-react';

const ManageFavorites = () => {
  const { user } = useApp();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (currentFilter === 'all') {
      setFilteredFavorites(favorites);
    } else {
      setFilteredFavorites(favorites.filter(fav => fav.method === currentFilter));
    }
  }, [favorites, currentFilter]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await FavoritesService.getUserFavorites(user.user_id);
      setFavorites(data);
      setFilteredFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load your favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFavorite = async (favoriteId: number) => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      await FavoritesService.deleteFavorite(favoriteId, user.user_id);
      
      // Update state
      setFavorites(favorites.filter(fav => fav.favorite_id !== favoriteId));
      
      toast({
        title: "Success",
        description: "Favorite removed successfully",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditDialog = (favorite: Favorite) => {
    setSelectedFavorite(favorite);
    setEditName(favorite.recipient_name);
    setShowEditDialog(true);
  };

  const handleEditFavorite = async () => {
    if (!selectedFavorite || !user) return;
    
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditing(true);
    try {
      await FavoritesService.updateFavorite(selectedFavorite.favorite_id, {
        ...selectedFavorite,
        recipient_name: editName.trim()
      });
      
      // Update state
      setFavorites(favorites.map(fav => 
        fav.favorite_id === selectedFavorite.favorite_id 
          ? { ...fav, recipient_name: editName.trim() } 
          : fav
      ));
      
      toast({
        title: "Success",
        description: "Favorite updated successfully",
      });
      
      // Close dialog
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'ipa':
        return <Star className="h-5 w-5" />;
      case 'mobile':
        return <Phone className="h-5 w-5" />;
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'account':
        return <Building className="h-5 w-5" />;
      case 'iban':
        return <Landmark className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'ipa':
        return 'IPA Address';
      case 'mobile':
        return 'Mobile Number';
      case 'card':
        return 'Card Number';
      case 'account':
        return 'Account Number';
      case 'iban':
        return 'IBAN';
      default:
        return method;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Manage Favorites</h1>
        
        <Tabs defaultValue="all" onValueChange={setCurrentFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ipa">IPA</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="iban">IBAN</TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Favorites</CardTitle>
              <CardDescription>
                Manage your saved payment recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <RotateCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-10">
                  <StarOff className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">
                    {currentFilter === 'all' 
                      ? "You don't have any favorites yet" 
                      : `You don't have any ${getMethodName(currentFilter).toLowerCase()} favorites`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFavorites.map(favorite => (
                    <div 
                      key={favorite.favorite_id}
                      className="flex items-center justify-between border rounded-lg p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-full">
                          {getMethodIcon(favorite.method)}
                        </div>
                        <div>
                          <h3 className="font-medium">{favorite.recipient_name}</h3>
                          <p className="text-sm text-gray-500">{favorite.recipient_identifier}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {getMethodName(favorite.method)}
                            </span>
                            {favorite.bank_name && (
                              <span className="text-xs text-gray-500 ml-2">
                                {favorite.bank_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleOpenEditDialog(favorite)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDeleteFavorite(favorite.favorite_id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>
        
        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Favorite</DialogTitle>
              <DialogDescription>
                Update the display name for this favorite
              </DialogDescription>
            </DialogHeader>
            
            {selectedFavorite && (
              <>
                <div className="py-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md mb-4">
                    <div className="bg-gray-100 p-2 rounded-full">
                      {getMethodIcon(selectedFavorite.method)}
                    </div>
                    <div>
                      <div className="text-sm text-gray-700">{selectedFavorite.recipient_identifier}</div>
                      <div className="text-xs text-gray-500">{getMethodName(selectedFavorite.method)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="favorite-name">Display Name</Label>
                    <Input 
                      id="favorite-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter a display name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEditFavorite}
                    disabled={isEditing}
                  >
                    {isEditing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ManageFavorites; 