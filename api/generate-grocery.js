import { OpenRouter } from "@openrouter/sdk";
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("Loaded Key Length:", process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : 0);

const apiKey = process.env.OPENROUTER_API_KEY;

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

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey || 'missing-key-placeholder', 
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
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

app.post('/api/generate-workout', async (req, res) => {
    try {
        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(500).json({ error: "Server misconfiguration: OPENROUTER_API_KEY is not set in .env" });
        }

        const { fitnessLevel, goals, daysPerWeek, description } = req.body || {};

        if (!description && (!fitnessLevel || !goals)) {
            return res.status(400).json({ error: "Either a workout description or fitness level and goals are required." });
        }

        const userGoal = goals || description || "General fitness and strength";
        const level = fitnessLevel || "Intermediate";

        const promptText = `
        Act as a professional strength and conditioning coach. Generate a tailored workout routine for a user with the following details:
        - Fitness Level: ${level}
        - Goals/Preferences: ${userGoal}
        - Availability/Details: ${daysPerWeek || '3-4'} days per week / Request: "${description || userGoal}"

        Return only a simple bullet list. Each bullet must include:
        1. The exercise name
        2. Sets and reps
        3. A short tip

        Do not include headings, introductions, explanations, or any extra commentary. Keep it concise, safe, and effective.

        Format each bullet like this:
        - Exercise Name — 3 sets of 10 reps. Tip: ...
        `;

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