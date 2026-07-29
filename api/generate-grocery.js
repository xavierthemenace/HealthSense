import 'dotenv/config';
import express from 'express';
import cors from 'cors'; // 1. Import CORS
import OpenAI from 'openai';

const app = express();

// 2. Enable CORS for all incoming requests
app.use(cors()); 
app.use(express.json());

// Initialize OpenAI client with fixed OpenRouter base URL
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai', 
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
            model: 'openrouter/free', // Use a valid free model slug
            messages: [{ role: 'user', content: promptText }],
        });

        const textResponse = completion.choices[0].message.content;
        res.json({ text: textResponse });

    } catch (error) {
        console.error("OpenRouter Error:", error);
        res.status(500).json({ error: "Failed to communicate with OpenRouter" });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
