import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FavoritesService, Favorite } from '@/services/favorites.service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  StarOff, 
  Trash2, 
  User, 
  CreditCard, 
  Phone, 
  Landmark, 
  Building,
  Settings,
  AlertTriangle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SendMoneyFavoritesProps {
  userId: number;
  method: string;
  onSelectFavorite: (favorite: Favorite) => void;
  currentRecipient?: {
    identifier: string;
    name: string;
    bankId?: number;
  };
  recipientValidated: boolean;
  showOnlyFavoriteButton?: boolean;
}

const SendMoneyFavorites = ({ 
  userId, 
  method, 
  onSelectFavorite,
  currentRecipient,
  recipientValidated,
  showOnlyFavoriteButton = false
}: SendMoneyFavoritesProps) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customName, setCustomName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [favoriteToDelete, setFavoriteToDelete] = useState<Favorite | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId && method) {
      fetchFavorites();
    }
  }, [userId, method]);

  // Set default custom name when currentRecipient changes
  useEffect(() => {
    if (currentRecipient) {
      setCustomName(currentRecipient.name);
    }
  }, [currentRecipient]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await FavoritesService.getUserFavoritesByMethod(userId, method);
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    if (!currentRecipient || !recipientValidated) {
      toast({
        title: "No valid recipient",
        description: "Please select a valid recipient first",
        variant: "destructive",
      });
      return;
    }

    if (isCurrentRecipientInFavorites()) {
      toast({
        title: "Already in favorites",
        description: "This recipient is already in your favorites",
        variant: "default",
      });
      return;
    }

    setShowAddDialog(true);
  };

  const handleAddToFavorites = async () => {
    if (!currentRecipient || !recipientValidated) {
      toast({
        title: "No valid recipient",
        description: "Please select a valid recipient first",
        variant: "destructive",
      });
      return;
    }

    if (!customName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a display name for this favorite",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await FavoritesService.createFavorite({
        user_id: userId,
        recipient_identifier: currentRecipient.identifier,
        recipient_name: customName.trim(),
        method: method as any,
        bank_id: currentRecipient.bankId,
      });

      toast({
        title: "Success",
        description: "Recipient added to favorites",
      });

      // Refresh favorites
      fetchFavorites();
      setShowAddDialog(false);
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      
      // Check if it's already in favorites (409 Conflict)
      if (error.response?.status === 409) {
        toast({
          title: "Already in favorites",
          description: "This recipient is already in your favorites",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (favorite: Favorite, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelectFavorite
    setFavoriteToDelete(favorite);
    setShowDeleteDialog(true);
  };

  const handleRemoveFavorite = async (favoriteId: number) => {
    setIsDeleting(true);
    try {
      await FavoritesService.deleteFavorite(favoriteId, userId);
      
      toast({
        title: "Success",
        description: "Removed from favorites",
      });

      // Update local state
      setFavorites(favorites.filter(fav => fav.favorite_id !== favoriteId));
      
      // Close dialog
      setShowDeleteDialog(false);
      setFavoriteToDelete(null);
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

  const isCurrentRecipientInFavorites = (): boolean => {
    if (!currentRecipient) return false;
    
    return favorites.some(fav => 
      fav.recipient_identifier === currentRecipient.identifier && 
      fav.method === method
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full">
      {/* Only show Add to Favorites when recipient is validated */}
      {currentRecipient && recipientValidated && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenAddDialog}
                disabled={isSaving || isCurrentRecipientInFavorites()}
                className="h-9 w-9 flex-shrink-0"
              >
                {isCurrentRecipientInFavorites() ? (
                  <StarOff className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isCurrentRecipientInFavorites() 
                ? "Already in favorites" 
                : "Add to favorites"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {showOnlyFavoriteButton === false && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs sm:text-sm h-9 px-2 sm:px-3">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Favorites</span>
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-xs">
                  {favorites.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px] max-w-full">
            <SheetHeader>
              <SheetTitle>Your Favorite Recipients</SheetTitle>
              <SheetDescription>
                Quickly select a saved recipient
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 overflow-y-auto max-h-[calc(100vh-180px)]">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loader">Loading...</div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <StarOff className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You don't have any favorites yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Save recipients for quick access
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pb-2">
                  {favorites.map((favorite) => (
                    <div 
                      key={favorite.favorite_id}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
                      onClick={() => onSelectFavorite(favorite)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                        <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                          {getMethodIcon(favorite.method)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{favorite.recipient_name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">{favorite.recipient_identifier}</div>
                          {favorite.bank_name && (
                            <div className="text-xs text-gray-400 truncate">{favorite.bank_name}</div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleOpenDeleteDialog(favorite, e)}
                        disabled={isDeleting}
                        className="h-8 w-8 flex-shrink-0 ml-1"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <SheetFooter className="mt-6 flex-col items-stretch sm:items-end gap-2">
              <Button asChild variant="outline" size="sm" className="w-full h-9">
                <Link to="/manage-favorites">
                  <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  Manage Favorites
                </Link>
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {/* Add to Favorites Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add to Favorites</DialogTitle>
            <DialogDescription>
              Save this recipient to your favorites for quick access
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-info" className="text-sm">Recipient Information</Label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 rounded-full mr-3 flex-shrink-0">
                  {getMethodIcon(method)}
                </div>
                <div className="min-w-0">
                  <div className="truncate">{currentRecipient?.name}</div>
                  <div className="text-sm text-gray-500 truncate">{currentRecipient?.identifier}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-sm">Display Name</Label>
              <Input
                id="display-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter a display name for this favorite"
              />
              <p className="text-xs text-gray-500">
                Choose a memorable name to easily identify this recipient
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAddDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddToFavorites}
              disabled={isSaving || !customName.trim()}
              className="w-full sm:w-auto"
            >
              {isSaving ? "Saving..." : "Save to Favorites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Remove from Favorites
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this recipient from your favorites?
            </DialogDescription>
          </DialogHeader>
          
          {favoriteToDelete && (
            <div className="py-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 rounded-full mr-3 flex-shrink-0">
                  {getMethodIcon(favoriteToDelete.method)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{favoriteToDelete.recipient_name}</div>
                  <div className="text-sm text-gray-500 truncate">{favoriteToDelete.recipient_identifier}</div>
                  {favoriteToDelete.bank_name && (
                    <div className="text-xs text-gray-400 truncate">{favoriteToDelete.bank_name}</div>
                  )}
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
              onClick={() => favoriteToDelete && handleRemoveFavorite(favoriteToDelete.favorite_id)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendMoneyFavorites; 