const { test, expect } = require('@playwright/test');

test('authenticated hard refresh and protected route entry have no client console errors', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    page.on('pageerror', err => {
        pageErrors.push(err.message);
    });

    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);

    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(page.url()).toMatch(/localhost:3000\/(login|dashboard)/);
});
