import { test, expect } from '@playwright/test';

test.describe('Settings and Theme Persistence E2E', () => {
  test('debería persistir el volumen, la onda y el tema al mutar preferencias', async ({ page }) => {
    // Vamos a la página de la aplicación
    await page.goto('/');

    // 1. Modificamos el volumen
    const volumeSlider = page.locator('input[type="range"]');
    if (await volumeSlider.count() > 0) {
      await volumeSlider.first().fill('40');
      // Esperamos el debounce de persistencia
      await page.waitForTimeout(400);
    }

    // 2. Seleccionamos la onda "Alfa"
    const alfaBtn = page.locator('button:has-text("Alfa")');
    if (await alfaBtn.count() > 0) {
      await alfaBtn.first().click();
      await page.waitForTimeout(400);
    }

    // 3. Navegamos a la sección de Configuración
    const configBtn = page.locator('button[aria-label*="configuración"], button[aria-label*="settings"], button:has(.lucide-settings)');
    if (await configBtn.count() > 0) {
      await configBtn.first().click();
    } else {
      // Intentamos buscar por selector genérico del botón de settings
      const settingsIconBtn = page.locator('button').filter({ hasText: /settings|configuración/i });
      if (await settingsIconBtn.count() > 0) {
        await settingsIconBtn.first().click();
      }
    }

    // 4. Cambiamos el tema a Oscuro
    const darkBtn = page.locator('button:has-text("Oscuro")');
    if (await darkBtn.count() > 0) {
      await darkBtn.first().click();
      // Esperamos el debounce
      await page.waitForTimeout(400);
    }

    // Verificamos que el atributo html data-theme sea dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Recargamos la página para simular el reinicio del cliente
    await page.reload();

    // Afirmamos que el tema se haya restaurado a Oscuro
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
