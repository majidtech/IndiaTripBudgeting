"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Expense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/header";
import { BudgetCard } from "@/components/budget-card";
import { SpendChart } from "@/components/spend-chart";
import { RecentTransactions } from "@/components/recent-transactions";
import { CurrencyConverter } from "@/components/currency-converter";
import { ExpenseDialog } from "@/components/expense-form";
import { PlusCircle } from "lucide-react";
import { getExchangeRates, type ExchangeRates } from "@/ai/flows/get-exchange-rates";
import { useAuth, type AppUser } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { addExpenseToDb, subscribeToExpenses } from "@/services/expense-service";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToBudget, updateBudget } from "@/services/budget-service";
import type { FirebaseError } from "firebase/app";


export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState(100000); // Default, will be overwritten by Firestore
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [rates, setRates] = useState<ExchangeRates | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const fetchedRates = await getExchangeRates();
        setRates(fetchedRates);
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    
    const handleFirestoreError = (error: FirebaseError) => {
      let description = "Could not connect to the database. Please check your internet connection.";
      if (error.code === 'permission-denied' || error.code === 'unauthenticated' || error.message.includes('400')) {
        description = "The app could not reach the database. This is often caused by missing Firestore setup in your Firebase project. Please ensure Firestore is created and the API is enabled.";
      }
      
      toast({
        title: "Database Connection Error",
        description: description,
        variant: "destructive",
        duration: 20000, // Show for longer
      });
    };


    const unsubscribeExpenses = subscribeToExpenses(setExpenses, handleFirestoreError);
    const unsubscribeBudget = subscribeToBudget(setBudget, handleFirestoreError);

    return () => {
      unsubscribeExpenses();
      unsubscribeBudget();
    };
  }, [user, toast]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.advancePaid, 0);
  }, [expenses]);

  const addExpense = useCallback(async (newExpense: Omit<Expense, 'id' | 'userName'> & { userName?: string }) => {
    const expenseUserName = (user?.isAdmin && newExpense.userName) ? newExpense.userName : user?.name;

    if (!expenseUserName) {
       toast({
        title: "Name Not Set",
        description: "Cannot add expense without a user name.",
        variant: "destructive",
      });
      return;
    }

    const expenseToSave = {
        ...newExpense,
        userName: expenseUserName,
    };

    try {
        await addExpenseToDb(expenseToSave);
        toast({
          title: "Success!",
          description: "Your expense has been added.",
        });
    } catch (error) {
        console.error("Failed to add expense:", error);
        let description = "Failed to save the expense. Please try again.";
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('unauthenticated') || error.message.includes('400'))) {
          description = "Failed to save. Please check your Firebase project setup and security rules.";
        }
        toast({
            title: "Error Saving Expense",
            description: description,
            variant: "destructive",
        });
    }
  }, [user, toast]);

  const handleSetBudget = async (newBudget: number) => {
    if (newBudget > 0) {
      try {
        await updateBudget(newBudget);
      } catch (error) {
        console.error("Failed to update budget:", error);
         let description = "Could not save the new budget. Please try again.";
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('unauthenticated') || error.message.includes('400'))) {
          description = "Failed to save. Please check your Firebase project setup and security rules.";
        }
        toast({
          title: "Error Updating Budget",
          description: description,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
            <Button onClick={() => setExpenseDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <BudgetCard totalBudget={budget} totalSpent={totalSpent} onSetBudget={handleSetBudget} rates={rates} />
          <CurrencyConverter rates={rates} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <SpendChart expenses={expenses} />
          </div>
          <div className="lg:col-span-3">
            <RecentTransactions expenses={expenses.slice(0, 5)} />
          </div>
        </div>
      </main>
      <ExpenseDialog
        isOpen={isExpenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
        onAddExpense={addExpense}
        rates={rates}
        user={user}
      />
    </div>
  );
}
