process.env.TEST_ENV = true;

import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import Wardrobe from '../models/Wardrobe.js';
import User from '../models/User.js';

describe('Wardrobe API', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await Wardrobe.deleteMany({});
    await User.deleteMany({});
    await new User({
      userId: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      number: '1234567890',
      dob: '1990-01-01',
    }).save();
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /wardrobe', () => {
    it('should create a new wardrobe', async () => {
      const res = await request(app)
        .post('/wardrobe')
        .send({
          wardrobeId: 1,
          userId: 1,
          title: 'Summer Wardrobe',
        });

      expect(res.status).to.equal(201);
      expect(res.text).to.equal('Wardrobe created successfully');
    });
  });

  describe('GET /wardrobe/:userId', () => {
    it('should get wardrobes by user ID', async () => {
      const res = await request(app)
        .get('/wardrobe/1');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('title', 'Summer Wardrobe');
    });
  });
});
