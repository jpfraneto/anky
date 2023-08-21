import React from 'react';

const Notifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  useEffect(() => {
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      subscribeToPushManager();
    }
  }, []);

  const askForNotificationsPermission = () => {
    if (Notification.permission === 'denied') {
      alert(
        'Notifications have been denied. Please enable them from your browser settings.'
      );
      return;
    }
    Notification.requestPermission().then(permission => {
      console.log('IN HEREAS', permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        console.log('Notification permission granted.');
        subscribeToPushManager();
      } else {
        console.error('Unable to get permission to notify.');
      }
    });
  };
  return (
    <div className='p-2'>
      {notificationsEnabled && (
        <div>
          <h2 className='text-2xl text-center'>Notifications</h2>
          <p>Thanks for enabling your notifications.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
