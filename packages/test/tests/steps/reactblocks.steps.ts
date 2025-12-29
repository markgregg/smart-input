import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

interface CustomWorld {
  browser: any;
  context: any;
  page: any;
}

When('I click the Add React Block button', async function (this: CustomWorld) {
  const button = this.page.locator('[data-testid="add-react-block-button"]');
  await expect(button).toBeVisible({ timeout: 5000 });
  await button.click();
  await this.page.waitForTimeout(300);
});

Then(
  'a React component should be rendered in the styled block',
  async function (this: CustomWorld) {
    // Wait for styled block to exist
    const styledBlock = this.page.locator('span[id^="react-block-"]').first();
    await expect(styledBlock).toBeVisible({ timeout: 5000 });

    // Get the block ID
    const blockId = await styledBlock.getAttribute('id');

    // Check that a React component is rendered inside it
    const reactComponent = this.page.locator(
      `[data-testid="react-block-${blockId}"]`,
    );
    await expect(reactComponent).toBeVisible({ timeout: 5000 });
  },
);

When(
  'I click the first React block button',
  async function (this: CustomWorld) {
    const button = this.page
      .locator('[data-testid^="react-block-button-"]')
      .first();
    await expect(button).toBeVisible({ timeout: 5000 });
    await button.click();
    await this.page.waitForTimeout(200);
  },
);

Then(
  'the first button counter should show {string}',
  async function (this: CustomWorld, expectedCount: string) {
    const button = this.page
      .locator('[data-testid^="react-block-button-"]')
      .first();
    await expect(button).toContainText(`Clicked: ${expectedCount}`, {
      timeout: 5000,
    });
  },
);

Then(
  'the editor should contain multiple styled blocks',
  async function (this: CustomWorld) {
    const styledBlocks = this.page.locator('span[id^="react-block-"]');
    const count = await styledBlocks.count();
    expect(count).toBeGreaterThanOrEqual(2);
  },
);

Then(
  'each styled block should have its own React component',
  async function (this: CustomWorld) {
    const styledBlocks = this.page.locator('span[id^="react-block-"]');
    const count = await styledBlocks.count();

    for (let i = 0; i < count; i++) {
      const styledBlock = styledBlocks.nth(i);
      const blockId = await styledBlock.getAttribute('id');
      const reactComponent = this.page.locator(
        `[data-testid="react-block-${blockId}"]`,
      );
      await expect(reactComponent).toBeVisible({ timeout: 5000 });
    }
  },
);

Then(
  'each React component button should work independently',
  async function (this: CustomWorld) {
    const buttons = this.page.locator('[data-testid^="react-block-button-"]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(2);

    // Click first button twice
    await buttons.nth(0).click();
    await this.page.waitForTimeout(200);
    await buttons.nth(0).click();
    await this.page.waitForTimeout(200);

    // Click second button once
    await buttons.nth(1).click();
    await this.page.waitForTimeout(200);

    // Verify counts are independent
    await expect(buttons.nth(0)).toContainText('Clicked: 2', { timeout: 5000 });
    await expect(buttons.nth(1)).toContainText('Clicked: 1', { timeout: 5000 });
  },
);
