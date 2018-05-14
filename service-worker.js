//The name of the cache
var cacheName = 'weatherPWA-step-6-1';
//All the files/URLs associated with our webapp, we include '/' because
//index is also the root
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/images/pieology.jpeg',
  '/images/saladsup.jpg',
  'images/icons/SizzlWSq256.png',
  '/images/searchw.png',
];
//Keeps track of the most updated data in the chache
var dataCacheName = 'weatherData-v1';

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  //function install Waits until the cache is open and files are chached
  //in other words, installs service worker in the cache
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});
self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  //Wait until tells the browser not to terminate the serviceWorker until
  //the promise passed in is complete
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        //If there is a new chache and new chache data, then we remove the old
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  //allows you to activate the serviceWorker faster in the offline case
  return self.clients.claim();
});


//Handles requests made by PWA through the service Worker
self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  //if it finds that the request has the API url, then puts the api data in the
  //cache
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          //puts the key value pair of URL and a clone of the data in the cache
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
