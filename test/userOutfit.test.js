import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import ClothingItem from '../models/ClothingItem.js';
import UserOutfit from '../models/UserOutfit.js';

describe('UserOutfit Routes', () => {
  let token;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await ClothingItem.deleteMany({});
    await UserOutfit.deleteMany({});

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

  describe('POST /userOutfit', () => {
    it('should create a new user outfit', async () => {
      const res = await request(app)
        .post('/userOutfit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 1,
          topId: 2,
          bottomId: 1,
          name: 'Casual Outfit',
        });

      expect(res.status).to.equal(201);
      expect(res.text).to.equal('User outfit created successfully');

      // Check if the outfit is saved in the database
      const savedOutfit = await UserOutfit.findOne({ name: 'Casual Outfit' });
      expect(savedOutfit).to.not.be.null;
      expect(savedOutfit).to.have.property('name', 'Casual Outfit');
    });
  });

  describe('GET /userOutfit/:userId', () => {
    it('should get all user outfits for a user', async () => {
      const res = await request(app)
        .get('/userOutfit/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('name', 'Casual Outfit');
    });
  });

  describe('PUT /userOutfit/:id', () => {
    let outfitId;

    before(async () => {
      const outfit = await new UserOutfit({
        outfitId: Date.now(),
        userId: 1,
        topId: 2,
        bottomId: 1,
        name: 'Work Outfit',
      }).save();
      outfitId = outfit._id;
    });

    it('should update a user outfit', async () => {
      const res = await request(app)
        .put(`/userOutfit/${outfitId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Work Outfit' });

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('User outfit updated successfully');

      // Check if the outfit is updated in the database
      const updatedOutfit = await UserOutfit.findById(outfitId);
      expect(updatedOutfit).to.have.property('name', 'Updated Work Outfit');
    });
  });

  describe('DELETE /userOutfit/:id', () => {
    let outfitId;

    before(async () => {
      const outfit = await new UserOutfit({
        outfitId: Date.now(),
        userId: 1,
        topId: 2,
        bottomId: 1,
        name: 'Summer Outfit',
      }).save();
      outfitId = outfit._id;
    });

    it('should delete a user outfit', async () => {
      const res = await request(app)
        .delete(`/userOutfit/${outfitId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('User outfit deleted successfully');

      // Check if the outfit is deleted from the database
      const deletedOutfit = await UserOutfit.findById(outfitId);
      expect(deletedOutfit).to.be.null;
    });
  });
});
