import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import Outfit from '../models/Outfit.js';

describe('Outfit API', () => {
  let outfitId;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await Outfit.deleteMany({});
    const outfit = await new Outfit({
      outfitId: 1,
      userId: 1,
      topId: 1,
      bottomId: 2,
      overallScore: 8,
      formalScore: 5,
      casualScore: 9,
      summerScore: 7,
      winterScore: 4,
      fashionScore: 8,
    }).save();
    outfitId = outfit._id;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /outfit', () => {
    it('should create a new outfit', async () => {
      const res = await request(app)
        .post('/outfit')
        .send({
          outfitId: 2,
          topId: 1,
          bottomId: 2,
          overallScore: 9,
          formalScore: 6,
          casualScore: 9,
          summerScore: 7,
          winterScore: 4,
          fashionScore: 9,
          userId: 1, // Ensure userId is correctly set
        });

      expect(res.status).to.equal(201);
      expect(res.text).to.equal('Outfit created successfully');
    });
  });

  describe('GET /outfit/:userId', () => {
    it('should get outfits by user ID', async () => {
      const res = await request(app)
        .get('/outfit/1'); // Ensure this matches the userId in the database

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('overallScore', 8);
    });
  });

  describe('PUT /outfit/:id', () => {
    it('should update an outfit', async () => {
      const res = await request(app)
        .put(`/outfit/${outfitId}`)
        .send({
          overallScore: 10,
        });

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Outfit updated successfully');
    });
  });

  describe('DELETE /outfit/:id', () => {
    it('should delete an outfit', async () => {
      const res = await request(app)
        .delete(`/outfit/${outfitId}`);

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Outfit deleted successfully');
    });
  });
});
