"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, Landmark, DollarSign, Repeat } from "lucide-react";
import type { ExchangeRates } from "@/ai/flows/get-exchange-rates";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyConverterProps {
    rates: ExchangeRates | null;
}

export function CurrencyConverter({ rates }: CurrencyConverterProps) {
  const [inrValue, setInrValue] = useState("1000");
  const [usdValue, setUsdValue] = useState("");
  const [audValue, setAudValue] = useState("");

  const calculateConversions = useCallback((value: string, from: "INR" | "USD" | "AUD") => {
    if (!rates) return;

    const numericValue = parseFloat(value) || 0;
    if (from === 'INR') {
        setInrValue(value);
        setUsdValue((numericValue * rates.INR_TO_USD).toFixed(2));
        setAudValue((numericValue * rates.INR_TO_AUD).toFixed(2));
    } else if (from === 'USD') {
        const inr = numericValue * rates.USD_TO_INR;
        setInrValue(inr.toFixed(2));
        setUsdValue(value);
        setAudValue((inr * rates.INR_TO_AUD).toFixed(2));
    } else { // from AUD
        const inr = numericValue * rates.AUD_TO_INR;
        setInrValue(inr.toFixed(2));
        setUsdValue((inr * rates.INR_TO_USD).toFixed(2));
        setAudValue(value);
    }
  }, [rates]);

  useEffect(() => {
    if (rates) {
        calculateConversions("1000", 'INR');
    }
  }, [rates, calculateConversions]);


  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Currency Converter</CardTitle>
        <Repeat className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {rates ? (
            <div className="space-y-4">
                <div className="relative">
                    <Label htmlFor="inr-input" className="text-xs text-muted-foreground">INR</Label>
                    <IndianRupee className="absolute left-3 top-8 h-4 w-4 text-muted-foreground" />
                    <Input id="inr-input" value={inrValue} onChange={(e) => calculateConversions(e.target.value, 'INR')} className="pl-9" placeholder="0.00" />
                </div>
                <div className="relative">
                    <Label htmlFor="usd-input" className="text-xs text-muted-foreground">USD</Label>
                    <DollarSign className="absolute left-3 top-8 h-4 w-4 text-muted-foreground" />
                    <Input id="usd-input" value={usdValue} onChange={(e) => calculateConversions(e.target.value, 'USD')} className="pl-9" placeholder="0.00"/>
                </div>
                <div className="relative">
                    <Label htmlFor="aud-input" className="text-xs text-muted-foreground">AUD</Label>
                    <Landmark className="absolute left-3 top-8 h-4 w-4 text-muted-foreground" />
                    <Input id="aud-input" value={audValue} onChange={(e) => calculateConversions(e.target.value, 'AUD')} className="pl-9" placeholder="0.00"/>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
