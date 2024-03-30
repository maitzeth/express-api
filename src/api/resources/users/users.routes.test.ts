import request from 'supertest';
import { app, server } from '../../../../app';
import Users from '@src/api/resources/users/users.model';
import { describe, test } from '@jest/globals';
import { AuthUser } from '@src/types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let dummyUsers = [
  {
    username: 'user1',
    email: 'user1@mail.com',
    password: "password123",
  },
  {
    username: 'user2',
    email: 'user2@mail.com',
    password: "password123",
  }
] as AuthUser[];


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

    test('it should return 409 error if user already exists', async () => {
      await Users.create(dummyUsers[0]);

      const response = await request(app)
        .post('/users')
        .send(dummyUsers[0]);

      expect(response.status).toBe(409);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('User already exists');
    });

    test('it should return 400 if username is missing', async () => {
      const user = { ...dummyUsers[0] };
      delete user.username;

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Username is required');
    });

    test('it should return 400 if email is missing', async () => {
      const user = { ...dummyUsers[0] };
      delete user.email;

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Email is required');
    });

    test('it should return 400 if password is missing', async () => {
      const user = { ...dummyUsers[0] };
      delete user.password;

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Password is required');
    });

    test('it should return 400 if username is less than 3 characters', async () => {
      const user = { ...dummyUsers[0], username: 'us' };

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Username must be 3 or more characters long');;
    });

    test('it should return 400 if password is less than 6 characters', async () => {
      const user = { ...dummyUsers[0], password: 'pass' };

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Password must be 6 or more characters long');
    });

    test('it should return 400 if email is invalid', async () => {
      const user = { ...dummyUsers[0], email: 'invalidemail' };

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Invalid email');
    });

    test('it should return 400 if username is invalid', async () => {
      const user = { ...dummyUsers[0], username: 'invalid username' };

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Username must be alphanumeric');
    });

    test('it should return 400 if there isnt a username or email or password', async () => {
      const user = {};

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(3);
      expect(response.body.messages).toEqual(['Username is required', 'Password is required', 'Email is required']);
    });

    test('it should save the username and email saved in lowercase', async () => {
      const user = { ...dummyUsers[0], username: 'USER1', email: 'USER@EMAIL.COM' };

      const response = await request(app)
        .post('/users')
        .send(user);

      expect(response.body.username).toBe('user1');
      expect(response.body.email).toBe('user@email.com');
    });
  });

  describe('POST /users/login', () => {
    test('it should return 400 if username isnt in the payload', async ()=>{
      const response = await request(app)
        .post('/users/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Username is required');
    });

    test('it should return 400 if password isnt in the payload', async ()=>{
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'user1' });

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Password is required');
    });

    test('it should return 400 if username and password arent in the payload', async ()=>{
      const response = await request(app)
        .post('/users/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(2);
      expect(response.body.messages).toEqual(['Username is required', 'Password is required']);
    });

    test('it should return 401 if user doesnt exist', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'user1', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('User not found');
    });

    test('it should return 400 if username is less than 3 characters', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'us', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Username must be 3 or more characters long');
    });

    test('it should return 400 if username is invalid', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'invalid username', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Username must be alphanumeric');
    });

    test('it should return 400 if password is less than 6 characters', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'user1', password: 'pass' });

      expect(response.status).toBe(400);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toBe('Password must be 6 or more characters long');
    });

    test('it should return 401 if password is incorrect', async () => {
      await new Users({
        username: 'user1',
        email: 'user1@mail.com',
        password: bcrypt.hashSync('password123', 10)
      }).save();

      const loginResponse = await request(app)
        .post('/users/login')
        .send({ username: 'user1', password: 'wrongpassword' });

      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body.messages).toHaveLength(1);
      expect(loginResponse.body.messages[0]).toBe('Invalid password');
    });

    test('it should return 401 if the username is incorrect', async () => {
      await new Users({
        username: 'user1',
        email: 'user1@mail.com',
        password: bcrypt.hashSync('password123', 10)
      }).save();

      const loginResponse = await request(app)
        .post('/users/login')
        .send({ username: 'wronguser', password: 'password123' });

      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body.messages).toHaveLength(1);
      expect(loginResponse.body.messages[0]).toBe('User not found');
    });

    test('it should return 200 and a token if user exists and password is correct', async () => {
      await new Users({
        username: 'user1',
        email: 'user1@mail.com',
        password: bcrypt.hashSync('password123', 10),
      }).save();   

      const loginResponse = await request(app)
        .post('/users/login')
        .send({ username: 'user1', password: 'password123' });
        
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeTruthy();
    });

    test('it should return a token with the user id', async () => {
      const newUser = await new Users({
        username: 'user1',
        email: 'user1@mail.com',
        password: bcrypt.hashSync('password123', 10),
      }).save();

      const loginResponse = await request(app)
        .post('/users/login')
        .send({ username: 'user1', password: 'password123' });

      const token = jwt.verify(loginResponse.body.token, process.env.JWT_SECRET as string) as { id: string };
    
      expect(token.id).toBe(newUser.id);
    });

    test('it should login even if the credentials have capitalize letters', async () => {
      await new Users({
        username: 'user1',
        email: 'user1@mail.com',
        password: bcrypt.hashSync('password123', 10),
      }).save();

      const loginResponse = await request(app)
        .post('/users/login')
        .send({ username: 'User1', password: 'password123' });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeTruthy();

    })
  });
});
