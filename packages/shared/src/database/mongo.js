import mongoose from 'mongoose';
import { config } from '../config/env.js';

class MongoConnection {
  static #instance = null;
  #connected = false;

  constructor() {
    if (MongoConnection.#instance) {
      return MongoConnection.#instance;
    }
    MongoConnection.#instance = this;
  }

  async connect(uri = config.mongoUri) {
    if (this.#connected) return mongoose.connection;

    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    this.#connected = true;

    mongoose.connection.on('disconnected', () => {
      this.#connected = false;
    });

    return mongoose.connection;
  }

  async disconnect() {
    if (!this.#connected) return;
    await mongoose.disconnect();
    this.#connected = false;
  }

  isConnected() {
    return this.#connected && mongoose.connection.readyState === 1;
  }
}

export const mongoConnection = new MongoConnection();
export default mongoConnection;
