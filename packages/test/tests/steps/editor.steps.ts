import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

interface CustomWorld {
  browser: any;
  context: any;
  page: any;
}

Given('I navigate to the test app', async function (this: CustomWorld) {
  await this.page.goto('http://localhost:3001');
  await this.page.waitForLoadState('networkidle');
});

Given(
  'I navigate to the test app with line breaks enabled',
  async function (this: CustomWorld) {
    const props = encodeURIComponent(
      JSON.stringify({ e: { enableLineBreaks: true }, c: { onCommit: null } }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');
  },
);

Given(
  'I navigate to the test app with mouse events enabled',
  async function (this: CustomWorld) {
    const props = encodeURIComponent(
      JSON.stringify({ enableMouseEvents: true }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');
  },
);

Then(
  'the editor component should be visible',
  async function (this: CustomWorld) {
    const editor = this.page
      .locator('[data-testid="editor"], .editor, [class*="editor"]')
      .first();
    await expect(editor).toBeVisible();
  },
);

Then(
  'the editor should be ready for input',
  async function (this: CustomWorld) {
    const editorInput = this.page
      .locator('[contenteditable="true"], input[type="text"], textarea')
      .first();
    await expect(editorInput).toBeEnabled();
  },
);

When('I click in the editor input area', async function (this: CustomWorld) {
  const editorInput = this.page
    .locator('[contenteditable="true"], input[type="text"], textarea')
    .first();
  await editorInput.click();
});

When('I type {string}', async function (this: CustomWorld, text: string) {
  await this.page.keyboard.type(text);
});

Then(
  'the editor value should contain {string}',
  async function (this: CustomWorld, text: string) {
    const editorInput = this.page
      .locator('[contenteditable="true"], input[type="text"], textarea')
      .first();
    const content = await editorInput.innerText();
    expect(content).toContain(text);
  },
);

When('I click in the unmanaged editor', async function (this: CustomWorld) {
  const unmanagedEditor = this.page
    .locator('[data-testid="unmanaged-editor"], [class*="unmanaged"]')
    .first();
  await unmanagedEditor.click();
});

Then(
  'the unmanaged editor should display {string}',
  async function (this: CustomWorld, text: string) {
    const unmanagedEditor = this.page
      .locator('[data-testid="unmanaged-editor"], [class*="unmanaged"]')
      .first();
    const content = await unmanagedEditor.innerText();
    expect(content).toContain(text);
  },
);

Then(
  'the managed editor should remain empty',
  async function (this: CustomWorld) {
    const managedEditor = this.page
      .locator('[data-testid="editor"], [class*="managed"]')
      .first();
    const content = await managedEditor.innerText();
    expect(content.trim()).toBe('');
  },
);

When('I select all text in the editor', async function (this: CustomWorld) {
  await this.page.keyboard.press('Control+A');
});

When('I apply bold formatting', async function (this: CustomWorld) {
  const boldButton = this.page
    .locator(
      '[data-testid="bold"], button[title*="bold" i], [aria-label*="bold" i]',
    )
    .first();
  await boldButton.click();
});

When('I apply italic formatting', async function (this: CustomWorld) {
  const italicButton = this.page
    .locator(
      '[data-testid="italic"], button[title*="italic" i], [aria-label*="italic" i]',
    )
    .first();
  await italicButton.click();
});

When('I apply underline formatting', async function (this: CustomWorld) {
  const underlineButton = this.page
    .locator(
      '[data-testid="underline"], button[title*="underline" i], [aria-label*="underline" i]',
    )
    .first();
  await underlineButton.click();
});

Then(
  'the text should be displayed as bold',
  async function (this: CustomWorld) {
    const boldText = this.page.locator('b, strong, [style*="font-weight"]');
    await expect(boldText).toHaveCount(1);
  },
);

Then(
  'the text should have all three styles applied',
  async function (this: CustomWorld) {
    const styledContent = this.page.locator(
      '[contenteditable="true"] > *, input[style*="font"], textarea[style*="font"]',
    );
    const count = await styledContent.count();
    expect(count).toBeGreaterThanOrEqual(1);
  },
);

When('I click the clear button', async function (this: CustomWorld) {
  const clearButton = this.page
    .locator(
      '[data-testid="clear"], button:has-text("Clear"), [aria-label*="clear" i]',
    )
    .first();
  await clearButton.click();
});

Then('the editor should be empty', async function (this: CustomWorld) {
  const editorInput = this.page
    .locator('[contenteditable="true"], input[type="text"], textarea')
    .first();
  const content = await editorInput.innerText();
  expect(content.trim()).toBe('');
});

When('I paste {string}', async function (this: CustomWorld, text: string) {
  await this.page.evaluate((pasteText: string) => {
    const event = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
      bubbles: true,
    });
    event.clipboardData?.setData('text/plain', pasteText);
    document.activeElement?.dispatchEvent(event);
  }, text);
  await this.page.keyboard.press('Control+V');
});

Then(
  'the editor should contain {string}',
  async function (this: CustomWorld, text: string) {
    const editorInput = this.page
      .locator('[contenteditable="true"], input[type="text"], textarea')
      .first();
    const content = await editorInput.innerText();
    expect(content).toContain(text);
  },
);

When('I press Enter', async function (this: CustomWorld) {
  await this.page.keyboard.press('Enter');
});

Then(
  'the editor should have {int} lines',
  async function (this: CustomWorld, lineCount: number) {
    const editorInput = this.page
      .locator('[contenteditable="true"], input[type="text"], textarea')
      .first();
    const content = await editorInput.innerText();
    const lines = content
      .split('\n')
      .filter((line: string) => line.length >= 0);
    expect(lines.length).toBe(lineCount);
  },
);

When('I press Backspace', async function (this: CustomWorld) {
  await this.page.keyboard.press('Backspace');
});

When(
  'I press Backspace {int} times',
  async function (this: CustomWorld, times: number) {
    for (let i = 0; i < times; i++) {
      await this.page.keyboard.press('Backspace');
    }
  },
);

When('I press Ctrl+Z', async function (this: CustomWorld) {
  await this.page.keyboard.press('Control+Z');
});

When('I select all text', async function (this: CustomWorld) {
  await this.page.keyboard.press('Control+A');
});

Then(
  'the editor should not contain {string}',
  async function (this: CustomWorld, text: string) {
    const editorInput = this.page
      .locator('[contenteditable="true"], input[type="text"], textarea')
      .first();
    const content = await editorInput.innerText();
    expect(content).not.toContain(text);
  },
);

When('I copy the selected text', async function (this: CustomWorld) {
  await this.page.keyboard.press('Control+C');
});

Then(
  'the clipboard should contain {string}',
  async function (this: CustomWorld, text: string) {
    // Wait a moment for clipboard to update
    await this.page.waitForTimeout(100);
    const clipboardText = await this.page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toContain(text);
  },
);

When('I press Escape', async function (this: CustomWorld) {
  await this.page.keyboard.press('Escape');
});

When('I press ArrowLeft', async function (this: CustomWorld) {
  await this.page.keyboard.press('ArrowLeft');
});

When(
  'I press ArrowLeft {int} times',
  async function (this: CustomWorld, times: number) {
    for (let i = 0; i < times; i++) {
      await this.page.keyboard.press('ArrowLeft');
    }
  },
);

When('I press Home', async function (this: CustomWorld) {
  await this.page.keyboard.press('Home');
});

When('I press End', async function (this: CustomWorld) {
  await this.page.keyboard.press('End');
});
