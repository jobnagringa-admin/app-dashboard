import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Visual regression tests for module pages
 */

const modulePages = [
  { name: 'intro', path: '/modulo/intro' },
  { name: 'linkedin', path: '/modulo/linkedin' },
  { name: 'dev-interviews', path: '/modulo/dev-interviews' },
  { name: 'contabilidade', path: '/modulo/contabilidade' },
  { name: 'negociacao', path: '/modulo/negociacao' },
  { name: 'empresas', path: '/modulo/empresas' },
  { name: 'conteudo', path: '/modulo/conteudo' },
  { name: 'networking', path: '/modulo/networking' },
  { name: 'entrevista', path: '/modulo/entrevista' },
];

async function openPageForScreenshot(testPage: Page, path: string) {
  await testPage.goto(path, { waitUntil: 'domcontentloaded' });
  await testPage.waitForTimeout(1000);
}

test.describe('Module Pages Visual Regression', () => {
  for (const page of modulePages) {
    test(`${page.name} - desktop`, async ({ page: testPage }) => {
      await openPageForScreenshot(testPage, page.path);

      const screenshot = await testPage.screenshot({ fullPage: true });
      expect(screenshot).toMatchSnapshot(`${page.name}-desktop.png`);
    });

    test(`${page.name} - mobile`, async ({ page: testPage }) => {
      await testPage.setViewportSize({ width: 375, height: 667 });
      await openPageForScreenshot(testPage, page.path);

      const screenshot = await testPage.screenshot({ fullPage: true });
      expect(screenshot).toMatchSnapshot(`${page.name}-mobile.png`);
    });
  }
});
