"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import type { ExchangeRates } from "@/ai/flows/get-exchange-rates";
import type { AppUser } from "@/context/auth-context";

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: { description: string; amount: number; category: string; userName?: string; paidTo: string; contactInfo?: string; }) => void;
  rates: ExchangeRates | null;
  user: AppUser | null;
}

export function ExpenseDialog({ isOpen, onClose, onAddExpense, rates, user }: ExpenseDialogProps) {
  const [amountInr, setAmountInr] = useState(0);

  const expenseSchema = z.object({
    description: z.string().min(2, "Description must be at least 2 characters."),
    paidTo: z.string().min(2, "This field is required."),
    contactInfo: z.string().optional(),
    amount: z.coerce.number().positive("Amount must be a positive number."),
    category: z.string().min(1, "Please select a category."),
    userName: user?.isAdmin 
      ? z.string().min(1, "User name is required.")
      : z.string().optional(),
  });

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
      userName: "",
      paidTo: "",
      contactInfo: "",
    },
  });

  const onSubmit = (values: z.infer<typeof expenseSchema>) => {
    onAddExpense({
        description: values.description,
        amount: values.amount,
        category: values.category,
        userName: values.userName,
        paidTo: values.paidTo,
        contactInfo: values.contactInfo
    });
    form.reset();
    setAmountInr(0);
    onClose();
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAmountInr(value);
    form.setValue("amount", value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your expense. The amount should be in Indian Rupees (INR).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {user?.isAdmin && (
               <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dinner at a cafe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paidTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid To</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Restaurant, Shop, Driver" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Info (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Email or Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                           <div className="flex items-center gap-2">
                             <category.icon className="h-4 w-4" />
                             {category.label}
                           </div>
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000" {...field} onChange={handleAmountChange} />
                  </FormControl>
                   {rates && amountInr > 0 && (
                     <p className="text-xs text-muted-foreground mt-1">
                        USD: ${(amountInr * rates.INR_TO_USD).toFixed(2)}, AUD: A$
                        {(amountInr * rates.INR_TO_AUD).toFixed(2)}
                      </p>
                   )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
