"use client"

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Expense } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";

interface SpendChartProps {
  expenses: Expense[];
}

export function SpendChart({ expenses }: SpendChartProps) {
  const chartData = useMemo(() => {
    const categoryTotals = CATEGORIES.map(category => ({
      name: category.label,
      total: 0,
    }));

    expenses.forEach(expense => {
      const categoryIndex = categoryTotals.findIndex(c => c.name.toLowerCase() === expense.category);
      if (categoryIndex !== -1) {
        categoryTotals[categoryIndex].total += expense.amount;
      }
    });

    return categoryTotals.filter(c => c.total > 0).sort((a,b) => b.total - a.total);
  }, [expenses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>A visual breakdown of your expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
              formatter={(value: number) => [
                value.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                }),
                "Total",
              ]}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
