'use strict';

// const apiRoute = "http://localhost:3000"
const apiRoute = 'https://api.anky.lat';

self.addEventListener('install', event => {
  console.log('inside the install');
  self.skipWaiting();
});

self.addEventListener('message', event => {
  console.log('IN HERE, THE SERVICE WORKER GOT A MESSAGE', event);
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'ANKY_LOADING' });
    });
  });
  if (event.data && event.data.type === 'FETCH_IMAGE') {
    console.log('INSIDE HERE AGAIN.');
    const { imagineApiId, characterName, characterBackstory } = event.data;

    const intervalId = setInterval(async () => {
      console.log('fetching for the image once again');
      try {
        self.registration.showNotification('Fetching for your anky', {
          body: 'We are looking for your anky on the backend',
        });
        const response = await fetch(`${apiRoute}/check-image/${imagineApiId}`);
        const data = await response.json();
        console.log('After this, the data is: ', data);
        if (data.status === 'completed') {
          clearInterval(intervalId);
          console.log(
            'The anky avatar is ready!, time to choose which one of the four images.'
          );

          const upscaledAnkyImages = data.upscaled.map(
            upscaledId => `https://88minutes.xyz/assets/${upscaledId}.png`
          );
          console.log('the upscaled images are: ', upscaledAnkyImages);

          self.registration.showNotification('Anky Avatar Ready!', {
            body: `Your Anky: ${characterName} is ready to be chosen.`,
          });
          self.clients.matchAll().then(clients => {
            clients.forEach(client =>
              client.postMessage({
                type: 'ANKY_IMAGES_READY',
                images: upscaledAnkyImages,
              })
            );
          });
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({ type: 'ANKY_READY' });
            });
          });
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    }, 60 * 1000); // every minute
  }
});

// self.addEventListener('activate', async event => {
//   try {
//     console.log('inside the activate here.');
//     const registration = await navigator.serviceWorker.ready;
//     const subscription = await registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey:
//         'BCKze16TV0lPlvhx4wTRKGNAgOCGnkEvG3WyW84zoiVPdQAHLMVxbmesEFyK3a9INd8yaC3KXxa2RdRv-Dl9FwI',
//     });
//     console.log('Subscription:', subscription);

//     const response = await fetch(`http://pwa.anky.lat/subscribe`, {
//       method: 'POST',
//       body: JSON.stringify(subscription),
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to subscribe the user');
//     }
//     const data = await response.json();
//     console.log('Successfully subscribed the user:', data);
//   } catch (error) {
//     console.error('Error subscribing the user:', error);
//   }
// });

self.addEventListener('push', event => {
  console.log('IN HERE, A NOT WILL BE SENT:', event.data);
  const data = event.data.json(); // Assuming you're sending JSON payload from the server.
  const title = data.title || 'Default title';
  const options = {
    body: data.body || 'Default body message',
    // You can add more options like icons, actions, etc.
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  console.log('Hello world');
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        if (client !== window) {
          client.focus();
        }
      }
    })
  );
});
