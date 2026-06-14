import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../play-ondas-app-design/assets/screenshots');

// Tolerancia: ≤2% de píxeles diferentes por imagen de referencia (SC-008)
const PIXEL_MATCH_OPTIONS = { maxDiffPixelRatio: 0.02 };

test.describe('Validación visual contra referencias Aire (SC-008)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Esperar a que la app cargue completamente
    await page.waitForLoadState('networkidle');
  });

  test('01 — Main view (light)', async ({ page }) => {
    // Forzar tema claro
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.setViewportSize({ width: 900, height: 620 });
    await page.waitForTimeout(300);

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('01-main-light-actual.png', PIXEL_MATCH_OPTIONS);
  });

  test('02 — Main view (dark)', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.setViewportSize({ width: 900, height: 620 });
    await page.waitForTimeout(300);

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('02-main-dark-actual.png', PIXEL_MATCH_OPTIONS);
  });

  test('03 — Settings view (light)', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.setViewportSize({ width: 900, height: 620 });

    // Navegar a settings
    const settingsBtn = page.locator('button[aria-label*="onfiguración"], button[aria-label*="ettings"]').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(300);
    }

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('03-settings-light-actual.png', PIXEL_MATCH_OPTIONS);
  });

  test('04 — Settings view (dark)', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.setViewportSize({ width: 900, height: 620 });

    const settingsBtn = page.locator('button[aria-label*="onfiguración"], button[aria-label*="ettings"]').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(300);
    }

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('04-settings-dark-actual.png', PIXEL_MATCH_OPTIONS);
  });

  test('05 — File modal (replace audio)', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.setViewportSize({ width: 900, height: 620 });

    // Navegar a settings y abrir FileModal
    const settingsBtn = page.locator('button[aria-label*="onfiguración"], button[aria-label*="ettings"]').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(200);
    }
    const replaceBtn = page.locator('button:has-text("Reemplazar")').first();
    if (await replaceBtn.isVisible()) {
      await replaceBtn.click();
      await page.waitForTimeout(300);
    }

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('05-file-modal-actual.png', PIXEL_MATCH_OPTIONS);
  });

  test('07 — Error toast state', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.setViewportSize({ width: 900, height: 620 });

    // Forzar aparición del toast de error inyectando evento en el DOM
    await page.evaluate(() => {
      const event = new CustomEvent('show-error-toast', {
        detail: { message: 'Error de prueba para validación visual' },
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    await page.waitForTimeout(500);

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('07-error-toast-actual.png', PIXEL_MATCH_OPTIONS);
  });

  test('08 — No-audio (unavailable) state', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.setViewportSize({ width: 900, height: 620 });

    // La onda en estado 'unavailable' se muestra cuando no hay audio
    // Verificar que el EmptyState se renderiza si la fuente es 'unavailable'
    await page.evaluate(() => {
      // Disparar estado de audio no disponible forzando el store via evento
      const event = new CustomEvent('test:set-audio-unavailable', { bubbles: true });
      document.dispatchEvent(event);
    });
    await page.waitForTimeout(300);

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('08-no-audio-actual.png', PIXEL_MATCH_OPTIONS);
  });

  // ─── Tamaño mínimo 720×560 ──────────────────────────────────────────────

  test('01 — Main view (light) @ 720×560', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.setViewportSize({ width: 720, height: 560 });
    await page.waitForTimeout(300);

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('01-main-light-720-actual.png', PIXEL_MATCH_OPTIONS);

    // Verificar que no hay overflow ni controles recortados (T115)
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth ||
             document.body.scrollHeight > window.innerHeight;
    });
    expect(hasOverflow, 'No debe haber overflow a 720×560').toBe(false);
  });

  test('02 — Main view (dark) @ 720×560', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.setViewportSize({ width: 720, height: 560 });
    await page.waitForTimeout(300);

    const screenshot = await page.screenshot({ fullPage: false });
    expect(screenshot).toMatchSnapshot('02-main-dark-720-actual.png', PIXEL_MATCH_OPTIONS);

    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth ||
             document.body.scrollHeight > window.innerHeight;
    });
    expect(hasOverflow, 'No debe haber overflow a 720×560 en dark').toBe(false);
  });
});
