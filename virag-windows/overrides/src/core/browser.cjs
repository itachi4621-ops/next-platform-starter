const path = require('path');
const { app } = require('electron');
const { chromium } = require('playwright');

class BrowserController {
  constructor(getConfig) {
    this.getConfig = getConfig;
    this.context = null;
    this.page = null;
  }

  async ensure() {
    if (this.context && this.page && !this.page.isClosed()) return this.page;
    const userDataDir = path.join(app.getPath('userData'), 'browser-profile');
    const opts = {
      headless: Boolean(this.getConfig().browserHeadless),
      viewport: { width: 1440, height: 950 },
      args: ['--disable-blink-features=AutomationControlled']
    };
    if (process.platform === 'win32') {
      try {
        this.context = await chromium.launchPersistentContext(userDataDir, { ...opts, channel:'msedge' });
      } catch (edgeError) {
        console.warn('Edge launch failed, trying bundled Playwright Chromium:', edgeError.message);
        this.context = await chromium.launchPersistentContext(userDataDir, opts);
      }
    } else {
      this.context = await chromium.launchPersistentContext(userDataDir, opts);
    }
    this.page = this.context.pages()[0] || await this.context.newPage();
    return this.page;
  }

  async navigate(url) {
    const page = await this.ensure();
    const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
    return { url: page.url(), title: await page.title() };
  }

  async snapshot() {
    const page = await this.ensure();
    const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    const controls = await page.locator('a,button,input,textarea,select,[role="button"]').evaluateAll(els =>
      els.slice(0, 120).map((el, i) => ({
        i,
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0,160),
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || '',
        id: el.id || ''
      }))
    ).catch(() => []);
    return { url: page.url(), title: await page.title(), text: text.slice(0, 18000), controls };
  }

  async click({ text, selector, index }) {
    const page = await this.ensure();
    let loc;
    if (selector) loc = page.locator(selector).first();
    else if (Number.isInteger(index)) loc = page.locator('a,button,input,textarea,select,[role="button"]').nth(index);
    else loc = page.getByText(text, { exact: false }).first();
    await loc.click({ timeout: 10000 });
    await page.waitForTimeout(350);
    return { ok: true, url: page.url(), title: await page.title() };
  }

  async fill({ selector, label, placeholder, value }) {
    const page = await this.ensure();
    let loc;
    if (selector) loc = page.locator(selector).first();
    else if (label) loc = page.getByLabel(label, { exact: false }).first();
    else if (placeholder) loc = page.getByPlaceholder(placeholder, { exact: false }).first();
    else throw new Error('Need selector, label, or placeholder');
    await loc.fill(String(value), { timeout: 10000 });
    return { ok: true };
  }

  async press(key) { const page = await this.ensure(); await page.keyboard.press(key); return { ok: true }; }
  async close() { if (this.context) await this.context.close(); this.context = null; this.page = null; return { ok: true }; }
}

module.exports = { BrowserController };
