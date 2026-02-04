
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

/**
 * QuantAI Service - Quantitative Analysis Engine
 */
export const performStockAnalysis = async (ticker: string): Promise<AnalysisResult> => {
  // Conforme as diretrizes, a chave deve ser obtida de process.env.API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave API da Gemini não detectada. Por favor, clique em 'CONFIGURAR CHAVE API' na tela inicial para continuar.");
  }

  // Criamos uma nova instância a cada chamada para garantir que usamos a chave mais recente selecionada pelo usuário
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // Fase 1: Busca de dados em tempo real (Grounding)
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Execute uma análise financeira detalhada para o ticker ${ticker} neste exato momento. 
      Considere o preço atual de mercado, volume e as notícias mais relevantes das últimas 24 horas.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const marketData = searchResponse.text;
    const sources = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Relatório Financeiro",
      uri: chunk.web?.uri || "#"
    })) || [];

    // Fase 2: Geração de análise quantitativa estruturada
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Utilizando estes dados de mercado: "${marketData}", realize uma previsão quantitativa para ${ticker}.
      Retorne exclusivamente em JSON.
      Inclua:
      1. Previsão de preços para os próximos 7 dias.
      2. Sentimento predominante (Bullish/Bearish).
      3. Um snippet de código Python que simule a lógica matemática desta previsão.`,
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

    const jsonStr = response.text || "{}";
    const result = JSON.parse(jsonStr.trim());

    return {
      ...result,
      sources
    };
  } catch (error: any) {
    console.error("Gemini Engine Error:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Erro de Chave API: A chave selecionada pode ser inválida ou não pertencer a um projeto com faturamento ativo.");
    }
    throw new Error(error instanceof Error ? error.message : 'Falha ao processar análise quantitativa.');
  }
};
