import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const shouldLoadDotenv = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

if (shouldLoadDotenv) {
  dotenv.config({ path: path.resolve(projectRoot, '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const model = process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'grocery-api',
    aiConfigured: Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY),
  });
});

function createOpenAIClient() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey || !String(apiKey).trim()) {
    throw new Error('No AI provider configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY.');
  }

  return new OpenAI({
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'HealthSense App',
    },
  });
}

function buildFallbackGroceryText(nutrients, goals) {
  const nutrientItems = String(nutrients || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const goalItems = String(goals || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const focusSummary = nutrientItems.length > 0
    ? `Focus on ${nutrientItems.join(', ')}.`
    : 'Focus on balanced everyday nutrition.';
  const goalSummary = goalItems.length > 0
    ? `These picks support ${goalItems.join(', ')}.`
    : 'These picks support your broader wellness goals.';

  return [
    'Here is a practical starter grocery list:',
    '',
    'Proteins',
    '- Chicken breast or tofu',
    '- Greek yogurt or cottage cheese',
    '- Eggs',
    '',
    'Complex Carbs',
    '- Brown rice or quinoa',
    '- Oats',
    '- Sweet potatoes',
    '',
    'Healthy Fats',
    '- Avocado',
    '- Olive oil',
    '- Nuts or seeds',
    '',
    'Produce',
    '- Spinach',
    '- Broccoli',
    '- Bell peppers',
    '- Berries or apples',
    '',
    'Pantry',
    '- Beans or lentils',
    '- Whole grain bread',
    '- Low-sodium broth',
    '',
    'Extras',
    '- Herbal tea or water bottles',
    '- Protein powder if needed',
    '',
    focusSummary,
    goalSummary,
  ].join('\n');
}

async function generateTextWithFallback(promptText) {
  const openai = createOpenAIClient();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: promptText }],
    });

    const content = completion?.choices?.[0]?.message?.content;
    return Array.isArray(content)
      ? content.map((part) => part?.text || '').join('')
      : content;
  } catch (error) {
    console.error('AI generation failed:', error?.message || error);
    throw error;
  }
}

app.post('/api/generate-grocery', async (req, res) => {
  try {
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

    let textResponse;

    try {
      textResponse = await generateTextWithFallback(promptText);
      return res.json({ text: textResponse, source: 'ai' });
    } catch (error) {
      console.warn('Falling back to built-in grocery list due to AI error:', error?.message || error);
      return res.json({ text: buildFallbackGroceryText(nutrients, goals), source: 'fallback' });
    }
  } catch (error) {
    console.error('OpenRouter API Error:', error?.response?.data || error?.message || error);
    const message = error?.message || 'Failed to communicate with AI server';
    return res.status(500).json({
      error: message,
      details: error?.response?.data?.error?.message || error?.response?.data?.message || null,
    });
  }
});

app.post('/api/generate-workout', async (req, res) => {
  try {
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

    const textResponse = await generateTextWithFallback(promptText);

    return res.json({ text: textResponse, source: 'ai' });
  } catch (error) {
    console.error('Workout API Error:', error?.response?.data || error?.message || error);
    const message = error?.message || 'Failed to generate workout';
    return res.status(500).json({
      error: message,
      details: error?.response?.data?.error?.message || error?.response?.data?.message || null,
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

const isDirectRun = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

export default app;