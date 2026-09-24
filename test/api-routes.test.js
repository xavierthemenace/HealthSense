import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';

process.env.NODE_ENV = 'test';
delete process.env.OPENROUTER_API_KEY;

const { default: app } = await import('../api/index.js');
const server = http.createServer(app);
server.listen(0);
await once(server, 'listening');
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const realFetch = globalThis.fetch;

test.after(() => server.close());

function postJson(path, body) {
  return realFetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function allItems(plan) {
  return plan.sections.flatMap((section) => section.items);
}

function mockOpenRouter(content, t) {
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith('https://openrouter.ai/')) {
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return realFetch(url, init);
  };
  process.env.OPENROUTER_API_KEY = 'test-key';
  t.after(() => {
    globalThis.fetch = realFetch;
    delete process.env.OPENROUTER_API_KEY;
  });
}

test('plan routes report a clear error when no AI key is configured', async () => {
  const response = await postJson('/api/generate-grocery', { nutrients: 'protein, iron', goals: 'build muscle' });

  assert.equal(response.status, 500);
  const data = await response.json();
  assert.match(data.error, /OPENROUTER_API_KEY/);
});

test('workout route rejects an empty description', async () => {
  const response = await postJson('/api/generate-workout', { primaryGoal: 'Weight Loss' });
  assert.equal(response.status, 400);
});

test('AI plans keep only items that include a reason', async (t) => {
  mockOpenRouter('```json\n' + JSON.stringify({
    summary: 'Lean protein week',
    sections: [{
      title: 'Proteins',
      items: [
        { name: 'Chicken breast', detail: '2 lb', why: 'High protein for your muscle goal.' },
        { name: 'Mystery item', detail: '1' },
      ],
    }],
  }) + '\n```', t);

  const response = await postJson('/api/generate-grocery', { nutrients: 'protein', goals: 'build muscle' });
  const data = await response.json();

  assert.equal(data.source, 'ai');
  assert.deepEqual(allItems(data).map((item) => item.name), ['Chicken breast']);
  assert.match(data.text, /Why: High protein/);
});

test('AI answers without reasons are rejected instead of shown', async (t) => {
  mockOpenRouter('Here is your workout: squats, push-ups, planks.', t);

  const response = await postJson('/api/generate-workout', { primaryGoal: 'Weight Loss', description: '20 min bodyweight' });
  const data = await response.json();

  assert.equal(response.status, 502);
  assert.match(data.error, /reasons/);
});

test('a malformed AI response body returns a clear error instead of crashing', async (t) => {
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith('https://openrouter.ai/')) {
      return new Response('   \n', { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return realFetch(url, init);
  };
  process.env.OPENROUTER_API_KEY = 'test-key';
  t.after(() => {
    globalThis.fetch = realFetch;
    delete process.env.OPENROUTER_API_KEY;
  });

  const response = await postJson('/api/generate-grocery', { nutrients: 'protein', goals: 'build muscle' });
  assert.equal(response.status, 502);
});

test('scan route explains how the food and nutrition were estimated', async () => {
  const form = new FormData();
  form.append('image', new Blob(['fake'], { type: 'image/jpeg' }), 'lunch-salad.jpg');
  const response = await realFetch(`${baseUrl}/api/scan-food`, { method: 'POST', body: form });

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.food, 'Greek Salad');
  assert.match(data.why.food, /file name contains "salad"/);
  assert.ok(data.why.nutrition);
});
