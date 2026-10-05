// public/sw.js

self.addEventListener('install', (event) => {
  console.log('Proarh.4d PWA Service Worker installed.');
  // Forțează activarea imediată a service worker-ului nou
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  console.log('Proarh.4d PWA Service Worker activated.');
});

// IMPORTANT: Fetch-ul trebuie să returneze activ răspunsul din rețea, nu doar să fie gol
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Opțional: Aici s-ar pune fallback-ul offline, dar e suficient să returneze fetch-ul normal
      return new Response("Ești offline, dar PWA-ul este instalat!");
    })
  );
});
