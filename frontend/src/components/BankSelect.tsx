import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { BankService } from "@/services/bank.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
                                                 disabled,
                                               }) => {
  const [open, setOpen] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>(value || "");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Only fetch banks when popover is opened for the first time
  useEffect(() => {
    if (open && banks.length === 0 && !loading) {
      fetchBanks();
    }
  }, [open]);

  // Focus search input when popover opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Filter banks when search query changes
  useEffect(() => {
    if (banks.length > 0) {
      if (!searchQuery) {
        setFilteredBanks(banks);
      } else {
        const filtered = banks.filter(bank =>
            bank.bank_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredBanks(filtered);
      }
    }
  }, [searchQuery, banks]);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const data = await BankService.getAllBanks();

      if (Array.isArray(data)) {
        const formattedBanks = data.map((bank: any): Bank => ({
          bank_id: bank.bank_id,
          bank_name: bank.bank_name,
          swift_code: bank.swift_code,
          bank_code: bank.bank_code,
        }));
        setBanks(formattedBanks);
        setFilteredBanks(formattedBanks);
      } else {
        console.error("Bank data is not an array:", data);
        setBanks([]);
        setFilteredBanks([]);
      }
    } catch (error) {
      console.error("Failed to fetch banks:", error);
      setBanks([]);
      setFilteredBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedBank = banks.find(
      (bank) => bank.bank_id.toString() === selectedBankId
  );

  const handleSelectBank = (bank: Bank) => {
    const bankId = bank.bank_id.toString();
    setSelectedBankId(bankId);
    if (onChange) onChange(bankId);
    if (onBankSelect) onBankSelect(bank);
    setOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled}
          >
            {selectedBank ? (
                selectedBank.bank_name
            ) : (
                "Select bank"
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {/* Custom search input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
                ref={searchInputRef}
                type="text"
                placeholder="Search bank..."
                className="flex h-10 w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={handleSearchChange}
            />
          </div>

          {/* Banks list content */}
          <div className="max-h-64 overflow-y-auto py-1">
            {loading ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading banks...</p>
                </div>
            ) : filteredBanks.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  {banks.length === 0 ? "No banks available" : "No banks found"}
                </div>
            ) : (
                filteredBanks.map((bank) => {
                  const isSelected = bank.bank_id.toString() === selectedBankId;

                  return (
                      <div
                          key={bank.bank_id}
                          className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                              isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                          )}
                          onClick={() => handleSelectBank(bank)}
                      >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {bank.bank_name}
                      </div>
                  );
                })
            )}
          </div>
        </PopoverContent>
      </Popover>
  );
};

export default BankSelect;