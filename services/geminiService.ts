import { GoogleGenAI } from "@google/genai";
import { PricePoint } from "../types";

export const analyzeMarket = async (prices: PricePoint[]): Promise<string> => {
  if (!process.env.API_KEY) return "AI Analyst unavailable (Missing API Key)";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Format data for the prompt
    const priceStr = prices.map(p => `${p.time}: $${p.price.toFixed(2)}`).join('\n');
    
    const prompt = `
      Act as a crypto market analyst. Here are the last few BTC price points (15 min interval context):
      ${priceStr}
      
      Predict the trend for the next 15 minutes. 
      Be concise (max 20 words). 
      Format: "Trend: [Bullish/Bearish/Neutral]. [Reasoning]."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Analysis currently unavailable.";
  }
};