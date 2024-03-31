import request from 'supertest';
import { app, server } from '../../../../app';
import Products from '@src/api/resources/products/products.model';
import Users from '@src/api/resources/users/users.model';
import { describe, test } from '@jest/globals';
// import { AuthUser } from '@src/types';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

const productMock = {
  title: 'Product 1',
  price: 1300,
  description: 'Description of product 1',
  owner: 'user1',
};

const invalidId = '5ab8dbcc6539f91c2288b0c1';

let validAuthToken = '';
let invalidAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDhhMzYxOGRlZmU0ZmQ1YTkzYTZjMCIsImlhdCI6MTcxMTg0MjE0NSwiZXhwIjoxNzExODQ1NzQ1fQ.2tE3lhGKoP_EJUQRZyTIT45WkPiIreuVSNp48qBP3EE';

describe('Products Routes', () => {
  beforeEach(async () => {
    await Products.deleteMany({ });
  });

  afterAll(async () => {
    await Products.deleteMany({ });
    server.close();
  });

  describe('GET /products', () => {
    test('it should return all products', async () => {
      const response = await request(app).get('/products');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('it should return 400 if the product id isnt valid', async () => {
      const response = await request(app).get(`/products/123`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ messages: [`Invalid ID`] });
    })

    test('it should return 400 if the product id doesnt exists', async () => {
      const response = await request(app)
        .get(`/products/${invalidId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ messages: [`Product doesnt exists`] });;
    });

    test('it should return a product if the product id exists', async () => {
      const product = await new Products(productMock).save();

      const response = await request(server)
        .get(`/products/${product._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toEqual(product._id.toString());
      expect(response.body.owner).toEqual(product.owner);
    });
  });

  describe('POST /products', () => {
    // Generate and get token before all POST products tests
    beforeAll(async () => {
      // --runInBand para correr archivos de test en serie y no en paralelo.
      // Esto para que no exista un race condition
      await Users.deleteMany({});

      const userCreationResult = await request(app).post('/users').send({
        username: 'user1',
        password: 'password1',
        email: 'user1@mail.com',
      });

      expect(userCreationResult.status).toBe(201);

      const userLogin = await request(app).post('/users/login').send({
        username: 'user1',
        password: 'password1',
      });

      expect(userLogin.status).toBe(200);

      validAuthToken = userLogin.body.token;
    });

    test('it should create a product with valid token', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send(productMock);

      expect(response.status).toBe(201);
      expect(response.body.title).toEqual(productMock.title);
      expect(response.body.owner).toEqual(productMock.owner);
    });

    test('it should not create a product with invalid token', () => {
      return request(app)
        .post('/products')
        .set('Authorization', `Bearer ${invalidAuthToken}`)
        .send(productMock)
        .expect(401);
    });

    test('it should not create a product without a price', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ ...productMock, price: undefined });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ messages: ['Price is required'] });
    });

    test('it should not create a product without title', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ ...productMock, title: undefined });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ messages: ['Title is required'] });
    });

    test('it should not create a product without description', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ ...productMock, description: undefined });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ messages: ['Description is required'] });
    });

    test('it should not create a product if the price is not a number', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ ...productMock, price: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ messages: ['Price must be a number'] });
    });

    test('it should not create a product if the title is not a string', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ ...productMock, title: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ messages: ['Title must be a string'] });
    });
  });

  describe('DELETE /products', () => {
    test('it should delete a product if the product id exists', async () => {
      const product = await new Products(productMock).save();
      
      const response = await request(app).delete(`/products/${product.get('id')}`).set('Authorization', `Bearer ${validAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toEqual(product._id.toString());
    });

    test('it should return 403 if the you are not the owner of the product', async () => {
      const product = await new Products({
        ...productMock,
        owner: 'user2',
      }).save();

      const response = await request(app).delete(`/products/${product.get('id')}`).set('Authorization', `Bearer ${validAuthToken}`);
      
      expect(response.status).toBe(403);
    })
  });

  describe('PUT /products', () => {
    test('it should update a product if the product id exists', async () => {
      const product = await new Products(productMock).save();
      
      const response = await request(app)
        .put(`/products/${product.get('id')}`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({
          ...productMock,
          title: 'Product 2',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toEqual('Product 2');
    });

    test('it should return 403 if you are not the owner of the product', async () => {
      const product = await new Products({
        ...productMock,
        owner: 'user2',
      }).save();

      const response = await request(app)
        .put(`/products/${product.get('id')}`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({
          ...productMock,
          title: 'Product 2',
        });

      expect(response.status).toBe(403);
    });
  });
});