import type React from 'react';

export type Category = {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type Expense = {
  id: string;
  description: string;
  totalAmount: number; // in INR
  advancePaid: number; // in INR
  remainingBalance: number; // in INR
  category: string;
  date: string;
  userName: string;
  paidTo: string;
  contactInfo?: string;
};
