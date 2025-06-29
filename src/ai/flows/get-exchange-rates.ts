'use server';
/**
 * @fileOverview A service to get live currency exchange rates from a third-party API.
 *
 * - getExchangeRates - A function that fetches the latest exchange rates.
 * - ExchangeRates - The return type for the getExchangeRates function.
 */

import { z } from 'zod';

const ExchangeRatesSchema = z.object({
  INR_TO_USD: z.number().describe('The conversion rate from 1 Indian Rupee to US Dollar.'),
  INR_TO_AUD: z.number().describe('The conversion rate from 1 Indian Rupee to Australian Dollar.'),
  USD_TO_INR: z.number().describe('The conversion rate from 1 US Dollar to Indian Rupee.'),
  AUD_TO_INR: z.number().describe('The conversion rate from 1 Australian Dollar to Indian Rupee.'),
});
export type ExchangeRates = z.infer<typeof ExchangeRatesSchema>;

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    // Fetch rates in parallel. Cache for 1 hour using Next.js fetch revalidation.
    const [usdToInrResponse, audToInrResponse] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=USD&to=INR', { next: { revalidate: 3600 } }),
      fetch('https://api.frankfurter.app/latest?from=AUD&to=INR', { next: { revalidate: 3600 } })
    ]);

    if (!usdToInrResponse.ok || !audToInrResponse.ok) {
      console.error('Failed to fetch exchange rates from API.');
      throw new Error('Failed to fetch exchange rates from API.');
    }

    const usdData = await usdToInrResponse.json();
    const audData = await audToInrResponse.json();

    const usdToInrRate = usdData.rates?.INR;
    const audToInrRate = audData.rates?.INR;

    if (typeof usdToInrRate !== 'number' || typeof audToInrRate !== 'number') {
      throw new Error('Invalid data type received from exchange rate API.');
    }

    const rates = {
      USD_TO_INR: usdToInrRate,
      AUD_TO_INR: audToInrRate,
      INR_TO_USD: 1 / usdToInrRate,
      INR_TO_AUD: 1 / audToInrRate,
    };
    
    return ExchangeRatesSchema.parse(rates);

  } catch (error) {
    console.error("Error in getExchangeRates:", error);
    // Rethrow a generic error to be handled by the UI
    throw new Error('Could not fetch exchange rates.');
  }
}
