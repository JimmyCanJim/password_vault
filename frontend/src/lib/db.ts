import { MongoClient, ServerApiVersion } from 'mongodb';

declare global {
  // Use var for global assignment in TS
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || "";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Set it with: wrangler secret put MONGODB_URI');
  }

  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    global._mongoClientPromise = client.connect();
  }
  
  const connectedClient = await global._mongoClientPromise;
  return connectedClient.db("grandmas-vault");
}