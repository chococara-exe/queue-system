// lib/connectionManager.ts
import mongoose from "mongoose";

interface ConnectionCache {
  [storeName: string]: mongoose.Connection;
}

const connections: ConnectionCache = {};

export async function getOrCreateConnection(storeName: string): Promise<mongoose.Connection> {
  // Return existing connection if it exists and is ready
  if (connections[storeName] && connections[storeName].readyState === 1) {
    return connections[storeName];
  }

  // Clean up dead connections
  if (connections[storeName] && connections[storeName].readyState !== 1) {
    try {
      await connections[storeName].close();
    } catch (error) {
      console.error("Error closing dead connection:", error);
    }
    delete connections[storeName];
  }

  const connectionString = `${process.env.BASE_URL}/${storeName}?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=true`;
  
  const conn = await mongoose.createConnection(connectionString, {
    maxPoolSize: 1,        // ✅ Reduced from default 100
    minPoolSize: 0,
    maxIdleTimeMS: 10000,  // Close connections after 30s idle
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });

  await new Promise<void>((resolve, reject) => {
    conn.once('open', () => {
        resolve();
    })

    conn.once('error', (err) => {
        console.error("Connection error:", err);
        reject(err);
    })

    setTimeout(() => {
        reject(new Error(`Connection timeout for ${storeName}`));
    }, 10000)
  })

  connections[storeName] = conn;
  
  conn.on('disconnected', () => {
    delete connections[storeName];
  });

  return conn;
}