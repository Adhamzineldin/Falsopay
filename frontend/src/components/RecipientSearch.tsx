import React, { useState, useEffect } from 'react';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem 
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, User, CreditCard, Phone, Banknote, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type TransferMethod = 'ipa' | 'mobile' | 'card' | 'account' | 'iban';

interface Recipient {
  id: string;
  name: string;
  identifier: string;
  method: TransferMethod;
}

interface RecentContact {
  id: string;
  name: string;
  identifier: string;
  method: TransferMethod;
  lastUsed: Date;
}

interface RecipientSearchProps {
  method: TransferMethod;
  identifier: string;
  onSearch: (identifier: string) => void;
  onIdentifierChange: (value: string) => void;
  recentContacts?: RecentContact[];
  searching: boolean;
  disabled?: boolean;
}

const RecipientSearch: React.FC<RecipientSearchProps> = ({
  method,
  identifier,
  onSearch,
  onIdentifierChange,
  recentContacts = [],
  searching,
  disabled
}) => {
  const [open, setOpen] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<RecentContact[]>([]);
  
  useEffect(() => {
    if (identifier) {
      setFilteredContacts(
        recentContacts
          .filter(contact => 
            contact.method === method && 
            contact.identifier.toLowerCase().includes(identifier.toLowerCase())
          )
          .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      );
    } else {
      setFilteredContacts(
        recentContacts
          .filter(contact => contact.method === method)
          .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      );
    }
  }, [identifier, method, recentContacts]);

  const getMethodIcon = (method: TransferMethod) => {
    switch(method) {
      case 'ipa': return <User className="h-4 w-4" />;
      case 'mobile': return <Phone className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'account': return <Banknote className="h-4 w-4" />;
      case 'iban': return <Banknote className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };
  
  const getMethodName = (method: TransferMethod) => {
    switch(method) {
      case 'ipa': return 'IPA Address';
      case 'mobile': return 'Mobile Number';
      case 'card': return 'Card Number';
      case 'account': return 'Account Number';
      case 'iban': return 'IBAN';
      default: return method;
    }
  };

  const handleSelect = (contact: RecentContact) => {
    onIdentifierChange(contact.identifier);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            placeholder={`Enter ${getMethodName(method).toLowerCase()}`}
            value={identifier}
            onChange={(e) => onIdentifierChange(e.target.value)}
            className={cn(
              filteredContacts.length > 0 && "rounded-b-none"
            )}
            disabled={disabled}
          />
          {filteredContacts.length > 0 && identifier && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-10 px-3" 
                  disabled={disabled}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]" align="start">
                <Command>
                  <CommandGroup heading="Recent contacts">
                    {filteredContacts.map((contact) => (
                      <CommandItem
                        key={contact.id}
                        onSelect={() => handleSelect(contact)}
                        className="flex items-center"
                      >
                        <div className="mr-2">
                          {getMethodIcon(contact.method)}
                        </div>
                        <div>
                          <p>{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.identifier}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <Button 
          type="button" 
          onClick={() => onSearch(identifier)}
          disabled={searching || !identifier || disabled}
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {recentContacts.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-2">
            <p className="text-xs text-gray-500 mb-2">Recent contacts</p>
            <div className="flex flex-wrap gap-2">
              {recentContacts
                .filter(contact => contact.method === method)
                .slice(0, 4)
                .map((contact) => (
                  <Button
                    key={contact.id}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      onIdentifierChange(contact.identifier);
                      onSearch(contact.identifier);
                    }}
                    disabled={disabled}
                  >
                    {getMethodIcon(contact.method)}
                    <span className="ml-1 truncate max-w-[100px]">{contact.name}</span>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecipientSearch;
