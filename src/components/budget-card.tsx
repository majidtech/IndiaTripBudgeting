"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet, IndianRupee } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "./ui/label";
import type { ExchangeRates } from "@/ai/flows/get-exchange-rates";

interface BudgetCardProps {
  totalBudget: number;
  totalSpent: number;
  onSetBudget: (newBudget: number) => void;
  rates: ExchangeRates | null;
}

export function BudgetCard({ totalBudget, totalSpent, onSetBudget, rates }: BudgetCardProps) {
  const [newBudget, setNewBudget] = useState(totalBudget.toString());
  const remaining = totalBudget - totalSpent;
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetValue = parseFloat(newBudget);
    if (!isNaN(budgetValue)) {
      onSetBudget(budgetValue);
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Trip Budget</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center">
          <IndianRupee className="h-6 w-6 mr-1" />{totalBudget.toLocaleString('en-IN')}
        </div>
        <p className="text-xs text-muted-foreground">
          {rates
            ? `~$${(totalBudget * rates.INR_TO_USD).toFixed(0)} USD / A$${(totalBudget * rates.INR_TO_AUD).toFixed(0)} AUD`
            : "Loading rates..."
          }
        </p>
        <Progress value={progress} className="mt-4" />
        <div className="mt-2 text-sm flex justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            Spent: <IndianRupee className="h-3.5 w-3.5" />{totalSpent.toLocaleString('en-IN')}
          </span>
          <span className={`flex items-center gap-1 ${remaining < 0 ? "text-destructive" : ""}`}>
            Remaining: <IndianRupee className="h-3.5 w-3.5" />{remaining.toLocaleString('en-IN')}
          </span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4">Set Budget</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <form onSubmit={handleBudgetSubmit} className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Set Your Trip Budget</h4>
                <p className="text-sm text-muted-foreground">
                  Enter your total budget in INR.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget (INR)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="e.g., 100000"
                />
              </div>
              <Button type="submit">Save Budget</Button>
            </form>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
