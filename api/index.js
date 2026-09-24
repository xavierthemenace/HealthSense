import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_TIMEOUT_MS = 60000;
const AI_ATTEMPTS = 2;
const MAX_TEXT = 600;

const PLAN_FORMAT = `Respond with JSON only (no markdown, no prose outside the JSON) in exactly this shape:
{"summary": "one sentence overview", "sections": [{"title": "section name", "items": [{"name": "item", "detail": "amount or sets/reps", "why": "reason"}]}]}
Every item MUST include "why": one or two sentences explaining why THIS item is included for THIS user, tied to their specific goals, level, equipment, time, or target nutrients. Never give a generic reason.`;

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: Boolean(process.env.OPENROUTER_API_KEY) });
});

class PlanError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function clean(value) {
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);
}

function parseModelJson(content) {
  const text = Array.isArray(content)
    ? content.map((part) => part?.text || '').join('')
    : String(content || '');
  const unfenced = text.replace(/```(?:json)?/gi, '');
  const start = unfenced.indexOf('{');
  const end = unfenced.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(unfenced.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizePlan(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.sections)) return null;

  const sections = raw.sections
    .map((section) => ({
      title: clean(section?.title) || 'Plan',
      items: (Array.isArray(section?.items) ? section.items : [])
        .map((item) => ({ name: clean(item?.name), detail: clean(item?.detail), why: clean(item?.why) }))
        .filter((item) => item.name && item.why),
    }))
    .filter((section) => section.items.length > 0);

  if (sections.length === 0) return null;
  return { summary: clean(raw.summary), sections };
}

function planToText(plan) {
  const lines = [];
  if (plan.summary) lines.push(plan.summary, '');
  for (const section of plan.sections) {
    lines.push(`## ${section.title}`);
    for (const item of section.items) {
      lines.push(`- ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
      lines.push(`  Why: ${item.why}`);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

async function generatePlan({ systemPrompt, userPrompt }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new PlanError(500, 'OPENROUTER_API_KEY is not configured on the server.');
  }

  let lastError;
  for (let attempt = 0; attempt < AI_ATTEMPTS; attempt++) {
    try {
      const plan = await requestModelPlan({ apiKey, systemPrompt, userPrompt });
      return { ...plan, source: 'ai', text: planToText(plan) };
    } catch (error) {
      lastError = error;
      if (error.status === 504) break;
    }
  }
  throw lastError;
}

async function requestModelPlan({ apiKey, systemPrompt, userPrompt }) {
  let response;
  let body;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://xavierthemenace.github.io/HealthSense/',
        'X-Title': 'HealthSense',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${systemPrompt}\n\n${PLAN_FORMAT}` },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    body = await response.text();
  } catch (error) {
    console.error('OpenRouter request failed:', error?.message || error);
    if (error?.name === 'TimeoutError') {
      throw new PlanError(504, 'The AI took too long to respond. Please try again.');
    }
    throw new PlanError(502, 'The AI service could not be reached. Please try again.');
  }

  if (!response.ok) {
    console.error(`OpenRouter returned ${response.status}:`, body.slice(0, 300));
    throw new PlanError(502, `The AI service returned an error (${response.status}). Please try again.`);
  }

  let data = null;
  try {
    data = JSON.parse(body);
  } catch {
    data = null;
  }

  const plan = normalizePlan(parseModelJson(data?.choices?.[0]?.message?.content));
  if (!plan) {
    console.error('Unusable AI response:', body.slice(0, 300));
    throw new PlanError(502, "The AI didn't return a plan with reasons. Please try again.");
  }
  return plan;
}

function sendPlanError(res, error) {
  if (error instanceof PlanError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error('Plan route error:', error);
  return res.status(500).json({ error: 'Internal server error' });
}

app.post('/api/generate-grocery', async (req, res) => {
  const { nutrients, goals } = req.body || {};
  if (!nutrients || !goals) {
    return res.status(400).json({ error: 'Nutrients and goals are required fields.' });
  }

  try {
    const plan = await generatePlan({
      systemPrompt: 'You are an expert nutritionist. Build a practical one-week grocery list. Use sections such as Proteins, Complex Carbs, Healthy Fats, Produce, Pantry and Extras. "detail" is a shopping quantity. Each "why" must name the target nutrient or goal the item serves and roughly how much of that nutrient it provides.',
      userPrompt: `Target nutrients: ${nutrients}\nGoals: ${goals}`,
    });
    return res.json(plan);
  } catch (error) {
    return sendPlanError(res, error);
  }
});

app.post('/api/generate-workout', async (req, res) => {
  const body = req.body || {};
  const goal = body.primaryGoal || body.fitnessLevel || 'General Fitness';
  const description = body.description || body.goals || '';
  if (!description) {
    return res.status(400).json({ error: 'A workout description is required.' });
  }

  try {
    const plan = await generatePlan({
      systemPrompt: 'You are a certified strength and conditioning coach. Build one safe, practical workout session with sections "Warm-up", "Main workout" and "Cool-down". "detail" gives sets/reps or time plus a short form tip. Each "why" must explain how the exercise serves the user\'s goal and respects their stated time, equipment and any injuries.',
      userPrompt: `Primary goal: ${goal}\nWhat they asked for: ${description}`,
    });
    return res.json(plan);
  } catch (error) {
    return sendPlanError(res, error);
  }
});

const SCAN_FOODS = [
  { keyword: 'salad', food: 'Greek Salad', nutrition: { calories: 320, protein: 14, carbs: 26, fat: 16 } },
  { keyword: 'sandwich', food: 'Turkey Sandwich', nutrition: { calories: 460, protein: 28, carbs: 42, fat: 17 } },
  { keyword: 'pizza', food: 'Margherita Pizza', nutrition: { calories: 620, protein: 24, carbs: 74, fat: 25 } },
  { keyword: 'smoothie', food: 'Berry Smoothie', nutrition: { calories: 290, protein: 16, carbs: 38, fat: 8 } },
  { keyword: 'burger', food: 'Chicken Burger', nutrition: { calories: 540, protein: 34, carbs: 41, fat: 22 } },
  { keyword: 'pasta', food: 'Pasta Bowl', nutrition: { calories: 560, protein: 23, carbs: 72, fat: 20 } },
  { keyword: 'bowl', food: 'Protein Bowl', nutrition: { calories: 500, protein: 30, carbs: 48, fat: 19 } },
];
const DEFAULT_SCAN = { food: 'Mixed Plate', nutrition: { calories: 420, protein: 22, carbs: 45, fat: 18 } };

app.post('/api/scan-food', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }

  const name = (req.file.originalname || '').toLowerCase();
  const match = SCAN_FOODS.find((entry) => name.includes(entry.keyword));
  const result = match || DEFAULT_SCAN;

  return res.json({
    food: result.food,
    confidence: match ? 0.86 : 0.4,
    nutrition: { ...result.nutrition },
    why: {
      food: match
        ? `Identified as ${result.food} because the image's file name contains "${match.keyword}". The scanner does not analyze the photo itself yet, so check the result if it looks wrong.`
        : 'No known food keyword (e.g. salad, pizza, pasta) was found in the file name, so this falls back to a generic mixed plate. The scanner does not analyze the photo itself yet.',
      nutrition: `Typical values for one standard serving of ${result.food}; your portion size and ingredients will change the real numbers.`,
    },
  });
});

const isDirectRun = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  const { default: dotenv } = await import('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || '127.0.0.1';
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

export default app;
