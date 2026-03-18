const { test, expect } = require('@playwright/test');
const testData = require('../../test-data/testData');
const { log, safeAction } = require('../../utils/helpers');

const BASE_URL = 'https://petstore.swagger.io/v2';

let petId = testData.pet.id;

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === 'failed') {
    log.fail(`"${testInfo.title}" — ${testInfo.error?.message}`);
  } else {
    log.pass(testInfo.title);
  }
});

test.describe('Pet Endpoints', () => {

  // TC1: Add a new pet
  test('TC1 - should add a new pet successfully', async ({ request }) => {

    await safeAction('Send POST /pet request', async () => {
      const response = await request.post(`${BASE_URL}/pet`, {
        data: {
          id: petId,
          name: testData.pet.name,
          status: testData.pet.status,
          category: testData.pet.category,
          photoUrls: testData.pet.photoUrls,
          tags: testData.pet.tags
        }
      });

      // Check status code is 200
      log.step(`Response status: ${response.status()}`);
      expect(response.status()).toBe(200);

      // Parse the response body
      const body = await response.json();
      log.step(`Created pet: ${JSON.stringify(body)}`);

      // Verify response contains correct data
      expect(body.id).toBe(petId);
      expect(body.name).toBe(testData.pet.name);
      expect(body.status).toBe(testData.pet.status);
    });
  });

  
  // TC2: Find pet by ID 
 test('TC2- should find a pet by its id',async({request})=>{
    await safeAction('Send GET /pet/{id} request',async()=>{
        const response=await request.get(`${BASE_URL}/pet/${petId}`)
   log.step(`Response Status:${response.status()}`) 
   expect(response.status()).toBe(200);

   const body=await response.json();
   log.step('Found pet:${body.name}');

   expect(body.id).toBe(petId);
   expect(body.name).toBe(testData.pet.name);

 });
 });
 
  // TC3: Update a pet
 
test('TC3- Update a pet by its id', async ({ request }) => {
  await safeAction('Send PUT/pet request', async () => {
 
    const response = await request.put(`${BASE_URL}/pet`, {
      data: {
        id: petId,
        name: testData.updatedPet.name,      
        status: testData.updatedPet.status, 
        photoUrls: testData.pet.photoUrls
      }
    });

    log.step(`Response Status: ${response.status()}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    log.step(`Updated pet name: ${body.name}, status: ${body.status}`);

    expect(body.name).toBe(testData.updatedPet.name);
    expect(body.status).toBe(testData.updatedPet.status);
  });
});
 

  // TC4: Find pet by ID after update
  
  test('TC4 - should reflect updated data when fetched', async ({ request }) => {

    await safeAction('Send GET /pet/{id} after update', async () => {
      const response = await request.get(`${BASE_URL}/pet/${petId}`);

      log.step(`Response status: ${response.status()}`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      log.step(`Pet name is now: ${body.name}`);

      
      expect(body.name).toBe(testData.updatedPet.name);
      expect(body.status).toBe(testData.updatedPet.status);
    });
  });

 
  // TC5: Delete pet
 
  test('TC5 - should delete a pet successfully', async ({ request }) => {

    await safeAction('Send DELETE /pet/{id} request', async () => {
      const response = await request.delete(`${BASE_URL}/pet/${petId}`);

      log.step(`Response status: ${response.status()}`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      log.step(`Delete response: ${JSON.stringify(body)}`);

      expect(body.message).toBe(String(petId));
    });
  });

 
  // TC6: Find deleted pet

  test('TC6 - should return 404 for deleted pet', async ({ request }) => {

    await safeAction('GET deleted pet should return 404', async () => {
      const response = await request.get(`${BASE_URL}/pet/${petId}`);

      log.step(`Response status: ${response.status()}`);
      expect(response.status()).toBe(404);

      const body = await response.json();
      log.step(`Error message: ${body.message}`);
      expect(body.message).toBe('Pet not found');
    });
  });

 
  // TC7: Find pet with invalid ID

  test('TC7 - should return error for invalid pet ID', async ({ request }) => {

    await safeAction('GET pet with invalid ID format', async () => {
      const response = await request.get(
        `${BASE_URL}/pet/${testData.invalidApi.invalidId}`
      );

      log.step(`Response status: ${response.status()}`);
   
      expect([400, 404]).toContain(response.status());
    });
  });

  
  // TC8: Add pet with missing required fields

  test('TC8 - should handle pet with empty name', async ({ request }) => {

    await safeAction('POST pet with empty photoUrls', async () => {
      const response = await request.post(`${BASE_URL}/pet`, {
        data: {
          id: testData.invalidApi.nonExistentId,
          name: '',
          photoUrls: []
        }
      });

      log.step(`Response status: ${response.status()}`);
      // API accepts it but we verify the response
      const body = await response.json();
      expect(response.status()).toBe(200);
      log.step(`Response body: ${JSON.stringify(body)}`);
      
      expect(body.name).toBe('');
    });
  });


  // TC9: DELETE already deleted pet

  test('TC10 - should return 404 when deleting already deleted pet', async ({ request }) => {
    await safeAction('DELETE /pet/{id} that no longer exists', async () => {
      const response = await request.delete(`${BASE_URL}/pet/${petId}`);

      log.step(`Status: ${response.status()}`);
      expect(response.status()).toBe(404);
    });
  });

});

