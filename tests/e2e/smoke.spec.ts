import { test, expect } from '@playwright/test';

// Nombres exactos según WAVE_CATEGORIES en src/lib/data/waves.ts
const WAVE_NAMES = ['Gamma', 'Beta', 'Alfa', 'Theta · Delta', 'Ruido marrón'];

test.describe('Smoke — arranque y elementos esenciales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('01 — CSS de diseño cargado: tokens de color presentes', async ({ page }) => {
    // Si Tailwind o tokens.css no se cargaron, --color-bg estará vacío
    const colorBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
    );
    expect(colorBg, '--color-bg debe estar definido por los tokens Aire').not.toBe('');

    // Al menos un elemento raíz visible (la app no queda en blanco)
    await expect(page.locator('body').first()).not.toBeEmpty();
  });

  test('02 — sidebar lista las 5 categorías de ondas', async ({ page }) => {
    for (const name of WAVE_NAMES) {
      await expect(
        page.getByRole('option', { name, exact: false }),
        `La onda "${name}" debe ser visible en el sidebar`
      ).toBeVisible();
    }
  });

  test('03 — Gamma está seleccionada por defecto', async ({ page }) => {
    const gamma = page.getByRole('option', { name: 'Gamma', exact: false });
    await expect(gamma).toHaveAttribute('aria-selected', 'true');
  });

  test('04 — botones de transporte visibles con aria-labels correctos', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Reproducir' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Detener' })).toBeVisible();
  });

  test('05 — slider de volumen accesible con valor entre 0 y 100', async ({ page }) => {
    const slider = page.getByRole('slider', { name: 'Control de volumen' });
    await expect(slider).toBeVisible();
    const now = Number(await slider.getAttribute('aria-valuenow'));
    expect(now).toBeGreaterThanOrEqual(0);
    expect(now).toBeLessThanOrEqual(100);
  });

  test('06 — sin overflow horizontal ni vertical a 986×560 (tamaño por defecto)', async ({ page }) => {
    await page.setViewportSize({ width: 986, height: 560 });
    const overflow = await page.evaluate(() =>
      document.body.scrollWidth > window.innerWidth ||
      document.body.scrollHeight > window.innerHeight
    );
    expect(overflow, 'No debe haber overflow a 986×560').toBe(false);
  });
});

test.describe('Interacciones — selección de onda y controles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('07 — clicar en Beta la marca como seleccionada y deselecciona Gamma', async ({ page }) => {
    const gamma = page.getByRole('option', { name: 'Gamma', exact: false });
    const beta = page.getByRole('option', { name: 'Beta', exact: false });

    await expect(gamma).toHaveAttribute('aria-selected', 'true');
    await beta.click();
    await expect(beta).toHaveAttribute('aria-selected', 'true');
    await expect(gamma).toHaveAttribute('aria-selected', 'false');
  });

  test('08 — se puede recorrer el sidebar con el teclado (tabindex)', async ({ page }) => {
    const firstOption = page.getByRole('option').first();
    await firstOption.focus();
    await expect(firstOption).toBeFocused();
  });

  test('09 — ningún error JS no controlado en el arranque', async ({ page }) => {
    const unhandledErrors: string[] = [];
    page.on('pageerror', (err) => unhandledErrors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Filtramos errores esperados de Tauri IPC (no hay backend en tests web)
    const criticalErrors = unhandledErrors.filter(
      (msg) => !msg.toLowerCase().includes('tauri') && !msg.toLowerCase().includes('ipc')
    );
    expect(
      criticalErrors,
      `Errores JS no controlados: ${criticalErrors.join('\n')}`
    ).toHaveLength(0);
  });
});
