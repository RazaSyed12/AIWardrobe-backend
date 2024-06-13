import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';

describe('AI Routes', () => {
  let token;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    
    // Register and login to get a token
    await request(app)
      .post('/auth/register')
      .send({
        userId: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        number: '1234567890',
        dob: '1990-01-01',
      });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });

    token = res.body.token;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /ai/recognize', () => {
    it('should recognize clothing item from image', async () => {
      const res = await request(app)
        .post('/ai/recognize')
        .set('Authorization', `Bearer ${token}`)
        .send({ image: 'base64encodedimage' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('type');
      expect(res.body).to.have.property('color');
    });
  });

  describe('POST /ai/score-outfit', () => {
    it('should score an outfit', async () => {
      const res = await request(app)
        .post('/ai/score-outfit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topId: 2,
          bottomId: 1,
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('overallScore');
      expect(res.body).to.have.property('formalScore');
      expect(res.body).to.have.property('casualScore');
    });
  });
});
