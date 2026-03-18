class EmployeePage {

  constructor(page) {
    this.page = page;
  }

  async navigateToPIM() {
    await this.page.click('text=PIM');
    await this.page.waitForURL(/viewEmployeeList/);
  }

  async clickAddEmployee() {
    await this.page.click('text=Add Employee');
    await this.page.waitForURL(/addEmployee/);
  }

  async fillEmployeeForm(firstName, lastName, employeeId) {
    // First Name
    await this.page.locator('input.oxd-input').nth(1).fill(firstName);

    // Last Name
    await this.page.locator('input.oxd-input').nth(3).fill(lastName);

    // Employee ID — clear auto-generated value first
    await this.page.locator('input.oxd-input').nth(4).clear();
    await this.page.locator('input.oxd-input').nth(4).fill(employeeId);

    await this.page.click('button[type="submit"]');
  }

async searchByName(name) {
  await this.page.waitForURL(/viewEmployeeList/);

  const searchInput = this.page.locator('input[placeholder="Type for hints..."]').first();
  await searchInput.fill(name);

  await this.page.waitForSelector('.oxd-autocomplete-dropdown', { timeout: 5000 })
    .catch(() => {});

  await this.page.keyboard.press('Enter');
  await this.page.click('button[type="submit"]');

  // Wait for EITHER results OR the no-records message
  // Don't just wait for table body — it stays hidden when empty
  await this.page.waitForTimeout(2000);
}

  async getResultCount() {
    await this.page.waitForSelector('.oxd-table-body');
    const rows = this.page.locator('.oxd-table-row--clickable');
    return await rows.count();
  }

}

module.exports = { EmployeePage };