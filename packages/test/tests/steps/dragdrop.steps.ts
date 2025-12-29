import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

interface CustomWorld {
  browser: any;
  context: any;
  page: any;
}

// Helper function to create a test file buffer
function createTestFileBuffer(filename: string, type: string): Buffer {
  if (type.startsWith('image/')) {
    // Create a minimal PNG (1x1 transparent pixel)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    return pngData;
  } else if (type === 'application/pdf') {
    // Create a minimal PDF
    const pdfContent =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF';
    return Buffer.from(pdfContent, 'utf-8');
  } else {
    return Buffer.from('Test document content', 'utf-8');
  }
}

Then(
  'the drag and drop zone should be visible',
  async function (this: CustomWorld) {
    const dropZone = this.page.locator('[class*="dropZone"]').first();
    await expect(dropZone).toBeVisible();
  },
);

When('I drag a file over the drop zone', async function (this: CustomWorld) {
  const dropZone = this.page.locator('[class*="dropZone"]').first();

  // Create a data transfer with a test file and dispatch to the editor element
  await this.page.evaluate(() => {
    const dropZone = document.querySelector('[class*="dropZone"]');
    const editor = dropZone?.querySelector('pre');
    if (editor) {
      // Create a test file to add to dataTransfer
      const file = new File(['test content'], 'test.png', {
        type: 'image/png',
      });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const dragEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
      });
      editor.dispatchEvent(dragEvent);
    }
  });

  await this.page.waitForTimeout(100);
});

When(
  'I drag the file away from the drop zone',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      const dropZone = document.querySelector('[class*="dropZone"]');
      const editor = dropZone?.querySelector('pre');
      if (editor) {
        // Create a test file to add to dataTransfer
        const file = new File(['test content'], 'test.png', {
          type: 'image/png',
        });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const dragEvent = new DragEvent('dragleave', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dataTransfer,
        });
        editor.dispatchEvent(dragEvent);
      }
    });

    await this.page.waitForTimeout(100);
  },
);

Then(
  'the drop indicator should be visible',
  async function (this: CustomWorld) {
    const dropIndicator = this.page.locator('[class*="dropIndicator"]').first();
    await expect(dropIndicator).toBeVisible();
  },
);

Then(
  'the drop indicator should not be visible',
  async function (this: CustomWorld) {
    const dropIndicator = this.page.locator('[class*="dropIndicator"]').first();
    await expect(dropIndicator).not.toBeVisible();
  },
);

When(
  'I drop an image file {string} into the drop zone',
  async function (this: CustomWorld, filename: string) {
    const fileType = filename.endsWith('.png')
      ? 'image/png'
      : filename.endsWith('.jpg')
      ? 'image/jpeg'
      : filename.endsWith('.gif')
      ? 'image/gif'
      : 'image/png';

    const fileBuffer = createTestFileBuffer(filename, fileType);
    const base64Data = fileBuffer.toString('base64');

    await this.page.evaluate(
      ({
        filename,
        fileType,
        base64Data,
      }: {
        filename: string;
        fileType: string;
        base64Data: string;
      }) => {
        const dropZone = document.querySelector('[class*="dropZone"]');
        const editor = dropZone?.querySelector('pre');
        if (editor) {
          // Convert base64 to Uint8Array
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const file = new File([bytes], filename, { type: fileType });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer: dataTransfer,
          });

          editor.dispatchEvent(dropEvent);
        }
      },
      { filename, fileType, base64Data },
    );

    await this.page.waitForTimeout(200);
  },
);

When(
  'I drop a document file {string} into the drop zone',
  async function (this: CustomWorld, filename: string) {
    const fileType = filename.endsWith('.pdf')
      ? 'application/pdf'
      : filename.endsWith('.doc')
      ? 'application/msword'
      : filename.endsWith('.docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';

    const fileBuffer = createTestFileBuffer(filename, fileType);
    const base64Data = fileBuffer.toString('base64');

    await this.page.evaluate(
      ({
        filename,
        fileType,
        base64Data,
      }: {
        filename: string;
        fileType: string;
        base64Data: string;
      }) => {
        const dropZone = document.querySelector('[class*="dropZone"]');
        const editor = dropZone?.querySelector('pre');
        if (editor) {
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const file = new File([bytes], filename, { type: fileType });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer: dataTransfer,
          });

          editor.dispatchEvent(dropEvent);
        }
      },
      { filename, fileType, base64Data },
    );

    await this.page.waitForTimeout(200);
  },
);

When(
  'I drop multiple files into the drop zone',
  async function (this: CustomWorld, dataTable: any) {
    const files = dataTable.hashes();
    const filesData = files.map((file: any) => {
      const buffer = createTestFileBuffer(file.filename, file.type);
      return {
        filename: file.filename,
        type: file.type,
        base64Data: buffer.toString('base64'),
      };
    });

    await this.page.evaluate(
      (
        filesData: Array<{
          filename: string;
          type: string;
          base64Data: string;
        }>,
      ) => {
        const dropZone = document.querySelector('[class*="dropZone"]');
        const editor = dropZone?.querySelector('pre');
        if (editor) {
          const dataTransfer = new DataTransfer();

          filesData.forEach((fileData: any) => {
            const binaryString = atob(fileData.base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const file = new File([bytes], fileData.filename, {
              type: fileData.type,
            });
            dataTransfer.items.add(file);
          });

          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer: dataTransfer,
          });

          editor.dispatchEvent(dropEvent);
        }
      },
      filesData,
    );

    await this.page.waitForTimeout(300);
  },
);

Then(
  'an image element should be displayed in the editor',
  async function (this: CustomWorld) {
    const imageElement = this.page
      .locator('pre span[data-block-type="image"] img')
      .first();
    await expect(imageElement).toBeVisible({ timeout: 2000 });
  },
);

