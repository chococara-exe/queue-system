interface QueueData {
  letter: string;
  currentNumber: number;
  totalNumber: number;
  customer: any;
  nextCustomer: any;
}

interface StoreCache {
  [storeName: string]: {
    queues: QueueData[];
    lastUpdated: number;
    isUpdating: boolean;
  };
}

class DataCache {
  private cache: StoreCache = {};
  private updateInterval: NodeJS.Timeout | null = null;
  private updatePromises: Map<string, Promise<void>> = new Map(); // ✅ Track update promises
  private readonly CACHE_DURATION = 20000;
  private readonly UPDATE_INTERVAL = 15000;

  constructor() {
    this.startPeriodicUpdates();
  }

  async getQueueData(storeName: string): Promise<QueueData[]> {
    const now = Date.now();
    const storeCache = this.cache[storeName];

    // Return cached data if it's fresh
    if (storeCache && (now - storeCache.lastUpdated < this.CACHE_DURATION)) {
      console.log(`📦 Returning cached data for ${storeName}`);
      return storeCache.queues;
    }

    // ✅ If update is in progress, wait for it
    if (this.updatePromises.has(storeName)) {
      console.log(`⏳ Waiting for ongoing update for ${storeName}`);
      await this.updatePromises.get(storeName);
      return this.cache[storeName]?.queues || [];
    }

    // Update cache if needed
    await this.updateStoreData(storeName);
    return this.cache[storeName]?.queues || [];
  }

  private async updateStoreData(storeName: string): Promise<void> {
    // ✅ Check if already updating using promise map
    if (this.updatePromises.has(storeName)) {
      return this.updatePromises.get(storeName);
    }

    // ✅ Create and store update promise
    const updatePromise = this.performUpdate(storeName);
    this.updatePromises.set(storeName, updatePromise);

    try {
      await updatePromise;
    } finally {
      // ✅ Clean up promise when done
      this.updatePromises.delete(storeName);
    }
  }

  private async performUpdate(storeName: string): Promise<void> {
    try {
      if (!this.cache[storeName]) {
        this.cache[storeName] = { queues: [], lastUpdated: 0, isUpdating: false };
      }
      
      this.cache[storeName].isUpdating = true;
      console.log(`🔄 Updating cache for ${storeName}`);

      const queues = await this.fetchFromDatabase(storeName);
      
      this.cache[storeName] = {
        queues,
        lastUpdated: Date.now(),
        isUpdating: false
      };

      console.log(`✅ Cache updated for ${storeName} - ${queues.length} queues`);
    } catch (error) {
      console.error(`❌ Failed to update cache for ${storeName}:`, error);
      if (this.cache[storeName]) {
        this.cache[storeName].isUpdating = false;
      }
      throw error; // ✅ Re-throw to handle in caller
    }
  }

  // ✅ Add error handling to database fetch
  private async fetchFromDatabase(storeName: string): Promise<QueueData[]> {
    try {
      const { getOrCreateConnection } = await import('./connectionManager');
      const { CounterSchema } = await import('@/models/Counter');
      const { CustomerSchema } = await import('@/models/Customer');

      const conn = await getOrCreateConnection(storeName);
      const Counter = conn.model('Counter', CounterSchema);
      const Customer = conn.model('Customer', CustomerSchema);

      const queueLetters = ['A', 'B', 'C', 'D'];
      const queueData = await Promise.all(
        queueLetters.map(async (letter) => {
          try {
            const [curQueue, totalQueue] = await Promise.all([
              Counter.findOne({ name: `curQueue${letter}` }),
              Counter.findOne({ name: `queue${letter}` })
            ]);

            let customer = null;
            let nextCustomer = null;

            if (curQueue?.value) {
              [customer, nextCustomer] = await Promise.all([
                Customer.findOne({ 
                  "queue.letter": letter, 
                  "queue.value": curQueue.value 
                }),
                Customer.findOne({ 
                  "queue.letter": letter, 
                  "queue.value": curQueue.value + 1 
                })
              ]);
            }

            return {
              letter,
              currentNumber: curQueue?.value || 0,
              totalNumber: totalQueue?.value || 0,
              customer,
              nextCustomer
            };
          } catch (error) {
            console.error(`Error fetching queue ${letter}:`, error);
            return {
              letter,
              currentNumber: 0,
              totalNumber: 0,
              customer: null,
              nextCustomer: null
            };
          }
        })
      );

      return queueData;
    } catch (error) {
      console.error(`Database error for ${storeName}:`, error);
      // ✅ Return default data instead of empty array
      return ['A', 'B', 'C', 'D'].map(letter => ({
        letter,
        currentNumber: 0,
        totalNumber: 0,
        customer: null,
        nextCustomer: null
      }));
    }
  }

  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(async () => {
      const storeNames = Object.keys(this.cache);
      console.log(`🔄 Periodic update for ${storeNames.length} stores:`, storeNames);
      
      // ✅ Update stores sequentially to avoid overwhelming database
      for (const store of storeNames) {
        try {
          await this.updateStoreData(store);
          // ✅ Small delay between store updates
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Periodic update failed for ${store}:`, error);
        }
      }
    }, this.UPDATE_INTERVAL);
  }

  public stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public clearCache(storeName?: string): void {
    if (storeName) {
      delete this.cache[storeName];
    } else {
      this.cache = {};
    }
  }

  public getCacheStats() {
    return Object.entries(this.cache).map(([store, data]) => ({
      store,
      lastUpdated: new Date(data.lastUpdated).toLocaleTimeString(),
      isUpdating: data.isUpdating,
      queueCount: data.queues.length
    }));
  }
}

// Singleton instance
export const dataCache = new DataCache();