import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';

test('grocery route returns a usable fallback response when no AI key is configured', async () => {
  process.env.NODE_ENV = 'test';
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENAI_API_KEY;

  const { default: app } = await import('../api/generate-grocery.js');
  const server = http.createServer(app);
  server.listen(0);
  await once(server, 'listening');

  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/generate-grocery`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nutrients: 'protein, iron', goals: 'build muscle' }),
    });

    assert.equal(response.status, 200);
    const data = await response.json();
    assert.ok(data.text, 'expected a generated response');
    assert.match(data.text, /Protein|Produce|Pantry/i);
    assert.equal(data.source, 'fallback');
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});
