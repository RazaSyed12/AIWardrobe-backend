import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import UserOutfit from '../models/UserOutfit.js';
import ClothingItem from '../models/ClothingItem.js';

describe('UserOutfit Routes', () => {
  let userId, topId, bottomId, outfitId;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await UserOutfit.deleteMany({});
    await ClothingItem.deleteMany({});

    userId = new mongoose.Types.ObjectId();

    const top = await new ClothingItem({
      itemId: 1,
      wardrobeId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(userId),
      title: 'Blue T-Shirt',
      category: 'Top',
      type: 'T-Shirt',
      season: 'Summer',
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
      title: 'Blue Jeans',
      category: 'Bottom',
      type: 'Jeans',
      season: 'All',
      pattern: 'Solid',
      primaryColor: 'Blue',
      secondaryColor: 'None',
      dressCode: 'Casual',
    }).save();
    bottomId = bottom._id;

    const outfit = await new UserOutfit({
      userId: userId,
      topId: top._id,
      bottomId: bottom._id,
      name: 'Casual Blue Outfit',
    }).save();
    outfitId = outfit._id;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /userOutfit', () => {
    it('should create a new user outfit', async () => {
      const res = await request(app)
        .post('/userOutfit')
        .send({
          userId: userId,
          topId: topId,
          bottomId: bottomId,
          name: 'New Outfit',
        });

      expect(res.status).to.equal(201);
      expect(res.text).to.equal('User outfit created successfully');
    });
  });

  describe('GET /userOutfit/:userId', () => {
    it('should get all user outfits for a user', async () => {
      const res = await request(app)
        .get(`/userOutfit/${userId}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('name', 'Casual Blue Outfit');
    });
  });

  describe('PUT /userOutfit/:id', () => {
    it('should update a user outfit', async () => {
      const res = await request(app)
        .put(`/userOutfit/${outfitId}`)
        .send({
          name: 'Updated Outfit',
        });

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('User outfit updated successfully');
    });
  });

  describe('DELETE /userOutfit/:id', () => {
    it('should delete a user outfit', async () => {
      const res = await request(app)
        .delete(`/userOutfit/${outfitId}`);

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('User outfit deleted successfully');
    });
  });
});
