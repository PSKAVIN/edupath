import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ai || !apiKey) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY. Add it in Vercel → Project Settings → Environment Variables.",
    });
  }

  try {
    const { messages, model } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const systemInstruction =
      "You are a helpful educational assistant for the EduPath AI platform. Help students understand course material, provide study tips, and answer questions about their learning path.";

    const conversation = messages
      .map((message: any) => {
        if (message.role === "user") return `User: ${message.text}`;
        return `Assistant: ${message.text}`;
      })
      .join("\n");

    const prompt = `${systemInstruction}\n\nConversation:\n${conversation}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: model || "gemini-2.0-flash",
      contents: prompt,
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate response." });
  }
}
