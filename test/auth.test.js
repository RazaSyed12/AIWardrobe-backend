import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import sinon from 'sinon';
import app from '../server.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

describe('Auth API', () => {
  let transporter;
  let sendMailStub;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe', { useNewUrlParser: true, useUnifiedTopology: true });
    await User.deleteMany({});

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password',
      },
    });

    sendMailStub = sinon.stub(transporter, 'sendMail').resolves();
  });

  after(async () => {
    sendMailStub.restore();
    await mongoose.connection.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          number: '1234567890',
          dob: '1990-01-01',
        });

      expect(res.status).to.equal(201);
      expect(res.text).to.equal('User registered successfully');
    });

    it('should not register a user with a duplicate email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'john@example.com',
          password: 'password123',
          number: '1234567891',
          dob: '1990-01-02',
        });

      expect(res.status).to.equal(500);
    });

    it('should not register a user with a duplicate number', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          number: '1234567890',
          dob: '1990-01-02',
        });

      expect(res.status).to.equal(500);
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
        .send({
          email: 'john@example.com',
        });

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Password reset email sent');
    });
  });
});
