import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();

// 1. Explicitly configure CORS to handle preflight requests
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize OpenAI client with OpenRouter's endpoint
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

app.post('/api/generate-grocery', async (req, res) => {
    const { nutrients, goals } = req.body;

    const promptText = `
    Act as an expert nutritionist and fitness coach. Generate a tailored grocery list for a user with the following targets and goals:
    - Target Nutrients: ${nutrients}
    - Dietary/Fitness Goals: ${goals}
    Format the output clearly into categorized bullet-pointed sections (e.g., Proteins, Complex Carbs, Healthy Fats, Produce/Micronutrients). Keep concise and actionable.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'openrouter/free',
            messages: [{ role: 'user', content: promptText }],
        });

        const textResponse = completion.choices[0].message.content;
        res.json({ text: textResponse });

    } catch (error) {
        console.error("OpenRouter Error:", error?.response?.data || error.message || error);
        res.status(500).json({ error: "Failed to communicate with OpenRouter" });
    }
});

// 2. Bind to 0.0.0.0 so both localhost and 127.0.0.1 work seamlessly
app.listen(8080, '0.0.0.0', () => {
    console.log('Server running on http://127.0.0.1:8080 and http://localhost:8080');
});