import { GoogleGenAI, Type } from "@google/genai";
import { ClassifyResponse, TicketCategory, TicketPriority } from "../types";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const classifyTicketDescription = async (description: string): Promise<ClassifyResponse> => {
  if (!API_KEY) {
    console.warn("No API Key provided. Returning default classification.");
    return {
      suggested_category: TicketCategory.GENERAL,
      suggested_priority: TicketPriority.LOW
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: description,
      config: {
        systemInstruction: `
          You are an automated support ticket classification system.
          Analyze the ticket description and categorize it into one of the following categories:
          - billing
          - technical
          - account
          - general
          
          And assign a priority level based on urgency and impact:
          - low
          - medium
          - high
          - critical
          
          Return the result in JSON format.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggested_category: {
              type: Type.STRING,
              enum: [
                TicketCategory.BILLING,
                TicketCategory.TECHNICAL,
                TicketCategory.ACCOUNT,
                TicketCategory.GENERAL
              ]
            },
            suggested_priority: {
              type: Type.STRING,
              enum: [
                TicketPriority.LOW,
                TicketPriority.MEDIUM,
                TicketPriority.HIGH,
                TicketPriority.CRITICAL
              ]
            }
          },
          required: ["suggested_category", "suggested_priority"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ClassifyResponse;
    }
    
    throw new Error("Empty response from LLM");
  } catch (error) {
    console.error("LLM Classification failed:", error);
    return {
      suggested_category: TicketCategory.GENERAL,
      suggested_priority: TicketPriority.MEDIUM
    };
  }
};