import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

interface CustomWorld {
  browser: any;
  context: any;
  page: any;
}

Then(
  'the typeahead dropdown should be visible',
  async function (this: CustomWorld) {
    const dropdown = this.page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
  },
);

Then(
  'the typeahead should show suggestions',
  async function (this: CustomWorld) {
    const items = this.page.locator('[role="option"]');
    await expect(items.first()).toBeVisible({ timeout: 5000 });
  },
);

When('I wait for typeahead to appear', async function (this: CustomWorld) {
  const dropdown = this.page.locator('[role="listbox"]');
  await dropdown.waitFor({ state: 'visible', timeout: 5000 });
});

When('I press ArrowDown', async function (this: CustomWorld) {
  await this.page.keyboard.press('ArrowDown');
  await this.page.waitForTimeout(200);
});

When(
  'I click the first typeahead suggestion',
  async function (this: CustomWorld) {
    const firstItem = this.page.locator('[role="option"]').first();
    await firstItem.click();
  },
);

Then(
  'the typeahead dropdown should not be visible',
  async function (this: CustomWorld) {
    const dropdown = this.page.locator('[role="listbox"]');
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });
  },
);

Then(
  'the editor should contain styled text',
  async function (this: CustomWorld) {
    const styledElement = this.page.locator('span[id*="test-"]');
    await expect(styledElement).toBeVisible({ timeout: 5000 });
  },
);
