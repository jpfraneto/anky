// pages/api/writings.js

import prisma from '../../lib/prismaClient.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const writings = await prisma.writing.findMany({});
      console.log('In here, the writings are: ', writings);
      return res.status(200).json(writings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Unable to fetch writings' });
    }
  } else {
    // Handle any other HTTP method
    return res.status(405).end();
  }
}
