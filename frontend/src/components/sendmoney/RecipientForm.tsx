
import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Phone, CreditCard, Banknote } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import BankSelect from '@/components/BankSelect';

export type TransferMethod = 'ipa' | 'mobile' | 'card' | 'account' | 'iban';

export interface FormValues {
  method: TransferMethod;
  identifier: string;
  bank_id?: string;
  amount: string;
  sourceIpaAddress: string;
}

interface RecipientFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (data: FormValues) => void;
  isSearching: boolean;
  linkedAccounts: any[];
  isLoadingAccounts: boolean;
}

const RecipientForm: React.FC<RecipientFormProps> = ({
  form,
  onSubmit,
  isSearching,
  linkedAccounts,
  isLoadingAccounts
}) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sourceIpaAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Send from</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value} 
                disabled={isLoadingAccounts}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingAccounts ? "Loading accounts..." : "Select account"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {linkedAccounts.map((account) => (
                    <SelectItem
                      key={account.ipa_address}
                      value={account.ipa_address}
                    >
                      {account.ipa_address} (Bank ID: {account.bank_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Send using</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-wrap gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ipa" id="ipa" />
                    <Label htmlFor="ipa" className="flex items-center gap-1">
                      <User className="h-4 w-4" /> IPA Address
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile" className="flex items-center gap-1">
                      <Phone className="h-4 w-4" /> Mobile Number
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> Card Number
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="account" id="account" />
                    <Label htmlFor="account" className="flex items-center gap-1">
                      <Banknote className="h-4 w-4" /> Account Number
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="iban" id="iban" />
                    <Label htmlFor="iban" className="flex items-center gap-1">
                      <Banknote className="h-4 w-4" /> IBAN
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("method") === "account" && (
          <FormField
            control={form.control}
            name="bank_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank</FormLabel>
                <FormControl>
                  <BankSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSearching}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getMethodName(form.watch("method") as TransferMethod)}</FormLabel>
              <div className="flex">
                <FormControl>
                  <Input
                    placeholder={`Enter ${getMethodName(form.watch("method") as TransferMethod).toLowerCase()}`}
                    {...field}
                    className="rounded-r-none"
                  />
                </FormControl>
                <Button 
                  type="submit" 
                  disabled={isSearching || !field.value || !form.getValues("sourceIpaAddress")}
                  className="rounded-l-none"
                >
                  {isSearching ? 'Searching...' : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default RecipientForm;
