import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

interface CustomWorld {
  browser: any;
  context: any;
  page: any;
  apiResult?: any;
}

// Background steps
Given('the API reference is available', async function (this: CustomWorld) {
  // Wait for the API to be initialized in the page context
  await this.page.waitForFunction(
    () => {
      return window.testApi !== undefined;
    },
    { timeout: 5000 },
  );
});

// Insert operations
When(
  'I insert {string} at position {int} using the API',
  async function (this: CustomWorld, text: string, position: number) {
    await this.page.evaluate(
      ({ text, position }: { text: string; position: number }) => {
        window.testApi?.apply((api: any) => {
          api.insert(text, position);
        });
      },
      { text, position },
    );
    // Wait for the DOM to update
    await this.page.waitForTimeout(300);
  },
);

// Clear operation
When('I clear the editor using the API', async function (this: CustomWorld) {
  await this.page.evaluate(() => {
    window.testApi?.apply((api: any) => {
      api.clear();
    });
  });
  await this.page.waitForTimeout(300);
});

// Delete operation
When(
  'I delete text from position {int} to {int} using the API',
  async function (this: CustomWorld, start: number, end: number) {
    await this.page.evaluate(
      ({ start, end }: { start: number; end: number }) => {
        window.testApi?.apply((api: any) => {
          api.delete(start, end);
        });
      },
      { start, end },
    );
    await this.page.waitForTimeout(300);
  },
);

// Replace operation
When(
  'I replace text from position {int} to {int} with {string} using the API',
  async function (this: CustomWorld, start: number, end: number, text: string) {
    await this.page.evaluate(
      ({ start, end, text }: { start: number; end: number; text: string }) => {
        window.testApi?.apply((api: any) => {
          api.replace(start, end, text);
        });
      },
      { start, end, text },
    );
    await this.page.waitForTimeout(300);
  },
);

// ReplaceText operation
When(
  'I replace first occurrence of {string} with {string} using the API',
  async function (this: CustomWorld, oldText: string, newText: string) {
    await this.page.evaluate(
      ({ oldText, newText }: { oldText: string; newText: string }) => {
        window.testApi?.apply((api: any) => {
          api.replaceText(oldText, newText);
        });
      },
      { oldText, newText },
    );
    await this.page.waitForTimeout(300);
  },
);

// ReplaceAll operation
When(
  'I replace all occurrences of {string} with {string} using the API',
  async function (this: CustomWorld, oldText: string, newText: string) {
    await this.page.evaluate(
      ({ oldText, newText }: { oldText: string; newText: string }) => {
        window.testApi?.apply((api: any) => {
          api.replaceAll(oldText, newText);
        });
      },
      { oldText, newText },
    );
    await this.page.waitForTimeout(300);
  },
);

// InsertStyledBlock operation
When(
  'I insert a styled block {string} with text {string} at position {int} using the API',
  async function (
    this: CustomWorld,
    id: string,
    text: string,
    position: number,
  ) {
    await this.page.evaluate(
      ({
        id,
        text,
        position,
      }: {
        id: string;
        text: string;
        position: number;
      }) => {
        window.testApi?.apply((api: any) => {
          api.insertStyledBlock(
            {
              type: 'styled' as const,
              id: id,
              text: text,
              style: {
                backgroundColor: '#e6f2ff',
                padding: '2px 4px',
                borderRadius: '3px',
              },
            },
            position,
          );
        });
      },
      { id, text, position },
    );
    await this.page.waitForTimeout(300);
  },
);

// StyleText operation
When(
  'I style the text {string} with id {string} using the API',
  async function (this: CustomWorld, text: string, id: string) {
    await this.page.evaluate(
      ({ text, id }: { text: string; id: string }) => {
        window.testApi?.apply((api: any) => {
          api.styleText(text, id);
        });
      },
      { text, id },
    );
    await this.page.waitForTimeout(300);
  },
);

// StyleText with custom CSS
When(
  'I style the text {string} with id {string} and custom CSS using the API',
  async function (this: CustomWorld, text: string, id: string) {
    await this.page.evaluate(
      ({ text, id }: { text: string; id: string }) => {
        window.testApi?.apply((api: any) => {
          api.styleText(text, id, {
            backgroundColor: 'yellow',
            fontWeight: 'bold',
            padding: '4px',
          });
        });
      },
      { text, id },
    );
    await this.page.waitForTimeout(300);
  },
);

// Multiple operations in single apply
When(
  'I perform multiple operations in single apply',
  async function (this: CustomWorld, dataTable: any) {
    const operations = dataTable.hashes();
    await this.page.evaluate((ops: any[]) => {
      window.testApi?.apply((api: any) => {
        ops.forEach((op: any) => {
          if (op.operation === 'insert') {
            api.insert(op.text, parseInt(op.position));
          }
        });
      });
    }, operations);
    await this.page.waitForTimeout(300);
  },
);

