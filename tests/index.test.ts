import { connectTestDB, dropCollections, dropTestDB } from './setuptestdb';
import UserService from '../src';

beforeAll(async () => {
  await dropCollections();
  await dropTestDB();
  await connectTestDB();
});

afterAll(async () => {
  await dropCollections();
  await dropTestDB();
});

// afterEach(async () => {
//   await dropCollections();
// });

describe('Testing Mongo Models', () => {
  const service = new UserService();

  test.todo('Test all');
});
