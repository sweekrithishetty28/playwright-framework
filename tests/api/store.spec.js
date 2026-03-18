const { test, expect } = require('@playwright/test');
const testData = require('../../test-data/testData');
const { log, safeAction } = require('../../utils/helpers');

const BASE_URL = 'https://petstore.swagger.io/v2';

let orderId = testData.order.id;
let petId = testData.pet.id;

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === 'failed') {
    log.fail(`"${testInfo.title}" — ${testInfo.error?.message}`);
  } else {
    log.pass(testInfo.title);
  }
});

test.describe('Store Endpoints', () => {

  // TC1: Place an order
 
  test('TC1 - should place an order successfully', async ({ request }) => {

    await safeAction('Send POST /store/order', async () => {
      const response = await request.post(`${BASE_URL}/store/order`, {
        data: {
          id: orderId,
          petId: petId,
          quantity: testData.order.quantity,
          status: testData.order.status,
          complete: testData.order.complete
        }
      });

      log.step(`Response status: ${response.status()}`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      log.step(`Order placed: ${JSON.stringify(body)}`);

      expect(body.id).toBe(orderId);
      expect(body.petId).toBe(petId);
      expect(body.status).toBe(testData.order.status);
      expect(body.complete).toBe(true);
    });
  });

  // TC2: Find order by ID

  test('TC2 - should find order by valid ID', async ({ request }) => {

    await safeAction('Send GET /store/order/{id}', async () => {
      const response = await request.get(`${BASE_URL}/store/order/${orderId}`);

      log.step(`Response status: ${response.status()}`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      log.step(`Found order: ${body.id}, status: ${body.status}`);

      expect(body.id).toBe(orderId);
      expect(body.status).toBe(testData.order.status);
    });
  });


  // TC3: Delete order

  test('TC3 - should delete order successfully', async ({ request }) => {

    await safeAction('Send DELETE /store/order/{id}', async () => {
      const response = await request.delete(`${BASE_URL}/store/order/${orderId}`);

      log.step(`Response status: ${response.status()}`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      log.step(`Delete response: ${JSON.stringify(body)}`);
    });
  });

 
  // TC4: Find deleted order

  test('TC4 - should return 404 for deleted order', async ({ request }) => {

    await safeAction('GET deleted order should return 404', async () => {
      const response = await request.get(`${BASE_URL}/store/order/${orderId}`);

      log.step(`Response status: ${response.status()}`);
      expect(response.status()).toBe(404);

      const body = await response.json();
      log.step(`Error: ${body.message}`);
      expect(body.message).toBe('Order not found');
    });
  });

  // TC5: Find order with invalid ID

  test('TC5 - should return error for invalid order ID', async ({ request }) => {

    await safeAction('GET order with invalid ID', async () => {
      const response = await request.get(
        `${BASE_URL}/store/order/${testData.invalidApi.invalidId}`
      );

      log.step(`Response status: ${response.status()}`);
      expect([400, 404]).toContain(response.status());
    });
  });

  // TC6: Place order with invalid data

  test('TC6 - should handle order with invalid quantity', async ({ request }) => {

    await safeAction('POST order with negative quantity', async () => {
      const response = await request.post(`${BASE_URL}/store/order`, {
        data: {
          id: testData.invalidApi.nonExistentId,
          petId: petId,
          quantity: -1,         // invalid quantity
          status: 'placed',
          complete: false
        }
      });

      log.step(`Response status: ${response.status()}`);
      const body = await response.json();
      log.step(`Response: ${JSON.stringify(body)}`);
     
      expect(response.status()).toBe(200);
    });
  });

});