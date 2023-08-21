'use strict';

// // To disable all workbox logging during development, you can set self.__WB_DISABLE_DEV_LOGS to true
// // https://developers.google.com/web/tools/workbox/guides/configure-workbox#disable_logging
// //
// // self.__WB_DISABLE_DEV_LOGS = true

// const util = require('./util');

// util();

// // listen to message event from window
// self.addEventListener('message', event => {
//   // HOW TO TEST THIS?
//   // Run this in your browser console:
//   //     window.navigator.serviceWorker.controller.postMessage({command: 'log', message: 'hello world'})
//   // OR use next-pwa injected workbox object
//   //     window.workbox.messageSW({command: 'log', message: 'hello world'})
//   console.log(event.data);
// });

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  setInterval(() => {
    const title = 'Hello!';
    const timestamp = new Date().toLocaleTimeString(); // Current time
    const options = {
      body: `Current time: ${timestamp}`,
    };
    self.registration.showNotification(title, options);
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
});

self.addEventListener('push', event => {
  const title = 'Hello wooooooorld :)';
  const options = {
    body: event.data.text(),
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
