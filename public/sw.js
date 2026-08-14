const API_ORIGIN = 'https://health-sense.vercel.app';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (!url.pathname.includes('/api/')) return;

  const apiPath = url.pathname.substring(url.pathname.indexOf('/api/'));
  const target = `${API_ORIGIN}${apiPath}${url.search}`;

  event.respondWith(
    fetch(new Request(target, event.request)).catch(error =>
      new Response(JSON.stringify({ error: 'HealthSense API backend is unavailable.', details: error?.message || 'Unknown proxy error' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    )
  );
});
