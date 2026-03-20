import { GoogleGenAI, ThinkingLevel, Modality, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;

export const getGeminiPro = () => new GoogleGenAI({ apiKey });

export const cleanJsonResponse = (text: string) => {
  return text.replace(/```json\n?|```/g, "").trim();
};

export const analyzeImage = async (base64Data: string, mimeType: string, prompt: string) => {
  const ai = getGeminiPro();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meal_name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              p: { type: Type.NUMBER },
              c: { type: Type.NUMBER },
              f: { type: Type.NUMBER }
            },
            required: ["p", "c", "f"]
          },
          health_score: { type: Type.NUMBER },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["meal_name", "calories", "macros", "health_score", "suggestions"]
      }
    }
  });
  return response.text;
};

export const chatWithThinking = async (message: string) => {
  const ai = getGeminiPro();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: message,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });
  return response.text;
};

export const fastChat = async (message: string) => {
  const ai = getGeminiPro();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: message
  });
  return response.text;
};

export const searchGrounding = async (query: string) => {
  const ai = getGeminiPro();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const mapsGrounding = async (query: string, location?: { latitude: number, longitude: number }) => {
  const ai = getGeminiPro();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: location
        }
      }
    }
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = getGeminiPro();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
