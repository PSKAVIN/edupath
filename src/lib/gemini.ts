import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generatePersonalizedPath(
  studentProfile: any,
  courseContent: any,
  assessmentHistory: any[]
) {
  const prompt = `
    Based on the following student profile and performance, generate a personalized learning path for the course.
    
    Student Profile: ${JSON.stringify(studentProfile)}
    Course Content: ${JSON.stringify(courseContent)}
    Assessment History: ${JSON.stringify(assessmentHistory)}
    
    The path should be an ordered list of module IDs that the student should focus on next.
    Provide a brief reasoning for this path.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          path: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Ordered list of module IDs"
          },
          reasoning: {
            type: Type.STRING,
            description: "Reasoning for the suggested path"
          }
        },
        required: ["path", "reasoning"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateFeedback(
  assessmentData: any,
  moduleContent: any
) {
  const prompt = `
    Analyze the student's assessment performance and provide constructive feedback.
    
    Assessment Data: ${JSON.stringify(assessmentData)}
    Module Content: ${JSON.stringify(moduleContent)}
    
    Provide feedback that highlights strengths and suggests specific areas for improvement.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function startChat(systemInstruction: string, model: string = "gemini-3-flash-preview") {
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
  });
  return chat;
}

export async function sendMessage(chat: any, message: string) {
  const response = await chat.sendMessage({ message });
  return response.text;
}
