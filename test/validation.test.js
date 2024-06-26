import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';

describe('Validation Middleware', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await User.deleteMany({});
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /auth/register', () => {
    it('should not register a user with invalid email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Invalid Email',
          email: 'invalid-email',
          password: 'password123',
          number: '1234567890',
          dob: '1990-01-01',
        });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0].msg).to.equal('Email must be valid');
    });

    it('should not register a user with a short password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Short Password',
          email: 'shortpass@example.com',
          password: 'short',
          number: '1234567890',
          dob: '1990-01-01',
        });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0].msg).to.equal('Password must be at least 6 characters long');
    });

    it('should not register a user with an invalid date', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Invalid Date',
          email: 'invaliddate@example.com',
          password: 'password123',
          number: '1234567890',
          dob: 'invalid-date',
        });

      expect(res.status).to.equal(400);
      expect(res.body.errors[0].msg).to.equal('DOB must be a valid date');
    });
  });
});
