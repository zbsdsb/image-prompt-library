/* Offline app shell only. Never cache private /api/ or /media/ responses. */
const CACHE_NAME = 'image-prompt-library-static-v1';
const scope = new URL(self.registration.scope);
const shellUrl = scope.href;

function staticAssetPath(relative) {
  return relative.startsWith('assets/') || relative.startsWith('icons/')
    || relative === 'manifest.webmanifest' || relative.startsWith('demo-data/');
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(shellUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('App shell unavailable');
    const html = await response.clone().text();
    await cache.put(shellUrl, response);
    const links = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map(match => new URL(match[1], scope))
      .filter(url => url.origin === scope.origin && url.pathname.startsWith(scope.pathname))
      .filter(url => staticAssetPath(url.pathname.slice(scope.pathname.length)))
      .map(url => url.href);
    await cache.addAll([...new Set([...links, new URL('manifest.webmanifest', scope).href])]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('image-prompt-library-static-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const relative = url.pathname.slice(scope.pathname.length);
  if (relative === 'api' || relative.startsWith('api/') || relative === 'media' || relative.startsWith('media/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(shellUrl, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(shellUrl)) || Response.error();
      }
    })());
    return;
  }
  if (!staticAssetPath(relative)) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
