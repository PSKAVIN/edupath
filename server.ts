import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("No GEMINI_API_KEY found. Chatbot will not work until a valid Gemini API key is provided.");
}
const ai = new GoogleGenAI({ apiKey });

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY. Please add a valid key to your .env file or AI Studio secrets." });
    }

    const systemInstruction = "You are a helpful educational assistant for the EduPath AI platform. Help students understand course material, provide study tips, and answer questions about their learning path.";
    const conversation = messages
      .map((message: any) => {
        if (message.role === "user") return `User: ${message.text}`;
        return `Assistant: ${message.text}`;
      })
      .join("\n");

    const prompt = `${systemInstruction}\n\nConversation:\n${conversation}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate response." });
  }
});

if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
