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
  RotateCw,
  AlertTriangle
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [favoriteToDelete, setFavoriteToDelete] = useState<Favorite | null>(null);

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

  const handleOpenDeleteDialog = (favorite: Favorite) => {
    setFavoriteToDelete(favorite);
    setShowDeleteDialog(true);
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

      // Close dialog
      setShowDeleteDialog(false);
      setFavoriteToDelete(null);
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
        return <Star className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'mobile':
        return <Phone className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'card':
        return <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'account':
        return <Building className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'iban':
        return <Landmark className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <User className="h-4 w-4 sm:h-5 sm:w-5" />;
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
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Manage Favorites</h1>
        
        <Tabs defaultValue="all" onValueChange={setCurrentFilter}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-4 sm:mb-6 w-auto inline-flex">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="ipa" className="text-xs sm:text-sm">IPA</TabsTrigger>
              <TabsTrigger value="mobile" className="text-xs sm:text-sm">Mobile</TabsTrigger>
              <TabsTrigger value="card" className="text-xs sm:text-sm">Card</TabsTrigger>
              <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
              <TabsTrigger value="iban" className="text-xs sm:text-sm">IBAN</TabsTrigger>
            </TabsList>
          </div>
          
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Your Favorites</CardTitle>
              <CardDescription>
                Manage your saved payment recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <RotateCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-8 sm:py-10">
                  <StarOff className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    {currentFilter === 'all' 
                      ? "You don't have any favorites yet" 
                      : `You don't have any ${getMethodName(currentFilter).toLowerCase()} favorites`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredFavorites.map(favorite => (
                    <div 
                      key={favorite.favorite_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                        <div className="bg-gray-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                          {getMethodIcon(favorite.method)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm sm:text-base truncate">{favorite.recipient_name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{favorite.recipient_identifier}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                              {getMethodName(favorite.method)}
                            </span>
                            {favorite.bank_name && (
                              <span className="text-xs text-gray-500 truncate">
                                {favorite.bank_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleOpenEditDialog(favorite)}
                          className="h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(favorite)}
                          disabled={isDeleting}
                          className="h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)]">
            <DialogHeader>
              <DialogTitle>Edit Favorite</DialogTitle>
              <DialogDescription>
                Update the display name for this favorite
              </DialogDescription>
            </DialogHeader>
            
            {selectedFavorite && (
              <>
                <div className="py-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md mb-4 overflow-hidden">
                    <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                      {getMethodIcon(selectedFavorite.method)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-gray-700 truncate">{selectedFavorite.recipient_identifier}</div>
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
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEditFavorite}
                    disabled={isEditing}
                    className="w-full sm:w-auto"
                  >
                    {isEditing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this favorite? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {favoriteToDelete && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                    {getMethodIcon(favoriteToDelete.method)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{favoriteToDelete.recipient_name}</div>
                    <div className="text-sm text-gray-500 truncate">{favoriteToDelete.recipient_identifier}</div>
                    <div className="text-xs text-gray-500">{getMethodName(favoriteToDelete.method)}</div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setFavoriteToDelete(null);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => favoriteToDelete && handleDeleteFavorite(favoriteToDelete.favorite_id)}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting ? 'Deleting...' : 'Delete Favorite'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ManageFavorites; 