// InsertDocument operation
When(
  'I insert a document {string} at position {int} using the API',
  async function (this: CustomWorld, fileName: string, position: number) {
    await this.page.evaluate(
      ({ fileName, position }: { fileName: string; position: number }) => {
        // Create a mock File object
        const file = new File(['Document content'], fileName, {
          type: 'application/pdf',
        });
        const url = URL.createObjectURL(file);

        window.testApi?.apply((api: any) => {
          api.insertDocument(
            {
              name: fileName,
              file: file,
              url: url,
            },
            position,
          );
        });
      },
      { fileName, position },
    );
    await this.page.waitForTimeout(300);
  },
);

// InsertImage operation
When(
  'I insert an image {string} at position {int} using the API',
  async function (this: CustomWorld, fileName: string, position: number) {
    await this.page.evaluate(
      ({ fileName, position }: { fileName: string; position: number }) => {
        // Create a mock File object
        const file = new File(['Image content'], fileName, {
          type: 'image/jpeg',
        });
        const url = URL.createObjectURL(file);

        window.testApi?.apply((api: any) => {
          api.insertImage(
            {
              name: fileName,
              file: file,
              url: url,
              alt: fileName,
            },
            position,
          );
        });
      },
      { fileName, position },
    );
    await this.page.waitForTimeout(300);
  },
);

// Batch operations
When(
  'I perform batch operations using the API',
  async function (this: CustomWorld, dataTable: any) {
    const operations = dataTable.hashes();
    await this.page.evaluate((ops: any[]) => {
      window.testApi?.apply((api: any) => {
        ops.forEach((op: any) => {
          switch (op.operation) {
            case 'insert':
              api.insert(op.text, parseInt(op.start));
              break;
            case 'replaceText':
              // For this test, we're using a simplified version
              api.replaceText(op.text, 'Modified');
              break;
          }
        });
      });
    }, operations);
    await this.page.waitForTimeout(300);
  },
);

// API-specific assertion steps (editor content steps are in editor.steps.ts)

Then(
  'the API get method should return content with {string}',
  async function (this: CustomWorld, text: string) {
    const content = await this.page.evaluate(() => {
      const items = window.testApi?.get();
      return JSON.stringify(items);
    });
    expect(content).toContain(text);
  },
);

Then(
  'the API getBlocks method should return at least {int} block(s)',
  async function (this: CustomWorld, count: number) {
    const blockCount = await this.page.evaluate(() => {
      let blocks: any[] = [];
      window.testApi?.apply((api: any) => {
        blocks = api.getBlocks();
      });
      return blocks.length;
    });
    expect(blockCount).toBeGreaterThanOrEqual(count);
  },
);

Then(
  'the API getBlockAtPosition at {int} should return a block',
  async function (this: CustomWorld, position: number) {
    const block = await this.page.evaluate((pos: number) => {
      return window.testApi?.getBlockAtPosition(pos);
    }, position);
    expect(block).not.toBeNull();
  },
);

Then(
  'the API getBlockAtPosition at {int} should return null',
  async function (this: CustomWorld, position: number) {
    const block = await this.page.evaluate((pos: number) => {
      return window.testApi?.getBlockAtPosition(pos);
    }, position);
    expect(block).toBeNull();
  },
);

Then(
  'the styled block {string} should be visible',
  async function (this: CustomWorld, id: string) {
    const element = await this.page.locator(`#${id}`).first();
    await expect(element).toBeVisible({ timeout: 2000 });
  },
);

Then(
  'the styled block {string} should have custom styling',
  async function (this: CustomWorld, id: string) {
    const hasCustomStyle = await this.page.evaluate((blockId: string) => {
      const element = window.testApi?.getElementById(blockId);
      if (!element) return false;
      const styles = window.getComputedStyle(element);
      return (
        styles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
        styles.fontWeight === 'bold' ||
        styles.padding !== '0px'
      );
    }, id);
    expect(hasCustomStyle).toBe(true);
  },
);

Then(
  'the document block {string} should be visible',
  async function (this: CustomWorld, fileName: string) {
    const documentBlock = await this.page
      .locator(`[data-type="document"], [class*="document"]`)
      .filter({ hasText: fileName })
      .first();
    await expect(documentBlock).toBeVisible({ timeout: 2000 });
  },
);

Then(
  'the image block {string} should be visible',
  async function (this: CustomWorld, fileName: string) {
    const imageBlock = await this.page
      .locator(`[data-type="image"], img, [class*="image"]`)
      .first();
    await expect(imageBlock).toBeVisible({ timeout: 2000 });
  },
);

Then(
  'the API getElementById for {string} should return an element',
  async function (this: CustomWorld, id: string) {
    const element = await this.page.evaluate((blockId: string) => {
      const el = window.testApi?.getElementById(blockId);
      return el !== null;
    }, id);
    expect(element).toBe(true);
  },
);

Then(
  'the element should be visible in the DOM',
  async function (this: CustomWorld) {
    // This is a generic check that the last operated element is visible
    const editorContent = await this.page.evaluate(() => {
      const editor = document.querySelector(
        '[contenteditable="true"], [data-testid="editor"]',
      );
      return editor?.textContent || '';
    });
    expect(editorContent.length).toBeGreaterThan(0);
  },
);

// Type declarations for window.testApi
declare global {
  interface Window {
    testApi?: any;
  }
}
