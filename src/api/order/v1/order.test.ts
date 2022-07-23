import app from 'app';
import request from 'supertest';
import { createConnection } from 'typeorm';
import { v4 } from 'uuid';

let token: string;
let orderId: number;
let trackingNumber: string = v4();
const random = v4();

const mockOrder = {
  MAWB: "MAWB",
  containerNumber: "string",
  trackingNumber: trackingNumber,
  shipper: "string",
  shipperPhoneNumber: "string",
  shipperAddress: "string",
  destinationCountry: "Chile",
  recipient: "string",
  RUT: trackingNumber,
  recipientPhoneNumber: trackingNumber,
  recipientEmail: trackingNumber,
  region: "Metropolitana de Santiago",
  province: "Santiago",
  comuna: "Las Condes",
  detailAddress: "Rosario Norte 410 92",
  weight: 0,
  value: 0,
  description: "string",
  quantity: 0
}

describe('Order API v1', () => {
  beforeAll(async () => {
    await createConnection();
    const res = await request(app)
      .post('/api/v1/signup')
      .set('Content-Type', 'application/json')
      .send({ name: random, email: `${random}@test.com`, password: 'test', permissions:'admin' });
    token = res.body.access_token;
  });

  describe('GET /api/v1/orders', () => {
    test('should return all orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/addOrder (application/json)', () => {
    test('should create order and return order.id', async () => {
      const res = await request(app)
        .post('/api/v1/addOrder')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send(mockOrder);
      expect(res.status).toBe(201);

      orderId = res.body.id;
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    test('should return one order', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/v1/orders/:id', () => {
    test('should update order and return order.id', async () => {
      const res = await request(app)
        .put(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send({ ...mockOrder, value: 1 });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/orders/:id', () => {
    test('should return OK status', async () => {
      const res = await request(app)
        .del(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
