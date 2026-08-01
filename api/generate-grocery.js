import { OpenRouter } from "@openrouter/sdk";
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Force dotenv to load from the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug log to verify loading
console.log("Loaded Key Length:", process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : 0);

// Load environment variables
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

// Sanity check before initializing OpenAI
if (!apiKey) {
    console.error("❌ CRITICAL ERROR: OPENROUTER_API_KEY is missing or empty in your .env file!");
}

const app = express();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Fallback to empty string to prevent OpenAI SDK throwing an immediate crash on startup
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey || 'missing-key-placeholder', 
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:8080',
        'X-Title': 'HealthSense App',
    }
});

app.post('/api/generate-grocery', async (req, res) => {
    try {
        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(500).json({ error: "Server misconfiguration: OPENROUTER_API_KEY is not set in .env" });
        }

        const { nutrients, goals } = req.body || {};

        if (!nutrients || !goals) {
            return res.status(400).json({ error: "Nutrients and goals are required fields." });
        }

        const promptText = `
        Act as an expert nutritionist and fitness coach. Generate a tailored grocery list for a user with the following targets and goals:
        - Target Nutrients: ${nutrients}
        - Dietary/Fitness Goals: ${goals}
        Format the output clearly into categorized bullet-pointed sections (e.g., Proteins, Complex Carbs, Healthy Fats, Produce/Micronutrients). Keep concise and actionable.`;

        const completion = await openai.chat.completions.create({
            model: 'openrouter/free',
            messages: [{ role: 'user', content: promptText }],
        });

        const textResponse = completion?.choices?.[0]?.message?.content || "No content returned from AI.";
        return res.json({ text: textResponse });

    } catch (error) {
        console.error("OpenRouter API Error:", error?.response?.data || error.message || error);
        return res.status(500).json({ 
            error: "Failed to communicate with AI server", 
            details: error?.message || "Internal Server Error" 
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});