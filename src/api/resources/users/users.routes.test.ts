// import { describe } from 'node:test';
import request from 'supertest';
import { app, server } from '../../../../app';
import Users from '@src/api/resources/users/users.model';
import { describe, expect, test } from '@jest/globals';
import { AuthUser } from '@src/types';
import bcrypt from 'bcrypt';

let dummyUsers = [
  {
    username: 'user1',
    email: 'user1@mail.com',
    password: "password123",
  },
  {
    username: 'user2',
    email: 'user1@mail.com',
    password: "password123",
  }
] as AuthUser[];


// async function userExistsAndAttributesAreCoorrect(user: AuthUser) {
  
// };


describe('Users Routes', () => {
  beforeEach(async () => {
    await Users.deleteMany({ });
  });

  afterAll(async () => {
    await Users.deleteMany({ });
    server.close();
  });

  describe('GET /users', () => {
    test('it should return empty list of users', async () => {
        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
    });

    test('it should return a list of users', async () => {
      await Promise.all(dummyUsers.map(user => Users.create(user)));

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array)
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /users', () => {
    test('it should create a new user based on dummy user', async () => {
      const response = await request(app)
        .post('/users')
        .send(dummyUsers[0]);

      const user = response.body as AuthUser;

      expect(response.status).toBe(201);
      expect(user.email).toBe(dummyUsers[0]?.email);
      expect(user.username).toBe(dummyUsers[0]?.username);

      const userResult = await Users.find({ username: user.username });

      expect(userResult).toBeInstanceOf(Array);
      expect(userResult).toHaveLength(1);
      expect(userResult[0]?.username).toBe(user.username);
      expect(userResult[0]?.email).toBe(user.email);

      const equalPassword = bcrypt.compareSync(dummyUsers[0]?.password as string, userResult[0]?.password as string);
      expect(equalPassword).toBeTruthy();
    });
  });
});
