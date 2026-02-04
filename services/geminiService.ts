
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

/**
 * QuantAI Service - Quantitative Analysis Engine with Python Integration
 */
export const performStockAnalysis = async (ticker: string): Promise<AnalysisResult> => {
  // Sempre pega a chave mais recente do process.env.API_KEY injetado pelo AI Studio
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave API da Gemini não detectada. Por favor, configure sua chave no botão 'Configurar Chave API'.");
  }

  // Criar instância aqui garante que usamos a chave atualizada após a troca (sem race conditions)
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // Fase 1: Análise e Execução de Código Python
    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Execute uma análise técnica e quantitativa rigorosa para a ação ${ticker}.
      1. Use o Google Search para obter dados de fechamento recentes e notícias do dia.
      2. Use o PYTHON (Code Execution) para calcular a média móvel simples (SMA 7 e 14), o RSI (Índice de Força Relativa) e projetar a tendência de preço para os próximos 5 dias úteis com base em volatilidade calculada.
      3. Retorne sua análise detalhada e o script Python utilizado.`,
      config: {
        tools: [
          { googleSearch: {} },
          { codeExecution: {} } // Habilita o interpretador Python do Gemini
        ],
      },
    });

    const contextData = analysisResponse.text;
    const sources = analysisResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Relatório de Mercado",
      uri: chunk.web?.uri || "#"
    })) || [];

    // Fase 2: Estruturação dos dados para o Dashboard
    const structuredResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Com base na análise quantitativa anterior: "${contextData}", extraia os dados para o formato JSON estrito.
      No campo 'pythonLogic', descreva o algoritmo Python utilizado para os cálculos estatísticos.`,
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
            sentiment: { type: Type.STRING, description: "Bullish, Bearish ou Neutral" },
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

    const jsonStr = structuredResponse.text || "{}";
    const result = JSON.parse(jsonStr.trim());

    return {
      ...result,
      sources
    };
  } catch (error: any) {
    console.error("QuantAI Analysis Error:", error);
    // Se a chave for inválida ou expirar
    if (error.message?.includes("Requested entity was not found")) {
        throw new Error("Chave API Inválida. Por favor, reconfigure sua chave API nas configurações.");
    }
    throw new Error(error instanceof Error ? error.message : 'Erro ao processar análise quantitativa.');
  }
};
