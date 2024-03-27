// import { describe } from 'node:test';
import request from 'supertest';
import { app, server } from '../../../../app';
import Users from '@src/api/resources/users/users.model';
import { describe, expect, test } from '@jest/globals';

describe('Users Routes', () => {
  beforeEach((done) => {
    Users.deleteMany();
    done();
  });

  afterAll(() => {
    server.close();
  });

  describe('GET /users', () => {
    test('it should return a list of users', async () => {
        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(response.body).toHaveLength(0);
    });
  });
});
