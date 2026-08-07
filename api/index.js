import serverless from 'serverless-http';
import app from './generate-grocery.js';
import config from '../config.js'; 

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Parse path to route requests correctly
    const url = req.url;

    try {
        if (url.includes('/api/generate-workout')) {
            const { description, fitnessLevel, goals } = req.body || {};

            // Example call to OpenRouter API
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful workout generator." },
                        { role: "user", content: `Fitness level: ${fitnessLevel}. Goals/Description: ${description || goals}` }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                return res.status(response.status).json({ error: "OpenRouter API error", details: errorData });
            }

            const data = await response.json();
            const textResult = data.choices?.[0]?.message?.content || "No workout generated.";

            return res.status(200).json({ text: textResult });
        }

        return res.status(404).json({ error: "Endpoint not found" });
    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

export default serverless(app);
