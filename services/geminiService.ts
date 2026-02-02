
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

/**
 * QuantAI Service - Quantitative Analysis Engine
 * Adheres to strict @google/genai SDK guidelines.
 */
export const performStockAnalysis = async (ticker: string): Promise<AnalysisResult> => {
  // Always use the process.env.API_KEY directly as required by instructions.
  // The key is assumed to be pre-configured.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Stage 1: Grounding with Google Search for up-to-date context
    // Necessary for the high-reasoning 'gemini-3-pro-preview' model
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform an in-depth financial analysis of the ticker ${ticker} right now. 
      Focus on the last trade price, current daily volatility, and the top 3 latest news headlines influencing the asset.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Access .text as a property, not a method
    const marketData = searchResponse.text;
    
    // Extract sources for UI transparency - required when using Google Search grounding
    const sources = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Financial Report",
      uri: chunk.web?.uri || "#"
    })) || [];

    // Stage 2: JSON generation with embedded Python logic
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Based on this real-time data: "${marketData}", generate a complete quantitative analysis for ${ticker}.
      Format: JSON.
      Requirements:
      1. Predict price points for the next 7 days in 'forecast'.
      2. Set 'confidenceScore' as a percentage (0-100).
      3. In 'pythonLogic', write a functional Python snippet using Pandas/Prophet style math that models this prediction.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            companyName: { type: Type.STRING },
            currentPrice: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            percentageChange: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            pythonLogic: { type: Type.STRING },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  type: { type: Type.STRING }
                },
                required: ["date", "price", "type"]
              }
            }
          },
          required: ["ticker", "companyName", "currentPrice", "percentageChange", "confidenceScore", "forecast", "summary", "sentiment", "pythonLogic"]
        }
      }
    });

    // Access .text as a property, not a method
    const jsonStr = response.text || "{}";
    const result = JSON.parse(jsonStr.trim());

    return {
      ...result,
      sources
    };
  } catch (error: any) {
    console.error("Gemini Service Exception:", error);
    throw new Error(error instanceof Error ? error.message : 'Quant analysis failed.');
  }
};
