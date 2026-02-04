import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

/**
 * QuantAI Service - Quantitative Analysis Engine with Python Integration
 */
export const performStockAnalysis = async (ticker: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave API da Gemini não detectada. Por favor, configure sua chave no botão 'Configurar Chave API'.");
  }

  // Criação da instância dentro da função para garantir o uso da chave mais recente do seletor
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // Fase 1: Coleta de Dados Reais com Google Search
    // Regra: ferramentas de grounding não podem ser combinadas com Code Execution na mesma chamada.
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Obtenha os dados de mercado mais recentes para ${ticker}. 
      Inclua o preço atual, variação do dia e as 3 notícias mais relevantes de hoje.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const marketContext = searchResponse.text;
    const sources = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Relatório de Mercado",
      uri: chunk.web?.uri || "#"
    })) || [];

    // Fase 2: Execução de Código Python para Análise Quantitativa
    // Aqui o Gemini escreve e roda código Python real para processar os dados obtidos.
    const quantAnalysisResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Com base nos dados coletados: "${marketContext}", realize uma análise financeira para ${ticker}.
      1. Use o PYTHON (Code Execution) para calcular indicadores (SMA 7/21, RSI) e criar uma projeção de 5 dias baseada em volatilidade e tendência linear.
      2. Forneça um resumo executivo com sentimento de mercado.`,
      config: {
        tools: [{ codeExecution: {} }]
      },
    });

    const contextData = quantAnalysisResponse.text;

    // Fase 3: Estruturação em JSON Final
    const structuredResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Com base em toda a análise quantitativa anterior: "${contextData}", extraia os dados para este esquema JSON estrito.
      Garanta que o campo 'pythonLogic' contenha o algoritmo Python utilizado para os cálculos.`,
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
    if (error.message?.includes("Requested entity was not found")) {
        throw new Error("Chave API Inválida. Por favor, reconfigure sua chave API nas configurações.");
    }
    throw new Error(error instanceof Error ? error.message : 'Erro ao processar análise quantitativa.');
  }
};