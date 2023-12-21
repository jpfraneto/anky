import React, { useState, useEffect } from "react";

const Notifications = () => {
  // const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  // useEffect(() => {
  //   if (Notification.permission === 'granted') {
  //     setNotificationsEnabled(true);
  //     subscribeToPushManager();
  //   }
  // }, []);

  // const askForNotificationsPermission = () => {
  //   if (Notification.permission === 'denied') {
  //     alert(
  //       'Notifications have been denied. Please enable them from your browser settings.'
  //     );
  //     return;
  //   }
  //   Notification.requestPermission().then(permission => {
  //     console.log('IN HEREAS', permission);
  //     if (permission === 'granted') {
  //       setNotificationsEnabled(true);
  //       console.log('Notification permission granted.');
  //       subscribeToPushManager();
  //     } else {
  //       console.error('Unable to get permission to notify.');
  //     }
  //   });
  // };

  // function urlBase64ToUint8Array(base64String) {
  //   const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  //   const base64 = (base64String + padding)
  //     .replace(/\-/g, '+')
  //     .replace(/_/g, '/');

  //   const rawData = window.atob(base64);
  //   const outputArray = new Uint8Array(rawData.length);

  //   for (let i = 0; i < rawData.length; ++i) {
  //     outputArray[i] = rawData.charCodeAt(i);
  //   }
  //   return outputArray;
  // }

  // const subscribeToPushManager = () => {
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker.ready.then(registration => {
  //       registration.pushManager
  //         .subscribe({
  //           userVisibleOnly: true,
  //           applicationServerKey: urlBase64ToUint8Array(
  //             process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  //           ),
  //         })
  //         .then(pushSubscription => {
  //           localStorage.setItem(
  //             'pushSubscription',
  //             JSON.stringify(pushSubscription)
  //           );
  //         })
  //         .catch(error => {
  //           console.error('Could not subscribe to push', error);
  //         });
  //     });
  //   }
  // }

  return (
    <div className="">
      <h2 className="text-center text-xl ">notifications</h2>

      {notificationsEnabled && (
        <div>
          <p className="mt-48 text-center">
            I&apos;ll be as simple as I can with this!
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
