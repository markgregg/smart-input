import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

interface CustomWorld {
  browser: any;
  context: any;
  page: any;
  apiResult?: any;
  eventsFired?: string[];
}

// Setup event listeners (reset events)
Given(
  'I set up a click event listener for styled blocks',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      console.log(
        'resetEvents called, enableMouseEvents:',
        (window as any).testEnableMouseEvents,
      );
      (window as any).resetEvents();
    });
    await this.page.waitForTimeout(100);
  },
);

Given(
  'I set up a mouseenter event listener for styled blocks',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      (window as any).resetEvents();
    });
    await this.page.waitForTimeout(100);
  },
);

Given(
  'I set up a mouseleave event listener for styled blocks',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      (window as any).resetEvents();
    });
    await this.page.waitForTimeout(100);
  },
);

Given(
  'I set up a mousedown event listener for styled blocks',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      (window as any).resetEvents();
    });
    await this.page.waitForTimeout(100);
  },
);

Given(
  'I set up a mouseup event listener for styled blocks',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      (window as any).resetEvents();
    });
    await this.page.waitForTimeout(100);
  },
);

Given(
  'I set up a mouseover event listener for styled blocks',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      (window as any).resetEvents();
    });
    await this.page.waitForTimeout(100);
  },
);

Given(
  'I set up a mousemove event listener for styled blocks',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      (window as any).resetEvents();
    });
    await this.page.waitForTimeout(100);
  },
);

Given(
  'I set up all mouse event listeners for styled blocks',
  async function (this: CustomWorld) {
    await this.page.evaluate(() => {
      (window as any).resetEvents();
    });
    await this.page.waitForTimeout(100);
  },
);

// Before inserting styled blocks, we need to modify the existing step to add event handlers
When(
  'I insert a styled block {string} with text {string} at position {int} using the API with event handlers',
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
                fontWeight: 'bold',
                color: '#4287f5',
              },
            },
            position,
          );
        });
      },
      { id, text, position },
    );
    await this.page.waitForTimeout(500);
    // Wait for the element to be in the DOM
    await this.page.waitForSelector(`#${id}`, { timeout: 5000 });
  },
);

// Mouse actions
When(
  'I click on the styled block {string}',
  async function (this: CustomWorld, id: string) {
    const element = this.page.locator(`#${id}`);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    await element.click();
    await this.page.waitForTimeout(100);
  },
);

When(
  'I hover over the styled block {string}',
  async function (this: CustomWorld, id: string) {
    const element = this.page.locator(`#${id}`);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    await element.hover();
    await this.page.waitForTimeout(100);
  },
);

When(
  'I move mouse away from the styled block {string}',
  async function (this: CustomWorld, id: string) {
    // Move mouse to a safe area (the body element)
    await this.page.mouse.move(0, 0);
    await this.page.waitForTimeout(100);
  },
);

When(
  'I press mouse down on the styled block {string}',
  async function (this: CustomWorld, id: string) {
    const element = this.page.locator(`#${id}`);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    const box = await element.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
    }
    await this.page.waitForTimeout(100);
  },
);

When(
  'I release mouse on the styled block {string}',
  async function (this: CustomWorld, id: string) {
    await this.page.mouse.up();
    await this.page.waitForTimeout(100);
  },
);

When(
  'I move mouse over the styled block {string}',
  async function (this: CustomWorld, id: string) {
    const element = this.page.locator(`#${id}`);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    await element.hover();
    await this.page.waitForTimeout(100);
  },
);

When(
  'I move mouse within the styled block {string}',
  async function (this: CustomWorld, id: string) {
    const element = this.page.locator(`#${id}`);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    const box = await element.boundingBox();
    if (box) {
      // Move to top-left of element
      await this.page.mouse.move(box.x + 2, box.y + 2);
      await this.page.waitForTimeout(50);
      // Move to center
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.waitForTimeout(50);
      // Move to bottom-right
      await this.page.mouse.move(box.x + box.width - 2, box.y + box.height - 2);
    }
    await this.page.waitForTimeout(100);
  },
);