Then(
  'the image should have the correct source',
  async function (this: CustomWorld) {
    const imageElement = this.page
      .locator('pre span[data-block-type="image"] img')
      .first();
    const src = await imageElement.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('blob:');
  },
);

Then(
  'a document icon should be displayed in the editor',
  async function (this: CustomWorld) {
    const documentIcon = this.page
      .locator('pre span[data-block-type="document"] img')
      .first();
    await expect(documentIcon).toBeVisible({ timeout: 2000 });
  },
);

Then(
  'the document icon should represent a PDF file',
  async function (this: CustomWorld) {
    const documentIcon = this.page
      .locator('pre span[data-block-type="document"] img')
      .first();
    const src = await documentIcon.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('data:image/svg+xml');
  },
);

Then(
  'the editor should contain {int} file blocks',
  async function (this: CustomWorld, count: number) {
    const fileBlocks = this.page.locator('pre span[data-block-type]');
    await expect(fileBlocks).toHaveCount(count, { timeout: 2000 });
  },
);

Then(
  'there should be {int} image elements',
  async function (this: CustomWorld, count: number) {
    const imageElements = this.page.locator(
      'pre span[data-block-type="image"]',
    );
    await expect(imageElements).toHaveCount(count);
  },
);

Then(
  'there should be {int} document icon',
  async function (this: CustomWorld, count: number) {
    const documentIcons = this.page.locator(
      'pre span[data-block-type="document"]',
    );
    await expect(documentIcons).toHaveCount(count);
  },
);

When('I select the image in the editor', async function (this: CustomWorld) {
  const imageContainer = this.page
    .locator('pre span[data-block-type="image"]')
    .first();

  // Click the image to focus it
  await imageContainer.click();

  // Select the image container using JavaScript
  await this.page.evaluate(() => {
    const container = document.querySelector(
      'pre span[data-block-type="image"]',
    ) as HTMLElement;
    if (container) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNode(container);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  });

  await this.page.waitForTimeout(100);
});

When(
  'I select the document icon in the editor',
  async function (this: CustomWorld) {
    const documentContainer = this.page
      .locator('pre span[data-block-type="document"]')
      .first();

    // Click the icon to focus it
    await documentContainer.click();

    // Select the icon container using JavaScript
    await this.page.evaluate(() => {
      const container = document.querySelector(
        'pre span[data-block-type="document"]',
      ) as HTMLElement;
      if (container) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNode(container);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });

    await this.page.waitForTimeout(100);
  },
);

When('I press Delete', async function (this: CustomWorld) {
  await this.page.keyboard.press('Delete');
  await this.page.waitForTimeout(200);
});

Then(
  'the image should be removed from the editor',
  async function (this: CustomWorld) {
    const imageElement = this.page.locator('pre span[data-block-type="image"]');
    await expect(imageElement).toHaveCount(0, { timeout: 2000 });
  },
);

Then(
  'the document icon should be removed from the editor',
  async function (this: CustomWorld) {
    const documentIcon = this.page.locator(
      'pre span[data-block-type="document"]',
    );
    await expect(documentIcon).toHaveCount(0, { timeout: 2000 });
  },
);

When(
  'I hover over the image in the editor',
  async function (this: CustomWorld) {
    const imageContainer = this.page
      .locator('pre span[data-block-type="image"]')
      .first();
    await imageContainer.hover();
    await this.page.waitForTimeout(200);
  },
);

When(
  'I hover over the document icon in the editor',
  async function (this: CustomWorld) {
    const documentContainer = this.page
      .locator('pre span[data-block-type="document"]')
      .first();
    await documentContainer.hover();
    await this.page.waitForTimeout(200);
  },
);

When(
  'I hover over the first image in the editor',
  async function (this: CustomWorld) {
    const imageContainer = this.page
      .locator('pre span[data-block-type="image"]')
      .first();
    await imageContainer.hover();
    await this.page.waitForTimeout(200);
  },
);

Then(
  'the delete button should be visible on the image',
  async function (this: CustomWorld) {
    const deleteButton = this.page
      .locator('pre span[data-block-type="image"] .media-delete-btn')
      .first();
    await expect(deleteButton).toBeVisible({ timeout: 2000 });
  },
);

Then(
  'the delete button should be visible on the document',
  async function (this: CustomWorld) {
    const deleteButton = this.page
      .locator('pre span[data-block-type="document"] .media-delete-btn')
      .first();
    await expect(deleteButton).toBeVisible({ timeout: 2000 });
  },
);

Then(
  'the delete button should not be visible on the image',
  async function (this: CustomWorld) {
    const deleteButton = this.page
      .locator('pre span[data-block-type="image"] .media-delete-btn')
      .first();
    await expect(deleteButton).not.toBeVisible();
  },
);

When(
  'I click the delete button on the image',
  async function (this: CustomWorld) {
    const deleteButton = this.page
      .locator('pre span[data-block-type="image"] .media-delete-btn')
      .first();
    await deleteButton.click();
    await this.page.waitForTimeout(200);
  },
);

When(
  'I click the delete button on the document',
  async function (this: CustomWorld) {
    const deleteButton = this.page
      .locator('pre span[data-block-type="document"] .media-delete-btn')
      .first();
    await deleteButton.click();
    await this.page.waitForTimeout(200);
  },
);

When(
  'I click the delete button on the first image',
  async function (this: CustomWorld) {
    const deleteButton = this.page
      .locator('pre span[data-block-type="image"] .media-delete-btn')
      .first();
    await deleteButton.click();
    await this.page.waitForTimeout(200);
  },
);
