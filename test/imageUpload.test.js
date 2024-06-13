import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from '../server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Image Upload API', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/wardrobe');
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /upload', () => {
    it('should upload and process an image', async () => {
      const imagePath = path.resolve(__dirname, 'test-image.jpeg');
      const res = await request(app)
        .post('/upload')
        .attach('image', imagePath);

      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Image uploaded and processed successfully');
    });
  });
});