When(
  'I perform mouse sequence on the styled block {string}',
  async function (this: CustomWorld, id: string) {
    const element = this.page.locator(`#${id}`);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    const box = await element.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      // Hover (triggers mouseenter, mouseover)
      await this.page.mouse.move(centerX, centerY);
      await this.page.waitForTimeout(50);

      // Mouse down
      await this.page.mouse.down();
      await this.page.waitForTimeout(50);

      // Mouse up
      await this.page.mouse.up();
      await this.page.waitForTimeout(50);

      // Click is triggered automatically by down+up
    }
    await this.page.waitForTimeout(100);
  },
);

// Assertions
Then(
  'the click event should have been triggered',
  async function (this: CustomWorld) {
    // Wait for React state to update the DOM
    await this.page.waitForTimeout(200);

    // Get debug info including addBlockEventListeners call info
    const logs = await this.page.evaluate(() => {
      const el = document.querySelector('#clickable') as HTMLElement;
      return {
        hasClickHandler: el && typeof el.onclick === 'function',
        elementExists: !!el,
        elementTag: el?.tagName,
        elementId: el?.id,
        lastAddBlockEventListeners: (window as any).lastAddBlockEventListeners,
      };
    });
    console.log('Debug info:', JSON.stringify(logs, null, 2));

    const eventsFired = await this.page
      .locator('#test-events-fired')
      .getAttribute('data-events');
    console.log('Events fired (data-events attribute):', eventsFired);
    const enableMouseEvents = await this.page.evaluate(
      () => (window as any).testEnableMouseEvents,
    );
    console.log('enableMouseEvents value:', enableMouseEvents);
    expect(eventsFired).toContain('click');
  },
);

Then(
  'the mouseenter event should have been triggered',
  async function (this: CustomWorld) {
    const eventsFired = await this.page
      .locator('#test-events-fired')
      .getAttribute('data-events');
    expect(eventsFired).toContain('mouseenter');
  },
);

Then(
  'the mouseleave event should have been triggered',
  async function (this: CustomWorld) {
    const eventsFired = await this.page
      .locator('#test-events-fired')
      .getAttribute('data-events');
    expect(eventsFired).toContain('mouseleave');
  },
);

Then(
  'the mousedown event should have been triggered',
  async function (this: CustomWorld) {
    const eventsFired = await this.page
      .locator('#test-events-fired')
      .getAttribute('data-events');
    expect(eventsFired).toContain('mousedown');
  },
);

Then(
  'the mouseup event should have been triggered',
  async function (this: CustomWorld) {
    const eventsFired = await this.page
      .locator('#test-events-fired')
      .getAttribute('data-events');
    expect(eventsFired).toContain('mouseup');
  },
);

Then(
  'the mouseover event should have been triggered',
  async function (this: CustomWorld) {
    const eventsFired = await this.page
      .locator('#test-events-fired')
      .getAttribute('data-events');
    expect(eventsFired).toContain('mouseover');
  },
);

Then(
  'the mousemove event should have been triggered',
  async function (this: CustomWorld) {
    const eventsFired = await this.page
      .locator('#test-events-fired')
      .getAttribute('data-events');
    expect(eventsFired).toContain('mousemove');
  },
);

Then(
  'the events should have fired in order {string}',
  async function (this: CustomWorld, expectedOrder: string) {
    const eventsStr = await this.page
      .locator('#test-events-fired')
      .getAttribute('data-events');
    const eventsFired = eventsStr
      ? eventsStr.split(',').filter((e: string) => e)
      : [];
    const expectedEvents: string[] = expectedOrder.split(',');

    // Check that all expected events were fired
    for (const event of expectedEvents) {
      expect(eventsFired).toContain(event);
    }

    // Check the order by finding the first occurrence of each expected event
    // and verifying they appear in the correct sequence
    let lastIndex = -1;
    for (const event of expectedEvents) {
      const index = eventsFired.indexOf(event);
      if (index <= lastIndex) {
        // If the first occurrence is before or at the last index, look for next occurrence
        let found = false;
        for (let i = lastIndex + 1; i < eventsFired.length; i++) {
          if (eventsFired[i] === event) {
            lastIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error(
            `Event "${event}" not found after previous event at index ${lastIndex}. Events: ${eventsFired.join(
              ',',
            )}`,
          );
        }
      } else {
        lastIndex = index;
      }
    }
  },
);

Then(
  'the event target should be the styled block {string}',
  async function (this: CustomWorld, id: string) {
    const targetId = await this.page
      .locator('#test-event-target')
      .getAttribute('data-target');
    expect(targetId).toBe(id);
  },
);
