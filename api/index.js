import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/generate-workout', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server.' });
    }

    const { fitnessLevel, goals, description } = req.body;

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://health-sense.vercel.app", // Optional site url for OpenRouter rankings
        "X-Title": "HealthSense" // Optional site title
      },
      body: JSON.stringify({
        model: "openrouter/free", // Or another preferred OpenRouter model ID
        messages: [
          {
            role: "system",
            content: "You are an expert fitness coach. Create detailed, structured workout routines."
          },
          {
            role: "user",
            content: `Create a workout plan for someone with fitness level: ${fitnessLevel}. Goals/Equipment: ${goals || description}`
          }
        ]
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("OpenRouter Error Response:", errorText);
      return res.status(500).json({ error: `OpenRouter API failed with status ${openRouterResponse.status}` });
    }

    const data = await openRouterResponse.json();
    const resultText = data.choices?.[0]?.message?.content || "No workout routine generated.";

    return res.status(200).json({ text: resultText });
  } catch (err) {
    console.error("Server endpoint error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default app;