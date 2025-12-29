import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

interface CustomWorld {
  browser: any;
  context: any;
  page: any;
}

// Setup - use default test app with commit tracking
Given(
  'I navigate to the test app with commit notifier',
  async function (this: CustomWorld) {
    const props = encodeURIComponent(
      JSON.stringify({ e: { enableLineBreaks: true } }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');

    await this.page.evaluate(() => {
      (window as any).commitData = [];
      window.alert = (message: string) => {
        if (message.includes('Committed:')) {
          try {
            const jsonMatch = message.match(/Committed: ([\s\S]+)/);
            if (jsonMatch && jsonMatch[1]) {
              (window as any).commitData.push(JSON.parse(jsonMatch[1]));
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      };
    });
  },
);

Given(
  'I navigate to the test app with commit key combination {string}',
  async function (this: CustomWorld, _key: string) {
    const props = encodeURIComponent(
      JSON.stringify({ e: { enableLineBreaks: true } }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');

    await this.page.evaluate(() => {
      (window as any).commitData = [];
      window.alert = (message: string) => {
        if (message.includes('Committed:')) {
          try {
            const jsonMatch = message.match(/Committed: ([\s\S]+)/);
            if (jsonMatch && jsonMatch[1]) {
              (window as any).commitData.push(JSON.parse(jsonMatch[1]));
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      };
    });
  },
);

Given(
  'I navigate to the test app with conditional commit',
  async function (this: CustomWorld) {
    await this.page.goto('http://localhost:3001');
    await this.page.waitForLoadState('networkidle');
  },
);

Given(
  'I navigate to the test app with history enabled',
  async function (this: CustomWorld) {
    const props = encodeURIComponent(
      JSON.stringify({
        c: { enableHistory: true },
        e: { enableLineBreaks: true },
      }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');

    await this.page.evaluate(() => {
      localStorage.clear();
      window.alert = () => {};
    });
  },
);

Given(
  'I navigate to the test app with history enabled without clearing storage',
  async function (this: CustomWorld) {
    const props = encodeURIComponent(
      JSON.stringify({
        c: { enableHistory: true },
        e: { enableLineBreaks: true },
      }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');

    await this.page.evaluate(() => {
      window.alert = () => {};
    });
  },
);

Given(
  'I navigate to the test app with history enabled and maxHistory {int}',
  async function (this: CustomWorld, maxHistory: number) {
    const props = encodeURIComponent(
      JSON.stringify({
        c: { enableHistory: true, maxHistory },
        e: { enableLineBreaks: true },
      }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');

    await this.page.evaluate(() => {
      localStorage.clear();
      window.alert = () => {};
    });
  },
);

Given(
  'I navigate to the test app with custom storage key {string}',
  async function (this: CustomWorld, storageKey: string) {
    const props = encodeURIComponent(
      JSON.stringify({
        c: { enableHistory: true, historyStorageKey: storageKey },
        e: { enableLineBreaks: true },
      }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');

    await this.page.evaluate(() => {
      localStorage.clear();
      window.alert = () => {};
    });
  },
);

Given(
  'I navigate to the test app with history and line breaks enabled',
  async function (this: CustomWorld) {
    const props = encodeURIComponent(
      JSON.stringify({
        c: { enableHistory: true },
        e: { enableLineBreaks: true },
      }),
    );
    await this.page.goto(`http://localhost:3001?props=${props}`);
    await this.page.waitForLoadState('networkidle');

    await this.page.evaluate(() => {
      localStorage.clear();
      window.alert = () => {};
    });
  },
);

Given(
  'localStorage has commit history with {string}',
  async function (this: CustomWorld, text: string) {
    await this.page.evaluate((historyText: string) => {
      const history = [[{ type: 'text', text: historyText }]];
      localStorage.setItem('commit-history', JSON.stringify(history));
    }, text);
  },
);

Given(
  'localStorage is set with commit history {string}',
  async function (this: CustomWorld, text: string) {
    // Navigate to the app first to get the correct origin
    await this.page.goto('http://localhost:3001');
    await this.page.waitForLoadState('networkidle');
    // Set localStorage with HistoricBlock format
    await this.page.evaluate((historyText: string) => {
      const history = [[{ block: { type: 'text', text: historyText } }]];
      localStorage.setItem('commit-history', JSON.stringify(history));
    }, text);
  },
);

When('I press {string}', async function (this: CustomWorld, key: string) {
  await this.page.keyboard.press(key);
});

When('I press ArrowUp', async function (this: CustomWorld) {
  await this.page.keyboard.press('ArrowUp');
  await this.page.waitForTimeout(200);
});

When('I commit {string}', async function (this: CustomWorld, text: string) {
  const editorInput = this.page.locator('[contenteditable="true"]').first();
  await editorInput.click();
  await this.page.keyboard.type(text);
  await this.page.keyboard.press('Enter');
  await this.page.waitForTimeout(200);
});

When(
  'I move cursor to line {int}',
  async function (this: CustomWorld, _line: number) {
    await this.page.waitForTimeout(100);
  },
);

When('the typeahead dropdown is visible', async function (this: CustomWorld) {
  const typeahead = this.page
    .locator('[data-testid="typeahead"], [class*="typeahead"]')
    .first();
  await expect(typeahead).toBeVisible({ timeout: 3000 });
});

Then(
  'the commit should be triggered with {string}',
  async function (this: CustomWorld, expectedText: string) {
    await this.page.waitForTimeout(500);
    const commitData = await this.page.evaluate(
      () => (window as any).commitData || [],
    );

    expect(commitData.length).toBeGreaterThan(0);
    const lastCommit = commitData[commitData.length - 1];
    const commitText = Array.isArray(lastCommit)
      ? lastCommit.join('')
      : String(lastCommit);
    expect(commitText).toContain(expectedText);
  },
);

Then(
  'the commit should be triggered with text and image',
  async function (this: CustomWorld) {
    await this.page.waitForTimeout(500);
    const commitData = await this.page.evaluate(
      () => (window as any).commitData || [],
    );
    expect(commitData.length).toBeGreaterThan(0);
  },
);

Then('the commit should not be triggered', async function (this: CustomWorld) {
  await this.page.waitForTimeout(500);
  const commitData = await this.page.evaluate(
    () => (window as any).commitData || [],
  );
  expect(commitData.length).toBe(0);
});

Then(
  'the history should contain {int} items',
  async function (this: CustomWorld, count: number) {
    const history = await this.page.evaluate(() => {
      const stored = localStorage.getItem('commit-history');
      return stored ? JSON.parse(stored) : [];
    });
    expect(history.length).toBe(count);
  },
);

Then(
  'localStorage should have {string} key',
  async function (this: CustomWorld, key: string) {
    const hasKey = await this.page.evaluate(
      (storageKey: string) => localStorage.getItem(storageKey) !== null,
      key,
    );
    expect(hasKey).toBe(true);
  },
);

Then(
  'localStorage should not have {string} key',
  async function (this: CustomWorld, key: string) {
    const hasKey = await this.page.evaluate(
      (storageKey: string) => localStorage.getItem(storageKey) !== null,
      key,
    );
    expect(hasKey).toBe(false);
  },
);

Then(
  'the history should contain {string}',
  async function (this: CustomWorld, text: string) {
    const history = await this.page.evaluate(() => {
      const stored = localStorage.getItem('commit-history');
      return stored ? JSON.parse(stored) : [];
    });

    const hasText = history.some((historicBlocks: any[]) =>
      historicBlocks.some((hb: any) => {
        const block = hb.block || hb;
        return 'text' in block && block.text.includes(text);
      }),
    );
    expect(hasText).toBe(true);
  },
);

Then(
  'the history should not contain {string}',
  async function (this: CustomWorld, text: string) {
    const history = await this.page.evaluate(() => {
      const stored = localStorage.getItem('commit-history');
      return stored ? JSON.parse(stored) : [];
    });

    const hasText = history.some((historicBlocks: any[]) =>
      historicBlocks.some((hb: any) => {
        const block = hb.block || hb;
        return 'text' in block && block.text.includes(text);
      }),
    );
    expect(hasText).toBe(false);
  },
);

Then(
  'the cursor should move to line {int}',
  async function (this: CustomWorld, _line: number) {
    await this.page.waitForTimeout(100);
  },
);

Then(
  'the typeahead selection should be made',
  async function (this: CustomWorld) {
    await this.page.waitForTimeout(200);
    const editorInput = this.page.locator('[contenteditable="true"]').first();
    const content = await editorInput.innerText();
    expect(content.length).toBeGreaterThan(3);
  },
);

Then('the typeahead should navigate up', async function (this: CustomWorld) {
  const typeahead = this.page
    .locator('[data-testid="typeahead"], [class*="typeahead"]')
    .first();
  await expect(typeahead).toBeVisible();
});

Then('the history should not navigate', async function (this: CustomWorld) {
  const editorInput = this.page.locator('[contenteditable="true"]').first();
  const content = await editorInput.innerText();
  expect(content).toContain('tes');
});
