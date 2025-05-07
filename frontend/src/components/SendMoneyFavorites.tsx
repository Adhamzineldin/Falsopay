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
  Settings
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
  DialogTrigger,
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
}

const SendMoneyFavorites = ({ 
  userId, 
  method, 
  onSelectFavorite,
  currentRecipient,
}: SendMoneyFavoritesProps) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customName, setCustomName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
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
    if (!currentRecipient) {
      toast({
        title: "No recipient selected",
        description: "Please select a recipient first",
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
    if (!currentRecipient) {
      toast({
        title: "No recipient selected",
        description: "Please select a recipient first",
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
    <div className="flex items-center gap-2">
      {currentRecipient && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenAddDialog}
                disabled={isSaving || isCurrentRecipientInFavorites()}
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

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Favorites</span>
            {favorites.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {favorites.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Your Favorite Recipients</SheetTitle>
            <SheetDescription>
              Quickly select a saved recipient
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
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
              <div className="space-y-3">
                {favorites.map((favorite) => (
                  <div 
                    key={favorite.favorite_id}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
                    onClick={() => onSelectFavorite(favorite)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        {getMethodIcon(favorite.method)}
                      </div>
                      <div>
                        <div className="font-medium">{favorite.recipient_name}</div>
                        <div className="text-sm text-gray-500">{favorite.recipient_identifier}</div>
                        {favorite.bank_name && (
                          <div className="text-xs text-gray-400">{favorite.bank_name}</div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite.favorite_id);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SheetFooter className="mt-6 flex-col items-start sm:items-end gap-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/manage-favorites">
                <Settings className="h-4 w-4 mr-2" />
                Manage Favorites
              </Link>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add to Favorites Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Favorites</DialogTitle>
            <DialogDescription>
              Save this recipient for quick access in future transfers
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-info">Recipient Information</Label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <div className="bg-gray-100 p-2 rounded-full mr-3">
                  {getMethodIcon(method)}
                </div>
                <div>
                  <div>{currentRecipient?.name}</div>
                  <div className="text-sm text-gray-500">{currentRecipient?.identifier}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
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
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddToFavorites}
              disabled={isSaving || !customName.trim()}
            >
              {isSaving ? "Saving..." : "Save to Favorites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendMoneyFavorites; 