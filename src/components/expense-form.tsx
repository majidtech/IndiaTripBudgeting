"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CATEGORIES } from "@/lib/constants";
import type { ExchangeRates } from "@/ai/flows/get-exchange-rates";
import type { AppUser } from "@/context/auth-context";
import type { Expense } from "@/lib/types";

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'userName'> & { userName?: string }) => void;
  rates: ExchangeRates | null;
  user: AppUser | null;
}

export function ExpenseDialog({ isOpen, onClose, onAddExpense, rates, user }: ExpenseDialogProps) {
  
  const expenseSchema = z.object({
    description: z.string().min(2, "Description must be at least 2 characters."),
    paidTo: z.string().min(2, "This field is required."),
    contactInfo: z.string().optional(),
    category: z.string().min(1, "Please select a category."),
    totalAmount: z.coerce.number().positive("Amount must be a positive number."),
    advancePaid: z.coerce.number().min(0, "Amount must be a positive number."),
    remainingBalance: z.coerce.number(),
    date: z.date().optional(),
    userName: user?.isAdmin 
      ? z.string().min(1, "User name is required.")
      : z.string().optional(),
  }).refine(data => data.advancePaid <= data.totalAmount, {
    message: "Advance cannot be more than total amount.",
    path: ["advancePaid"],
  });

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      paidTo: "",
      contactInfo: "",
      category: "",
      totalAmount: 0,
      advancePaid: 0,
      remainingBalance: 0,
      userName: "",
    },
  });

  const { watch, setValue } = form;
  const totalAmount = watch("totalAmount");
  const advancePaid = watch("advancePaid");

  useEffect(() => {
    const remaining = (totalAmount || 0) - (advancePaid || 0);
    setValue("remainingBalance", remaining, { shouldValidate: true });
  }, [totalAmount, advancePaid, setValue]);


  const onSubmit = (values: z.infer<typeof expenseSchema>) => {
    onAddExpense({
      ...values,
      date: values.date ? values.date.toISOString() : new Date().toISOString(),
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your expense. All amounts are in Indian Rupees (INR).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
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
                    <Input placeholder="e.g., Hotel Booking" {...field} />
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
                    <Input placeholder="e.g., Hotel Paradise" {...field} />
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
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="advancePaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advance Paid (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2000" {...field} />
                  </FormControl>
                   {rates && field.value > 0 && (
                     <p className="text-xs text-muted-foreground mt-1">
                        USD: ${(field.value * rates.INR_TO_USD).toFixed(2)}, AUD: A$
                        {(field.value * rates.INR_TO_AUD).toFixed(2)}
                      </p>
                   )}
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="remainingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remaining Balance (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} readOnly className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
