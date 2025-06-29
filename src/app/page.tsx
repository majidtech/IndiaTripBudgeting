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

const initialExpenses: Expense[] = [
  { id: "1", description: "Flight to Delhi", amount: 35000, category: "transport", date: new Date().toISOString() },
  { id: "2", description: "Hotel in Jaipur (3 nights)", amount: 12000, category: "accommodation", date: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", description: "Dinner at a local restaurant", amount: 1500, category: "food", date: new Date(Date.now() - 172800000).toISOString() },
  { id: "4", description: "Taj Mahal entry fee", amount: 1100, category: "activities", date: new Date(Date.now() - 259200000).toISOString() },
  { id: "5", description: "Souvenirs from market", amount: 2500, category: "shopping", date: new Date(Date.now() - 345600000).toISOString() },
];

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [budget, setBudget] = useState(100000);
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

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const addExpense = useCallback((newExpense: Omit<Expense, 'id' | 'date'>) => {
    setExpenses(prev => [{ ...newExpense, id: crypto.randomUUID(), date: new Date().toISOString() }, ...prev]);
  }, []);

  const handleSetBudget = (newBudget: number) => {
    if (newBudget > 0) {
      setBudget(newBudget);
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
      />
    </div>
  );
}
