// 'use strict';

// // const apiRoute = "http://localhost:3000"
// // Replace your const apiRoute line with this
// const apiRoute =
//   self.location.hostname === 'localhost'
//     ? 'http://localhost:3000'
//     : 'https://api.anky.lat';

// self.addEventListener('install', event => {
//   console.log('inside the install');
//   self.skipWaiting();
// });

// self.addEventListener('message', event => {
//   console.log('IN HERE, THE SERVICE WORKER GOT A MESSAGE', event);
//   self.clients.matchAll().then(clients => {
//     clients.forEach(client => {
//       client.postMessage({ type: 'ANKY_LOADING' });
//     });
//   });
//   if (event.data && event.data.type === 'FETCH_IMAGE') {
//     console.log('INSIDE HERE AGAIN.');
//     const { imagineApiId, characterName, characterBackstory } = event.data;

//     const intervalId = setInterval(async () => {
//       console.log('fetching for the image once again');
//       try {
//         self.registration.showNotification('Fetching for your anky', {
//           body: 'We are looking for your anky on the backend',
//         });
//         const response = await fetch(
//           `${apiRoute}/ai/check-image/${imagineApiId}`
//         );
//         const data = await response.json();
//         console.log('After this, the data is: ', data);
//         if (data.status === 'completed') {
//           clearInterval(intervalId);
//           console.log(
//             'The anky avatar is ready!, time to choose which one of the four images.'
//           );

//           const upscaledAnkyImages = data.upscaled.map(
//             upscaledId => `https://88minutes.xyz/assets/${upscaledId}.png`
//           );
//           console.log('the upscaled images are: ', upscaledAnkyImages);

//           self.registration.showNotification('Anky Avatar Ready!', {
//             body: `Your Anky: ${characterName} is ready to be chosen.`,
//           });
//           self.clients.matchAll().then(clients => {
//             clients.forEach(client =>
//               client.postMessage({
//                 type: 'ANKY_IMAGES_READY',
//                 images: upscaledAnkyImages,
//               })
//             );
//           });
//           self.clients.matchAll().then(clients => {
//             clients.forEach(client => {
//               client.postMessage({ type: 'ANKY_READY' });
//             });
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching image:', error);
//         self.clients.matchAll().then(clients => {
//           clients.forEach(client => {
//             client.postMessage({
//               type: 'FETCH_ERROR',
//               error: 'Failed to fetch image',
//             });
//           });
//         });
//       }
//     }, 60 * 1000); // every minute
//   }
// });

// self.addEventListener('push', event => {
//   console.log('IN HERE, A NOT WILL BE SENT:', event.data);
//   const data = event.data.json(); // Assuming you're sending JSON payload from the server.
//   const title = data.title || 'Default title';
//   const options = {
//     body: data.body || 'Default body message',
//     // You can add more options like icons, actions, etc.
//   };
//   event.waitUntil(self.registration.showNotification(title, options));
// });

// self.addEventListener('notificationclick', event => {
//   event.notification.close();
//   console.log('Hello world');
//   event.waitUntil(
//     clients.matchAll({ type: 'window' }).then(clientList => {
//       if (clientList.length) {
//         let client = clientList[0];
//         for (let i = 0; i < clientList.length; i++) {
//           if (clientList[i].focused) {
//             client = clientList[i];
//           }
//         }
//         if (client !== window) {
//           client.focus();
//         }
//       }
//     })
//   );
// });

// // Add this to the top of your existing service-worker.js
// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open('my-cache').then(cache => {
//       return cache.addAll([
//         '/',
//         '/index.html',
//         '/css/style.css',
//         '/js/script.js',
//       ]);
//     })
//   );
// });

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(response => {
//       return response || fetch(event.request);
//     })
//   );
// });
