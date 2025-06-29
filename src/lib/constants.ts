import { BedDouble, UtensilsCrossed, Plane, Ticket, ShoppingCart, MoreHorizontal } from "lucide-react";
import type { Category } from "./types";

export const CONVERSION_RATES = {
  INR_TO_USD: 0.012,
  INR_TO_AUD: 0.018,
};

export const CATEGORIES: Category[] = [
  { value: "accommodation", label: "Accommodation", icon: BedDouble },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "transport", label: "Transport", icon: Plane },
  { value: "activities", label: "Activities", icon: Ticket },
  { value: "shopping", label: "Shopping", icon: ShoppingCart },
  { value: "miscellaneous", label: "Miscellaneous", icon: MoreHorizontal },
];
