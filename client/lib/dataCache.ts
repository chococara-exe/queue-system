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
  private updatePromises: Map<string, Promise<void>> = new Map();
  private readonly CACHE_DURATION = 30000; // ✅ Increased to 30 seconds
  private readonly UPDATE_INTERVAL = 15000;
  private readonly MIN_UPDATE_INTERVAL = 5000; // ✅ Minimum time between updates
  private isPeriodicUpdateRunning: boolean = false;

  constructor() {
    this.startPeriodicUpdates();
  }

  async getQueueData(storeName: string): Promise<QueueData[]> {
    const now = Date.now();
    const storeCache = this.cache[storeName];

    // ✅ Always return cached data if it exists and is reasonably fresh
    if (storeCache && storeCache.queues.length > 0) {
      const age = now - storeCache.lastUpdated;
      
      // Return cached data if it's fresh OR if an update is in progress
      if (age < this.CACHE_DURATION || this.updatePromises.has(storeName)) {
        console.log(`📦 Returning cached data for ${storeName} (age: ${Math.round(age/1000)}s)`);
        return storeCache.queues;
      }

      // ✅ Only update if enough time has passed
      if (age < this.MIN_UPDATE_INTERVAL) {
        console.log(`⏰ Too soon to update ${storeName}, returning cached data`);
        return storeCache.queues;
      }
    }

    // ✅ If update is in progress, return existing cached data (don't wait)
    if (this.updatePromises.has(storeName)) {
      console.log(`⏳ Update in progress for ${storeName}, returning cached data`);
      return this.cache[storeName]?.queues || [];
    }

    // Update cache only if really needed
    console.log(`🆕 Initial cache load for ${storeName}`);
    await this.updateStoreData(storeName);
    return this.cache[storeName]?.queues || [];
  }

  private async updateStoreData(storeName: string): Promise<void> {
    // ✅ Check if update is already in progress
    if (this.updatePromises.has(storeName)) {
      console.log(`⏭️ Update already in progress for ${storeName}, skipping`);
      return this.updatePromises.get(storeName);
    }

    // ✅ Check if update is needed based on time
    const now = Date.now();
    const storeCache = this.cache[storeName];
    
    if (storeCache && (now - storeCache.lastUpdated < this.MIN_UPDATE_INTERVAL)) {
      console.log(`⏭️ Skipping update for ${storeName}, too recent (${Math.round((now - storeCache.lastUpdated)/1000)}s ago)`);
      return;
    }

    // Create and store update promise
    const updatePromise = this.performUpdate(storeName);
    this.updatePromises.set(storeName, updatePromise);

    try {
      await updatePromise;
    } finally {
      this.updatePromises.delete(storeName);
    }
  }

  private async performUpdate(storeName: string): Promise<void> {
    try {
      if (!this.cache[storeName]) {
        this.cache[storeName] = { queues: [], lastUpdated: 0, isUpdating: false };
      }
      
      this.cache[storeName].isUpdating = true;
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔄 Actually updating cache for ${storeName} at ${timestamp}`);

      const queues = await this.fetchFromDatabase(storeName);
      
      this.cache[storeName] = {
        queues,
        lastUpdated: Date.now(),
        isUpdating: false
      };

      console.log(`✅ Cache updated for ${storeName} - ${queues.length} queues at ${timestamp}`);
    } catch (error) {
      console.error(`❌ Failed to update cache for ${storeName}:`, error);
      if (this.cache[storeName]) {
        this.cache[storeName].isUpdating = false;
      }
      throw error;
    }
  }

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

            const currentNumber = curQueue?.value || 0;
            const totalNumber = totalQueue?.value || 0;

            let customer = null;
            let nextCustomer = null;

            // ✅ Fix: Always try to find next customer, regardless of current number
            if (currentNumber > 0) {
              // Find current customer
              customer = await Customer.findOne({
                "queue.letter": letter,
                "queue.value": currentNumber
              });
            }

            // ✅ Always look for next customer (current + 1)
            const nextNumber = currentNumber + 1;
            if (nextNumber <= totalNumber) {
              nextCustomer = await Customer.findOne({
                "queue.letter": letter,
                "queue.value": nextNumber
              });
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
      return ['A', 'B', 'C', 'D'].map(letter => ({
        letter,
        currentNumber: 0,
        totalNumber: 0,
        customer: null,
        nextCustomer: null
      }));
    }
  }

// ✅ Fixed periodic updates with better protection against multiple instances
  private startPeriodicUpdates(): void {
    // ✅ Prevent multiple periodic update timers
    if (this.updateInterval || this.isPeriodicUpdateRunning) {
      console.log('⚠️ Periodic updates already running, skipping start');
      return;
    }

    console.log('▶️ Starting periodic updates every 15 seconds');
    this.isPeriodicUpdateRunning = true;

    this.updateInterval = setInterval(async () => {
      const storeNames = Object.keys(this.cache);
      const now = Date.now();
      
      if (storeNames.length === 0) {
        return;
      }

      // ✅ Only log once per periodic cycle
      console.log(`🔄 Periodic check for ${storeNames.length} stores at ${new Date().toLocaleTimeString()}`);
      
      // ✅ Process stores sequentially with better promise handling
      for (const store of storeNames) {
        try {
          const storeCache = this.cache[store];
          if (!storeCache) continue;
          
          const age = now - storeCache.lastUpdated;
          
          // ✅ Only update if cache is stale AND no update is in progress
          if (age >= this.UPDATE_INTERVAL && !this.updatePromises.has(store)) {
            console.log(`🕐 Periodic update needed for ${store} (age: ${Math.round(age/1000)}s)`);
            // ✅ Don't await - let it run in background
            this.updateStoreData(store).catch(error => {
              console.error(`Background update failed for ${store}:`, error);
            });
            // ✅ Add delay to prevent overwhelming database
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`Periodic check failed for ${store}:`, error);
        }
      }
    }, this.UPDATE_INTERVAL);
  }

  public stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🛑 Stopped periodic updates');
    }
  }

  public clearCache(storeName?: string): void {
    if (storeName) {
      delete this.cache[storeName];
      console.log(`🧹 Cleared cache for ${storeName}`);
    } else {
      this.cache = {};
      console.log('🧹 Cleared all cache');
    }
  }

  // ✅ Enhanced cache stats
  public getCacheStats() {
    const now = Date.now();
    return {
      totalStores: Object.keys(this.cache).length,
      activeUpdates: this.updatePromises.size,
      stores: Object.entries(this.cache).map(([store, data]) => ({
        store,
        lastUpdated: new Date(data.lastUpdated).toLocaleTimeString(),
        ageSeconds: Math.round((now - data.lastUpdated) / 1000),
        isUpdating: data.isUpdating,
        queueCount: data.queues.length,
        hasActivePromise: this.updatePromises.has(store)
      })),
      config: {
        CACHE_DURATION: this.CACHE_DURATION,
        UPDATE_INTERVAL: this.UPDATE_INTERVAL,
        MIN_UPDATE_INTERVAL: this.MIN_UPDATE_INTERVAL
      }
    };
  }

  // ✅ Add manual control methods
  public pauseUpdates(): void {
    console.log('⏸️ Pausing cache updates');
    this.stopPeriodicUpdates();
  }

  public resumeUpdates(): void {
    console.log('▶️ Resuming cache updates');
    this.startPeriodicUpdates();
  }

  public async forceUpdate(storeName: string): Promise<void> {
    console.log(`🔄 Force updating ${storeName}`);
    if (this.cache[storeName]) {
      this.cache[storeName].lastUpdated = 0; // Force update
    }
    await this.updateStoreData(storeName);
  }
}

// Singleton instance
export const dataCache = new DataCache();