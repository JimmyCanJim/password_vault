"use server"; 

declare global {
  var _mongoClientPromise: any;
}

const uri = process.env.MONGODB_URI || "";

export async function getDb() {
  if (!uri) throw new Error('MONGODB_URI is missing. Run: wrangler secret put MONGODB_URI');

  if (typeof globalThis.require === "undefined") {
    globalThis.require = function(mod: string) {
      return {}; 
    } as any;
  }

  const { MongoClient, ServerApiVersion } = await import('mongodb');

  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    globalThis._mongoClientPromise = client.connect();
  }
  
  const connectedClient = await globalThis._mongoClientPromise;
  return connectedClient.db("grandmas-vault");
}