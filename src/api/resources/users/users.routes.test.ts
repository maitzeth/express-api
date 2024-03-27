// import { describe } from 'node:test';
import request from 'supertest';
import { app, server } from '../../../../app';
import Users from '@src/api/resources/users/users.model';
import { describe, expect, test } from '@jest/globals';

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
];


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
        expect(response.body).toEqual([]);
        expect(response.body).toHaveLength(0);
    });

    test('it should return a list of users', async () => {
      await Promise.all(dummyUsers.map(user => Users.create(user)));

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });
});
