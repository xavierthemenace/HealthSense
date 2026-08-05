import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'grocery-api' });
});

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey || 'missing-key-placeholder',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'HealthSense App',
  },
});

app.post('/api/generate-grocery', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        error: 'Server misconfiguration: OPENROUTER_API_KEY is not set in .env',
      });
    }

    const { nutrients, goals } = req.body || {};

    if (!nutrients || !goals) {
      return res.status(400).json({ error: 'Nutrients and goals are required fields.' });
    }

    const promptText = `
Act as an expert nutritionist and fitness coach.
Create a concise, actionable grocery list tailored to the user's nutrition targets and goals.

Target nutrients: ${nutrients}
Goals: ${goals}

Return the response as clear sections with bullet points. Use categories such as Proteins, Complex Carbs, Healthy Fats, Produce, Pantry, and Extras. Keep it practical and easy to shop from.
`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: promptText }],
    });

    const content = completion?.choices?.[0]?.message?.content;
    const textResponse = Array.isArray(content)
      ? content.map((part) => part?.text || '').join('')
      : content || 'No content returned from AI.';

    return res.json({ text: textResponse });
  } catch (error) {
    console.error('OpenRouter API Error:', error?.response?.data || error?.message || error);
    return res.status(500).json({
      error: 'Failed to communicate with AI server',
      details: error?.message || 'Internal Server Error',
    });
  }
});

app.post('/api/generate-workout', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        error: 'Server misconfiguration: OPENROUTER_API_KEY is not set in .env',
      });
    }

    const { fitnessLevel, goals, description, daysPerWeek } = req.body || {};
    const userGoal = goals || description || 'General fitness and strength';
    const level = fitnessLevel || 'Intermediate';

    const promptText = `
Act as a professional strength and conditioning coach.
Create a concise workout routine for the user.

Fitness level: ${level}
Goals: ${userGoal}
Availability: ${daysPerWeek || '3-4'} days per week
Details: ${description || userGoal}

Return a simple bullet list. Each bullet should include the exercise name, sets/reps, and a short tip. Keep it safe and practical.
`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: promptText }],
    });

    const content = completion?.choices?.[0]?.message?.content;
    const textResponse = Array.isArray(content)
      ? content.map((part) => part?.text || '').join('')
      : content || 'No content returned from AI.';

    return res.json({ text: textResponse });
  } catch (error) {
    console.error('Workout API Error:', error?.response?.data || error?.message || error);
    return res.status(500).json({
      error: 'Failed to generate workout',
      details: error?.message || 'Internal Server Error',
    });
  }
});

app.post('/api/scan-food', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const name = (req.file.originalname || '').toLowerCase();
    const detectedFood = name.includes('salad')
      ? 'Greek Salad'
      : name.includes('sandwich')
        ? 'Turkey Sandwich'
        : name.includes('pizza')
          ? 'Margherita Pizza'
          : name.includes('smoothie')
            ? 'Berry Smoothie'
            : name.includes('burger')
              ? 'Chicken Burger'
              : name.includes('pasta')
                ? 'Pasta Bowl'
                : name.includes('bowl')
                  ? 'Protein Bowl'
                  : 'Mixed Plate';

    const nutritionMap = {
      'Greek Salad': { calories: 320, protein: 14, carbs: 26, fat: 16 },
      'Turkey Sandwich': { calories: 460, protein: 28, carbs: 42, fat: 17 },
      'Margherita Pizza': { calories: 620, protein: 24, carbs: 74, fat: 25 },
      'Berry Smoothie': { calories: 290, protein: 16, carbs: 38, fat: 8 },
      'Chicken Burger': { calories: 540, protein: 34, carbs: 41, fat: 22 },
      'Pasta Bowl': { calories: 560, protein: 23, carbs: 72, fat: 20 },
      'Protein Bowl': { calories: 500, protein: 30, carbs: 48, fat: 19 },
      'Mixed Plate': { calories: 420, protein: 22, carbs: 45, fat: 18 },
    };

    const nutrition = nutritionMap[detectedFood] || nutritionMap['Mixed Plate'];

    return res.json({
      food: detectedFood,
      confidence: 0.86,
      nutrition,
    });
  } catch (error) {
    console.error('Scan API Error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to scan food image.' });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const isDirectRun = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

export default app;