import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import Wardrobe from '../models/Wardrobe.js';

describe('Wardrobe API', () => {
  let userId, wardrobeId;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await Wardrobe.deleteMany({});
    userId = new mongoose.Types.ObjectId();

    const wardrobe = await new Wardrobe({
      userId: userId,
      title: 'Summer Collection',
    }).save();
    wardrobeId = wardrobe._id;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /wardrobe', () => {
    it('should create a new wardrobe', async () => {
      const res = await request(app)
        .post('/wardrobe')
        .send({
          userId: userId,
          title: 'Winter Collection',
        });

      expect(res.status).to.equal(201);
      expect(res.text).to.equal('Wardrobe created successfully');
    });
  });

  describe('GET /wardrobe/:userId', () => {
    it('should get wardrobes by user ID', async () => {
      const res = await request(app)
        .get(`/wardrobe/${userId}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('title', 'Summer Collection');
    });
  });
});
