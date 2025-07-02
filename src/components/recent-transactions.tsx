"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Expense } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { format, formatDistanceToNow } from "date-fns";
import { IndianRupee } from "lucide-react";

interface RecentTransactionsProps {
  expenses: Expense[];
}

export function RecentTransactions({ expenses }: RecentTransactionsProps) {
  const getCategoryInfo = (categoryValue: string) => {
    return CATEGORIES.find(c => c.value === categoryValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>The last few transactions from the group.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expense</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => {
                const category = getCategoryInfo(expense.category);
                const CategoryIcon = category?.icon;
                return (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {CategoryIcon && <div className="p-2 bg-muted rounded-full"><CategoryIcon className="h-4 w-4 text-muted-foreground" /></div>}
                        <div>
                          <p className="font-medium">{expense.description}</p>
                           <p className="text-sm text-muted-foreground">
                            Paid to: {expense.paidTo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            By {expense.userName} &middot; {format(new Date(expense.date), "MMM d")}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="inline-flex items-center justify-end gap-1 font-semibold">
                        <IndianRupee className="h-4 w-4" />
                        {expense.advancePaid.toLocaleString('en-IN')}
                      </div>
                      {expense.remainingBalance > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {expense.remainingBalance.toLocaleString('en-IN')} due
                        </p>
                      )}
                       <p className="text-xs text-muted-foreground">
                          Total: {expense.totalAmount.toLocaleString('en-IN')}
                        </p>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No expenses added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
