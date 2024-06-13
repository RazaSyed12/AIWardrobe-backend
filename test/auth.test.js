import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import sinon from 'sinon';
import nodemailer from 'nodemailer';
import app from '../server.js';
import User from '../models/User.js';

describe('Auth API', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await User.deleteMany({});
  });

  after(async () => {
    await mongoose.connection.close();
  });

  let transporter;
  beforeEach(() => {
    transporter = {
      sendMail: sinon.stub().yields(null, { response: '250 OK' }),
    };
    sinon.stub(nodemailer, 'createTransport').returns(transporter);
  });

  afterEach(() => {
    nodemailer.createTransport.restore();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          userId: 1,
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          number: '1234567890',
          dob: '1990-01-01',
        });

      expect(res.status).to.equal(201);
      expect(res.text).to.equal('User registered successfully');
    });
  });

  describe('POST /auth/login', () => {
    it('should login the user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should send a password reset email', async () => {
      const res = await request(app)
        .post('/auth/reset-password')
        .send({ email: 'john@example.com' });

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Password reset email sent');
    });
  });

  // Additional tests for /reset/:token can be added here
});
