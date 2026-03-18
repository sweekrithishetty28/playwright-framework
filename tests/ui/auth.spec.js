const { test, expect } = require('@playwright/test');
const {log,safeAction}= require('../../utils/helpers');
const {LoginPage}= require('../../pages/LoginPage');
const testData = require('../../test-data/testData');

test.beforeEach(async ({ page }) => {
  await safeAction('Open login page', async () => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    log.fail(`"${testInfo.title}" — ${testInfo.error?.message}`);
  } else {
    log.pass(testInfo.title);
  }
});

 test.describe('Login and Logout', () => {

  // TEST 1: Valid login should work

  test('valid credentials should go to dashboard', async ({ page }) => {

   const loginPage= new LoginPage(page);
   await safeAction('Type username',async()=>{
    await page.fill(('input[name="username"]'),testData.admin.username);
   });

   await safeAction('Type password',async()=>{
    await page.fill('input[name="password"]',testData.admin.password);
   });
   
  await safeAction('Click login button', async () => {
      await page.click('button[type="submit"]');
 });

 await safeAction('Check if user is redirected to dashboard', async () => {
    await expect(page).toHaveURL(/dashboard/);
  });

  log.info('TC1 PASSED: valid credentials go to dashboard');

  });


  // TEST 2: Wrong password and wrong username should show error

  test('wrong credentials should show error message', async ({ page }) => {

    const loginpage= new LoginPage(page);

    await safeAction('Type wrong username',async()=>{
        await page.fill(('input[name="username"]'),testData.invalidAdmin.wrongUsername);
    });
    
  await safeAction('Type wrong password',async()=>{
    await page.fill('input[name="password"]', testData.invalidAdmin.wrongPassword);
  });

  await safeAction('Click login button',async()=>{
     await page.click('button[type="submit"]');

  });

  await safeAction('Check if error message is visible',async()=>{
    await expect(page.locator('.oxd-alert-content')).toBeVisible();

  });
   
  log.info('TC2 PASSED: wrong credentials show error');

  });

// TEST 3: Wrong username should show error

test('wrong username should show error', async ({ page }) => {
    await safeAction('Enter wrong username', async () => {
      await page.fill('input[name="username"]', testData.invalidAdmin.wrongUsername);
    });
    await safeAction('Enter correct password', async () => {
      await page.fill('input[name="password"]', testData.admin.password);
    });
    await safeAction('Click login button', async () => {
      await page.click('button[type="submit"]');
    });
    await safeAction('Verify error message shown', async () => {
      await expect(page.locator('.oxd-alert-content')).toBeVisible();
    });


  log.info('TC3 PASSED: wrong username shows error');

});

//TEST 4: Wrong password should show error

test("Wrong password should show error",async({page})=>{
   const loginPage=new LoginPage(page);

   await safeAction('Type username',async()=>{
     await page.fill('input[name="username"]',testData.admin.username); //correct username
   });
   await safeAction('Type password',async()=>{
        await page.fill('input[name="password"]',testData.invalidAdmin.wrongPassword);
   });

  await safeAction('Click login button',async()=>{
     await page.click('button[type="submit"]');

  });

    await safeAction('Check if error meassage is visible',async()=>{
      await expect(page.locator('.oxd-alert-content')).toBeVisible();
    });
    log.info('TC4 PASSED: wrong password shows error');
});

// TEST 5: Empty credentials should show error
test('empty credentials should show error', async ({page})=>{
   const loginPage= new LoginPage(page);
   //Leave user and password empty and click login

    await safeAction('Click login button',async()=>{
     await page.click('button[type="submit"]');

  });
        await safeAction('Check if error message is visible',async()=>{
    await expect(page.locator('.oxd-input-field-error-message').first()).toBeVisible();
        });
   
    log.info('TC5 PASSED: empty credentials show error');

    
});
// TEST 6: Missing username should show required error

test('missing username should show required error', async ({ page }) => {
     const loginPage = new LoginPage(page);

    //Leave username empty,type password

    await safeAction('Type password',async()=>{
        await page.fill('input[name="password"]', testData.admin.password);
    });

    await safeAction('Click login button',async()=>{
        await page.click('button[type="submit"]');
    });

    await safeAction('Check if error message is visible',async()=>{
        await expect(page.locator('.oxd-input-field-error-message')).toBeVisible();


});
    
    log.info('TC6 PASSED: missing username shows required error');
  });

  // TEST 7: Missing password should show required error

test('missing password should show required error', async ({ page }) => {
     const loginPage=new LoginPage(page);
    //Type username, leave password empty
    await safeAction('Type username',async()=>{
        await page.fill('input[name="username"]', testData.admin.username);
    });

    await safeAction('Click login button',async()=>{
        await page.click('button[type="submit"]');
    });


    await safeAction('Check if error message is visible',async()=>{
        await expect(page.locator('.oxd-input-field-error-message')).toBeVisible();
    });

    log.info('TC7 PASSED: missing password shows required error');
  });


 
  // TEST 8: Logout should go back to login page

  test('logout should redirect to login page', async ({ page }) => {
        const loginPage= new LoginPage(page);
await safeAction('Type username',async()=>{
    await page.fill(('input[name="username"]'),testData.admin.username);
   });

   await safeAction('Type password',async()=>{
    await page.fill('input[name="password"]',testData.admin.password);
   });
   
  await safeAction('Click login button', async () => {
      await page.click('button[type="submit"]');
 });

 await safeAction('Check if user is redirected to dashboard', async () => {
    await expect(page).toHaveURL(/dashboard/);
  });

 await safeAction('Open user dropdown',async()=>{
 await page.click('.oxd-userdropdown-tab');
    });
   
    await safeAction('Click Logout',async()=>{
         await page.click('text=Logout');
    });

     await safeAction('Check if redirected to login page',async()=>{
       await expect(page).toHaveURL(/login/);
     });
  
   log.info('TC8 PASSED: logout redirects to login page');

  });

});