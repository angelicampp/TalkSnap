import { MongoClient } from 'mongodb';

const MONGODB_URI="mongodb+srv://cantillobrayan12:5uuZqNlB9YfcKcOO@cluster0.3pup0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const DB_NAME = 'TalkSnap';

if (!MONGODB_URI) {
  throw new Error('Por favor, define la variable MONGODB_URI en .env');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}