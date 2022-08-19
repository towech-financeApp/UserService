import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer | null = null;

export const connectTestDB = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
};

export const dropTestDB = async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
};

export const dropCollections = async () => {
  if (mongo) {
    const collections = await mongoose.connection.db.collections();
    for (const colletion of collections) {
      await colletion.drop();
    }
  }
};
