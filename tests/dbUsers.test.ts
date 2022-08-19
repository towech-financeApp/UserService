import dbUsers from '../src/database/dbUsers';
import { connectTestDB, dropCollections, dropTestDB } from './setuptestdb';
import { Objects } from '../src/Models';

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
  test('Register admin', async () => {
    const name = 'test';
    const mail = 'test@test.com';
    const pass = 'thisShouldBeEncrypted';
    const role = 'admin';

    const user = await dbUsers.add(name, mail, pass, role);
    expect(user._id).toBeDefined();
    expect(user.accountConfirmed).toBe(true);
    expect(user.name).toBe(name);
    expect(user.password).toBe(pass);
    expect(user.role).toBe('admin');
    expect(user.username).toBe(mail);
  });

  test('Register user', async () => {
    const name = 'test';
    const mail = 'test2@test.com';
    const pass = 'thisShouldBeEncrypted';
    const role = 'user';

    const user = await dbUsers.add(name, mail, pass, role);
    expect(user._id).toBeDefined();
    expect(user.accountConfirmed).toBe(true);
    expect(user.name).toBe(name);
    expect(user.password).toBe(pass);
    expect(user.role).toBe('user');
    expect(user.username).toBe(mail);
  });

  test('Register without role', async () => {
    const name = 'test';
    const mail = 'test3@test.com';
    const pass = 'thisShouldBeEncrypted';

    const user = await dbUsers.add(name, mail, pass);
    expect(user._id).toBeDefined();
    expect(user.accountConfirmed).toBe(true);
    expect(user.name).toBe(name);
    expect(user.password).toBe(pass);
    expect(user.role).toBe('user');
    expect(user.username).toBe(mail);
  });

  test('Get All Users', async () => {
    const users = await dbUsers.getAll();
    expect(users.length).not.toBe(0);
  });

  test('Delete an existing user', async () => {
    const users1 = await dbUsers.getAll();
    await dbUsers.delete(users1[0]._id);
    const users2 = await dbUsers.getAll();

    expect(users1.length - users2.length).toBe(1);
  });

  test('Delete a non exisitng user', async () => {
    const users1 = await dbUsers.getAll();
    await dbUsers.delete('000000000000000000000000');
    const users2 = await dbUsers.getAll();

    expect(users1.length - users2.length).toBe(0);
  });

  test('get user by email', async () => {
    const user = await dbUsers.getByEmail('test3@test.com');

    expect(user.username).toBe('test3@test.com');
  });

  test('get user by email', async () => {
    const user = await dbUsers.getByEmail('test3@test.com');

    expect(user.username).toBe('test3@test.com');
  });

  test('get inexistent user by email', async () => {
    const user = await dbUsers.getByEmail('notregistered@test.com');

    expect(user).toBe(null);
  });

  test('get user by id', async () => {
    const users = await dbUsers.getAll();
    const retrievedUser = await dbUsers.getById(users[0]._id);

    expect(users[0]).toEqual(retrievedUser);
  });

  test('get inexistent user by id', async () => {
    const retrievedUser = await dbUsers.getById('000000000000000000000000');

    expect(retrievedUser).toBe(null);
  });

  test('Add singleSessionToken', async () => {
    const token = 'this is a test';

    const users = await dbUsers.getAll();
    const refreshUser = await dbUsers.updateTokens({
      _id: users[0]._id,
      refreshTokens: users[0].refreshTokens,
      singleSessionToken: token,
    } as Objects.User.FrontendUser);

    expect(refreshUser.refreshTokens).toEqual(users[0].refreshTokens);
    expect(refreshUser.singleSessionToken).toBe(token);
  });

  test('Add refreshToken', async () => {
    const tokens = ['this is a test', 'this is too'];

    const users = await dbUsers.getAll();
    const refreshUser = await dbUsers.updateTokens({
      _id: users[0]._id,
      refreshTokens: tokens,
      singleSessionToken: users[0].singleSessionToken,
    } as Objects.User.FrontendUser);

    expect(refreshUser.refreshTokens).toEqual(tokens);
    expect(refreshUser.singleSessionToken).toEqual(users[0].singleSessionToken);
  });

  test('Change inexistent user tokens', async () => {
    const refreshUser = await dbUsers.updateTokens({
      _id: '000000000000000000000000',
      singleSessionToken: '',
      refreshTokens: [''],
    } as Objects.User.FrontendUser);

    expect(refreshUser).toBe(null);
  });

  test('Update user', async () => {
    const users = await dbUsers.getAll();

    const updatedUser = await dbUsers.updateUser(users[0]._id, { name: 'newName' } as Objects.User.BackendUser);

    expect(updatedUser.name).toBe('newName');
  });

  test('Update inexistent user', async () => {
    const updatedUser = await dbUsers.updateUser('000000000000000000000000', {
      name: 'newName',
    } as Objects.User.BackendUser);

    expect(updatedUser).toBe(null);
  });

  test('Change user password', async () => {
    const nuPassword = 'newPassword';

    const users = await dbUsers.getAll();
    const updatedUser = await dbUsers.changePassword(users[0]._id, nuPassword);

    expect(updatedUser.password).toBe(nuPassword);
  });

  test('Change inexistent user password', async () => {
    const nuPassword = 'newPassword';

    const updatedUser = await dbUsers.changePassword('000000000000000000000000', nuPassword);

    expect(updatedUser).toBe(null);
  });

  test('Run password reset token', async () => {
    const resetToken = 'resetToken';

    const users = await dbUsers.getAll();
    const resetUser = await dbUsers.setResetToken(users[0]._id, resetToken);

    expect(resetUser.resetToken).toBe(resetToken);
  });

  test('Run password reset token of inexistent user', async () => {
    const resetToken = 'resetToken';

    let error: any;

    try {
      await dbUsers.setResetToken('000000000000000000000000', resetToken);
    } catch (e) {
      error = e;
    }
    expect(error).toEqual({ error: 'Inexistent user' });
  });

  test('Update user email', async () => {
    const nuMail = 'nuMail@test.com';

    const users = await dbUsers.getAll();
    const updatedUser = await dbUsers.updateEmail(users[0]._id, nuMail);

    expect(updatedUser.username).toBe(nuMail);
    expect(updatedUser.accountConfirmed).toBe(false);
  });

  test('Update inexistent user email', async () => {
    const nuMail = 'nuMail@test.com';

    let error: any;
    try {
      await dbUsers.updateEmail('000000000000000000000000', nuMail);
    } catch (e) {
      error = e;
    }

    expect(error).toEqual({ error: 'Inexistent user' });
  });

  test('Confirm user email', async () => {
    const users = await dbUsers.getAll();
    const updatedUser = await dbUsers.updateAccountConfirmed(users[0]._id);

    expect(updatedUser.accountConfirmed).toBe(true);
  });

  test('Confirm inexistent user email', async () => {

    let error: any;
    try {
      await dbUsers.updateAccountConfirmed('000000000000000000000000');
    } catch (e) {
      error = e;
    }

    expect(error).toEqual({ error: 'Inexistent user' });
  });
});
