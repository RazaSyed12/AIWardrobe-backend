import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import ClothingItem from '../models/ClothingItem.js';
import AIOutfit from '../models/AIOutfit.js';
import User from '../models/User.js';

describe('AI Routes', () => {
  let token, topId, bottomId, userId;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await User.deleteMany({});
    await ClothingItem.deleteMany({});
    await AIOutfit.deleteMany({});

    const resRegister = await request(app)
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        number: '1234567890',
        dob: '1990-01-01',
      });

    const resLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });

    token = resLogin.body.token;
    userId = resLogin.body.userId;

    const top = await new ClothingItem({
      itemId: 1,
      wardrobeId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(userId),
      title: 'Blue Jeans',
      category: 'Bottoms',
      type: 'Jeans',
      season: 'All',
      pattern: 'Solid',
      primaryColor: 'Blue',
      secondaryColor: 'None',
      dressCode: 'Casual',
    }).save();
    topId = top._id;

    const bottom = await new ClothingItem({
      itemId: 2,
      wardrobeId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(userId),
      title: 'White T-Shirt',
      category: 'Tops',
      type: 'T-Shirt',
      season: 'All',
      pattern: 'Solid',
      primaryColor: 'White',
      secondaryColor: 'None',
      dressCode: 'Casual',
    }).save();
    bottomId = bottom._id;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /ai/recognize', () => {
    it('should recognize clothing item from image', async () => {
      const res = await request(app)
        .post('/ai/recognize')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', 'test/test-image.jpeg');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('type', 'T-Shirt');
      expect(res.body).to.have.property('color', 'Blue');
      expect(res.body).to.have.property('pattern', 'Solid');
    });
  });

  describe('POST /ai/score-outfit', () => {
    it('should score an outfit and save it', async () => {
      const res = await request(app)
        .post('/ai/score-outfit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId,
          topId,
          bottomId,
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('overallScore', 8.5);
      expect(res.body).to.have.property('formalScore', 3.0);
      expect(res.body).to.have.property('casualScore', 9.0);
      expect(res.body).to.have.property('summerScore', 8.0);
      expect(res.body).to.have.property('winterScore', 7.0);
      expect(res.body).to.have.property('fashionScore', 8.0);
    });
  });
});
