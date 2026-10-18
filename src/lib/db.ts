import "server-only";
import mongoose from "mongoose";
import { env } from "./env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Stored on globalThis so the connection survives dev hot-reloads and is reused across
// warm serverless invocations on Vercel, instead of opening a new connection per request.
const globalForMongoose = globalThis as typeof globalThis & { _mongoose?: MongooseCache };
const cache: MongooseCache = (globalForMongoose._mongoose ??= { conn: null, promise: null });

/** Returns the shared Mongoose connection, connecting on first use. */
export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(env().MONGODB_URI, {
    bufferCommands: false, // fail immediately instead of queueing queries while disconnected
    serverSelectionTimeoutMS: 5000, // give up after 5 s if Atlas is unreachable
    maxPoolSize: 10,
  });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // let the next request retry instead of reusing a failed promise
    throw error;
  }
  return cache.conn;
}

/** Round-trips to the database. Used by the health endpoint. */
export async function pingDB(): Promise<boolean> {
  try {
    const conn = await connectDB();
    await conn.connection.db?.admin().ping();
    return true;
  } catch {
    return false;
  }
}
