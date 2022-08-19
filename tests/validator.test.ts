import Validator from '../src/utils/validator';
import dbUsers from '../src/database/dbUsers';
import { connectTestDB, dropCollections, dropTestDB } from './setuptestdb';

beforeAll(async () => {
  await connectTestDB();
  const name = 'test';
  const mail = 'test@test.com';
  const pass = 'thisShouldBeEncrypted';
  const role = 'admin';

  await dbUsers.add(name, mail, pass, role);
});

afterAll(async () => {
  await dropCollections();
  await dropTestDB();
});

// afterEach(async () => {
//   await dropCollections();
// });

describe('Testing Validator', () => {
  test('Validate empty Email', async () => {
    expect(await Validator.validateEmail('')).toEqual({
      errors: { email: 'e-mail must not be empty' },
      valid: false,
    });

    expect(await Validator.validateEmail('   ')).toEqual({
      errors: { email: 'e-mail must not be empty' },
      valid: false,
    });
  });

  test('Validate email in incorrect format', async () => {
    expect(await Validator.validateEmail('notARealMail')).toEqual({
      errors: { email: 'e-mail must be a valid address' },
      valid: false,
    });
  });

  test('Validate email already registered', async () => {
    expect(await Validator.validateEmail('test@test.com')).toEqual({
      errors: { email: 'e-mail already registered' },
      valid: false,
    });
  });

  test('Validate email', async () => {
    expect(await Validator.validateEmail('test2@test.com')).toEqual({
      errors: {},
      valid: true,
    });
  });

  test('Validate Empty Name', () => {
    expect(Validator.validateName('')).toEqual({
      errors: {
        name: 'name must not be empty',
      },
      valid: false,
    });
  });

  test('Validate name', () => {
    expect(Validator.validateName('name ')).toEqual({
      errors: {},
      valid: true,
    });
  });
});
