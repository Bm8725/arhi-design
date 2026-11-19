// public/sw.js
/*
PWA js
author: BM26 marius_service@yahoo.com
updateȘ 19-11-26
*/

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
  
      return new Response("You are offline, PWA is installed !");
    })
  );
});
