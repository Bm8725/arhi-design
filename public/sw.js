// Service Worker minimalist pentru a activa promptul de instalare PWA
self.addEventListener('install', () => {
  console.log('Proarh.4d PWA Service Worker instaled.');
});

self.addEventListener('fetch', (event) => {
  // Lasă cererile să treacă normal prin rețea
});
