import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  console.error('MONGODB_URI is not defined in environment variables');
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function connectToDatabase() {
  if (!client) {
    try {
      client = new MongoClient(uri, {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 30000, // Increased to 30s
        socketTimeoutMS: 60000, // Increased to 60s
        connectTimeoutMS: 30000, // Increased to 30s
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 60000,
      });
      clientPromise = client.connect();
      await clientPromise;
      console.log('✓ MongoDB connected successfully');
    } catch (error) {
      console.error('✗ MongoDB connection failed:', error);
      throw error;
    }
  }
  return clientPromise;
}

// Initialize connection with retry
connectToDatabase().catch(err => {
  console.error('Initial MongoDB connection failed, will retry on next request:', err.message);
});

export default clientPromise!;
