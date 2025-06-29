'use server';
/**
 * @fileOverview A flow to get live currency exchange rates.
 *
 * - getExchangeRates - A function that fetches the latest exchange rates.
 * - ExchangeRates - The return type for the getExchangeRates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExchangeRatesSchema = z.object({
  INR_TO_USD: z.number().describe('The conversion rate from 1 Indian Rupee to US Dollar.'),
  INR_TO_AUD: z.number().describe('The conversion rate from 1 Indian Rupee to Australian Dollar.'),
  USD_TO_INR: z.number().describe('The conversion rate from 1 US Dollar to Indian Rupee.'),
  AUD_TO_INR: z.number().describe('The conversion rate from 1 Australian Dollar to Indian Rupee.'),
});
export type ExchangeRates = z.infer<typeof ExchangeRatesSchema>;

export async function getExchangeRates(): Promise<ExchangeRates> {
  return getExchangeRatesFlow();
}

const prompt = ai.definePrompt({
  name: 'getExchangeRatesPrompt',
  output: {schema: ExchangeRatesSchema},
  prompt: `You are a financial data provider. Your task is to provide the most current, real-time currency exchange rates.

  Provide the exchange rates for the following pairs:
  - INR to USD
  - INR to AUD
  - USD to INR
  - AUD to INR
  
  Return the data in the requested JSON format. Do not add any extra commentary or explanations.`,
});

const getExchangeRatesFlow = ai.defineFlow(
  {
    name: 'getExchangeRatesFlow',
    outputSchema: ExchangeRatesSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
