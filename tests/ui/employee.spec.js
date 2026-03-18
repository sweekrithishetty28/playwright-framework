const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { EmployeePage } = require('../../pages/EmployeePage');
const testData = require('../../test-data/testData');
const { log, safeAction } = require('../../utils/helpers');

test.beforeEach(async ({ page }) => {
  await safeAction('Login as admin', async () => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.admin.username, testData.admin.password);
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    log.fail(`"${testInfo.title}" — ${testInfo.error?.message}`);
  } else {
    log.pass(testInfo.title);
  }
});

test.describe('Employee PIM Module', () => {

  // TC1: Create employee
  test('TC1 - should create a new employee successfully', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Click Add Employee', () => empPage.clickAddEmployee());
    await safeAction('Fill employee form', () =>
      empPage.fillEmployeeForm(
        testData.employee.firstName,
        testData.employee.lastName,
        testData.employee.employeeId
      )
    );
    // Verify by checking profile page loaded with correct name
    await safeAction('Verify profile page loaded', async () => {
      await page.waitForURL(
        /viewPersonalDetails|personalDetails|editEmployee/,
        { timeout: 60000 }   // 60 seconds for slow demo site
      );
      await expect(
        page.locator('input[name="firstName"]')
      ).toHaveValue(testData.employee.firstName, { timeout: 15000 });
    });
    log.info('Employee created successfully');
  });

  // TC2: Search employee
  test('TC2 - should find employee by name in list', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Search by name', () =>
      empPage.searchByName(testData.employee.firstName)
    );
    await safeAction('Verify result count > 0', async () => {
      const count = await empPage.getResultCount();
      expect(count).toBeGreaterThan(0);
    });
    await safeAction('Verify name in table', async () => {
      await expect(page.locator('.oxd-table-body'))
        .toContainText(testData.employee.firstName);
    });
  });

  // TC3: Save personal details
  test('TC3 - should save personal details correctly', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Search employee', () =>
      empPage.searchByName(testData.employee.firstName)
    );
    await safeAction('Open profile', async () => {
      await page.waitForSelector('.oxd-icon.bi-pencil-fill');
      await page.locator('.oxd-icon.bi-pencil-fill').first().click();
      await page.waitForURL(/viewPersonalDetails/);
      await page.waitForSelector('.oxd-select-text');
    });
    await safeAction('Set nationality', async () => {
      await page.locator('.oxd-select-text').nth(0).click();
      await page.waitForSelector('.oxd-select-dropdown');
      await page.locator('.oxd-select-dropdown')
        .getByText(testData.employee.nationality, { exact: true }).click();
      await page.waitForTimeout(500);
    });
    await safeAction('Set marital status', async () => {
      await page.locator('.oxd-select-text').nth(1).click();
      await page.waitForSelector('.oxd-select-dropdown');
      await page.locator('.oxd-select-dropdown')
        .getByText(testData.employee.maritalStatus, { exact: true }).click();
      await page.waitForTimeout(500);
    });
    await safeAction('Set date of birth', async () => {
      const dobField = page.locator('input[placeholder="yyyy-dd-mm"]').first();
      await dobField.click();
      await dobField.fill(testData.employee.dateOfBirth);
      await page.keyboard.press('Tab');
    });
    await safeAction('Set gender', async () => {
      await page.locator('label')
        .filter({ hasText: testData.employee.gender }).click();
    });
    await safeAction('Save and verify', async () => {
      await page.locator('button[type="submit"]').first().click();
      // Longer timeout for slow demo site
      await expect(page.locator('.oxd-toast--success'))
        .toContainText('Successfully Updated', { timeout: 15000 });
    });
  });

  // TC4: Edit employee name
  test('TC4 - should edit employee first name', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Search employee', () =>
      empPage.searchByName(testData.employee.firstName)
    );
    await safeAction('Open profile', async () => {
      await page.waitForSelector('.oxd-icon.bi-pencil-fill');
      await page.locator('.oxd-icon.bi-pencil-fill').first().click();
      await page.waitForURL(/viewPersonalDetails/);
    });
    await safeAction('Update first name', async () => {
      await page.locator('input[name="firstName"]').clear();
      await page.locator('input[name="firstName"]')
        .fill(testData.employee.updatedFirstName);
    });
    await safeAction('Save and verify', async () => {
      await page.locator('button[type="submit"]').first().click();
      await expect(page.locator('.oxd-toast--success'))
        .toContainText('Successfully Updated', { timeout: 15000 });
    });
  });

  // TC5: Cancel delete — employee should still exist
  test('TC5 - should NOT delete employee when cancel is clicked', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Search employee', () =>
      empPage.searchByName(testData.employee.firstName)
    );
    await safeAction('Wait for result row', async () => {
      await page.waitForSelector('.oxd-table-row--clickable', { timeout: 10000 });
    });
    await safeAction('Click delete icon', async () => {
      await page.locator('.oxd-icon.bi-trash').first().click();
    });
    await safeAction('Click Cancel on popup', async () => {
      await page.click('button:has-text("No, Cancel")');
    });
    await safeAction('Verify employee still exists', async () => {
      await expect(page.locator('.oxd-table-row--clickable').first())
        .toBeVisible();
    });
  });

  // TC6: Delete employee
  test('TC6 - should delete employee from list', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Search employee', () =>
      empPage.searchByName(testData.employee.updatedFirstName)
    );
    await safeAction('Wait for result row', async () => {
      await page.waitForSelector('.oxd-table-row--clickable', { timeout: 150000 });
    });
    await safeAction('Click delete icon', async () => {
      await page.locator('.oxd-icon.bi-trash').first().click();
    });
    await safeAction('Confirm delete', async () => {
      await page.click('button:has-text("Yes, Delete")');
    });
    await safeAction('Verify success toast', async () => {
      await expect(page.locator('.oxd-toast--success'))
        .toContainText('Successfully Deleted', { timeout: 15000 });
    });
  });

  // TC7: Empty first name on create
  test('TC7 - should show error when first name is empty', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Click Add Employee', () => empPage.clickAddEmployee());
    await safeAction('Fill only last name', async () => {
      await page.locator('input.oxd-input').nth(2).fill(testData.employee.lastName);
    });
    await safeAction('Submit and verify error', async () => {
      await page.click('button[type="submit"]');
      await expect(page.locator('.oxd-input-field-error-message').first())
        .toBeVisible();
    });
  }); 

  // TC8: Empty last name on create
  test('TC8 - should show error when last name is empty', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Click Add Employee', () => empPage.clickAddEmployee());
    await safeAction('Fill only first name', async () => {
      await page.locator('input.oxd-input').nth(0).fill(testData.employee.firstName);
    });
    await safeAction('Submit and verify error', async () => {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      await expect(page.locator('.oxd-input-field-error-message').first())
        .toBeVisible();
    });
  });

  // TC9: Search non-existent employee
  test('TC9 - should show no records for unknown employee', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Search unknown name', () =>
      empPage.searchByName(testData.invalidEmployee.nonExistentName)
    );
    await safeAction('Verify no records message', async () => {
      await expect(
        page.locator('span.oxd-text--span').filter({ hasText: 'No Records Found' })
      ).toBeVisible();
    });
  });

  // TC10: Duplicate employee ID

