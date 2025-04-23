
import React, { useState, useEffect } from 'react';
import { BankService, BankData } from '@/services/bank.service';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Bank {
  bank_id: number;
  bank_name: string;
  swift_code?: string;
  bank_code?: string;
}

interface BankSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  onBankSelect?: (bank: Bank) => void;
  disabled?: boolean;
}

const BankSelect: React.FC<BankSelectProps> = ({ 
  value, 
  onChange, 
  onBankSelect, 
  disabled 
}) => {
  const [open, setOpen] = useState(false);
  const [banks, setBanks] = useState<BankData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(value || "");

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const data = await BankService.getAllBanks();
        console.log("Fetched banks:", data);
        if (Array.isArray(data) && data.length > 0) {
          setBanks(data);
        } else {
          console.error("Invalid bank data format:", data);
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  const selectedBank = banks.find(bank => bank.bank_id.toString() === (value || selectedBankId));

  const handleSelectBank = (bankId: string) => {
    setSelectedBankId(bankId);
    if (onChange) {
      onChange(bankId);
    }
    
    const bank = banks.find(b => b.bank_id.toString() === bankId);
    if (bank && onBankSelect) {
      onBankSelect({
        bank_id: bank.bank_id,
        bank_name: bank.bank_name,
        swift_code: bank.swift_code,
        bank_code: bank.bank_code
      });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading banks...
            </span>
          ) : selectedBank ? (
            selectedBank.bank_name
          ) : (
            "Select bank"
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="w-full">
          <CommandInput placeholder="Search bank..." />
          <CommandEmpty>No bank found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {banks && banks.length > 0 ? banks.map((bank) => (
              <CommandItem
                key={bank.bank_id.toString()}
                value={bank.bank_name}
                onSelect={() => handleSelectBank(bank.bank_id.toString())}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    (value || selectedBankId) === bank.bank_id.toString() ? "opacity-100" : "opacity-0"
                  )}
                />
                {bank.bank_name}
              </CommandItem>
            )) : (
              <div className="py-6 text-center text-sm">Loading banks...</div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BankSelect;
