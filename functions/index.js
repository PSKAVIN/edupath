const functions = require('firebase-functions');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: functions.config().gemini.key });

exports.chat = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const systemInstruction = "You are a helpful educational assistant for the EduPath AI platform. Help students understand course material, provide study tips, and answer questions about their learning path.";
    const conversation = messages
      .map((message) => {
        if (message.role === "user") return `User: ${message.text}`;
        return `Assistant: ${message.text}`;
      })
      .join("\n");

    const prompt = `${systemInstruction}\n\nConversation:\n${conversation}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents: prompt,
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate response." });
  }
});