test('TC10 - should show error for duplicate employee ID', async ({ page }) => {
  const empPage = new EmployeePage(page);

  await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
  await safeAction('Click Add Employee', () => empPage.clickAddEmployee());
  await safeAction('Fill form with duplicate ID', async () => {
    await page.locator('input.oxd-input').nth(0).fill('Duplicate');
    await page.locator('input.oxd-input').nth(2).fill('User');
    await page.locator('input.oxd-input').nth(3).clear();
    await page.locator('input.oxd-input').nth(3)
      .fill(testData.employee.employeeId);
  });
  await safeAction('Submit and verify error', async () => {
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await expect(
      page.locator('.oxd-input-field-error-message').first()
    ).toBeVisible();
  });
});
  // TC11: Edit with empty first name
  test('TC11 - should show error when editing with empty first name', async ({ page }) => {
    const empPage = new EmployeePage(page);

    await safeAction('Navigate to PIM', () => empPage.navigateToPIM());
    await safeAction('Search employee', () =>
      empPage.searchByName(testData.employee.updatedFirstName)
    );
    await safeAction('Wait for result row', async () => {
      await page.waitForSelector('.oxd-table-row--clickable', { timeout: 10000 });
    });
    await safeAction('Open profile', async () => {
      await page.locator('.oxd-icon.bi-pencil-fill').first().click();
      await page.waitForURL(/viewPersonalDetails/);
    });
    await safeAction('Clear first name', async () => {
      await page.locator('input[name="firstName"]').click({ clickCount: 3 });
      await page.keyboard.press('Delete');
    });
    await safeAction('Submit and verify error', async () => {
      await page.locator('button[type="submit"]').first().click();
      await expect(page.locator('.oxd-input-field-error-message').first())
        .toBeVisible();
    });
  });

});