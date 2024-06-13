import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import ClothingItem from '../models/ClothingItem.js';
import AIOutfit from '../models/AIOutfit.js';

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

    // Create sample clothing items
    await new ClothingItem({
      itemId: 1,
      wardrobeId: 1,
      userId: 1,
      title: 'Blue Jeans',
      category: 'Bottoms',
      type: 'Jeans',
      season: 'All',
      pattern: 'Solid',
      primaryColor: 'Blue',
      secondaryColor: 'None',
      dressCode: 'Casual',
    }).save();

    await new ClothingItem({
      itemId: 2,
      wardrobeId: 1,
      userId: 1,
      title: 'White T-Shirt',
      category: 'Tops',
      type: 'T-Shirt',
      season: 'All',
      pattern: 'Solid',
      primaryColor: 'White',
      secondaryColor: 'None',
      dressCode: 'Casual',
    }).save();
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /ai/recognize', () => {
    it('should recognize clothing item from image', async () => {
      const res = await request(app)
        .post('/ai/recognize')
        .set('Authorization', `Bearer ${token}`)
        .send({ image: 'base64encodedimage' });

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
          userId: 1,
          topId: 2,
          bottomId: 1,
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('overallScore', 8.5);
      expect(res.body).to.have.property('formalScore', 3.0);
      expect(res.body).to.have.property('casualScore', 9.0);
      expect(res.body).to.have.property('summerScore', 8.0);
      expect(res.body).to.have.property('winterScore', 7.0);
      expect(res.body).to.have.property('fashionScore', 8.0);

      // Check if the outfit is saved in the database
      const savedOutfit = await AIOutfit.findOne({ outfitId: res.body.outfitId });
      expect(savedOutfit).to.not.be.null;
      expect(savedOutfit).to.have.property('overallScore', 8.5);
    });
  });
});
