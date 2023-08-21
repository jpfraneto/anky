'use strict';

self.addEventListener('install', event => {
  console.log('inside the install');
  self.skipWaiting();
});

self.addEventListener('activate', async event => {
  try {
    console.log('inside the activate here.');
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        'BCKze16TV0lPlvhx4wTRKGNAgOCGnkEvG3WyW84zoiVPdQAHLMVxbmesEFyK3a9INd8yaC3KXxa2RdRv-Dl9FwI',
    });
    console.log('Subscription:', subscription);

    const response = await fetch(`http://localhost:3000/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe the user');
    }
    const data = await response.json();
    console.log('Successfully subscribed the user:', data);
  } catch (error) {
    console.error('Error subscribing the user:', error);
  }
});

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
