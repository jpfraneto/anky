import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:youremail@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async (req, res) => {
  if (req.method === 'POST') {
    const subscription = req.body.subscription;
    const payload = req.body.payload;

    try {
      await webPush.sendNotification(subscription, payload);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send notification.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
