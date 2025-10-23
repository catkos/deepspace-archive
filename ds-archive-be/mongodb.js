import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri =
  "mongodb+srv://" +
  process.env.MONGO_DB_USER +
  ":" +
  process.env.MONGO_DB_PASS +
  "@ds-archive.calbqn0.mongodb.net/?retryWrites=true&w=majority&appName=ds-archive";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    return client;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

export default client;
