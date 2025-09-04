import { NextApiRequest, NextApiResponse } from 'next';
import { dataCache } from '@/lib/dataCache';

// ✅ Add request debouncing
const lastRequestTime = new Map<string, number>();
const DEBOUNCE_TIME = 10000; // 10 second

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { store } = req.query;

    if (!store) {
      return res.status(400).json({ message: 'Store parameter required' });
    }

    const storeKey = store as string;
    const now = Date.now();
    const lastRequest = lastRequestTime.get(storeKey) || 0;

    // ✅ Debounce rapid requests
    if (now - lastRequest < DEBOUNCE_TIME) {
      const cachedData = await dataCache.getQueueData(storeKey);
      return res.status(200).json({
        store: storeKey,
        queues: cachedData,
        cached: true,
        debounced: true,
        timestamp: new Date().toISOString()
      });
    }

    lastRequestTime.set(storeKey, now);

    if (req.method === 'GET') {
      const queueData = await dataCache.getQueueData(storeKey);
      
      res.status(200).json({
        store: storeKey,
        queues: queueData,
        cached: true,
        timestamp: new Date().toISOString()
      });

    } else if (req.method === 'DELETE') {
      dataCache.clearCache(storeKey);
      res.status(200).json({ message: `Cache cleared for ${storeKey}` });

    } else if (req.method === 'POST') {
      // Force update
      dataCache.clearCache(storeKey);
      const queueData = await dataCache.getQueueData(storeKey);
      
      res.status(200).json({
        store: storeKey,
        queues: queueData,
        message: 'Cache force updated'
      });

    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Cache API error:', error);
    res.status(500).json({ 
      message: 'Cache API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}