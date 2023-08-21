import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:youremail@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async (req, res) => {
  if (req.method === 'POST') {
    const subscription = req.body;

    // TODO: Save this subscription object in your database

    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
