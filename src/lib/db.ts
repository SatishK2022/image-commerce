import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please check your database connection string");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const options = {
            bufferCommands: false,
            maxPoolSize: 10,
        }

        cached.promise = mongoose.connect(MONGODB_URI, options).then(() => mongoose.connection);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
    }

    return cached.conn;
}