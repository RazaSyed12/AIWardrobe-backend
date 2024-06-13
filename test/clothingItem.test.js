import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../server.js';
import ClothingItem from '../models/ClothingItem.js';

describe('ClothingItem API', () => {
  let itemId, userId;

  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
    await ClothingItem.deleteMany({});

    userId = new mongoose.Types.ObjectId();

    const item = await new ClothingItem({
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
    itemId = item._id;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /clothingItem', () => {
    it('should add a new clothing item', async () => {
      const res = await request(app)
        .post('/clothingItem')
        .send({
          itemId: 2,
          wardrobeId: new mongoose.Types.ObjectId(),
          userId: userId,
          title: 'Red T-Shirt',
          category: 'Top',
          type: 'T-Shirt',
          season: 'Summer',
          pattern: 'Solid',
          primaryColor: 'Red',
          secondaryColor: 'None',
          dressCode: 'Casual',
        });

      expect(res.status).to.equal(201);
      expect(res.text).to.equal('Clothing item added successfully');
    });
  });

  describe('GET /clothingItem/:userId', () => {
    it('should get clothing items by user ID', async () => {
      const res = await request(app)
        .get(`/clothingItem/${userId}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('title', 'Blue T-Shirt');
    });
  });

  describe('PUT /clothingItem/:id', () => {
    it('should update a clothing item', async () => {
      const res = await request(app)
        .put(`/clothingItem/${itemId}`)
        .send({
          title: 'Updated Blue T-Shirt',
        });

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Clothing item updated successfully');
    });
  });

  describe('DELETE /clothingItem/:id', () => {
    it('should delete a clothing item', async () => {
      const res = await request(app)
        .delete(`/clothingItem/${itemId}`);

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Clothing item deleted successfully');
    });
  });
});
