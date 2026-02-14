import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for module pages
 */

const modulePages = [
  { name: 'intro', path: '/jng/modulo/intro' },
  { name: 'linkedin', path: '/jng/modulo/linkedin' },
  { name: 'dev-interviews', path: '/jng/modulo/dev-interviews' },
  { name: 'contabilidade', path: '/jng/modulo/contabilidade' },
  { name: 'negociacao', path: '/jng/modulo/negociacao' },
  { name: 'empresas', path: '/jng/modulo/empresas' },
  { name: 'conteudo', path: '/jng/modulo/conteudo' },
  { name: 'networking', path: '/jng/modulo/networking' },
  { name: 'entrevista', path: '/jng/modulo/entrevista' },
];

test.describe('Module Pages Visual Regression', () => {
  for (const page of modulePages) {
    test(`${page.name} - desktop`, async ({ page: testPage }) => {
      await testPage.goto(`http://localhost:4321${page.path}`);
      await testPage.waitForLoadState('networkidle');

      await expect(testPage).toHaveScreenshot(`${page.name}-desktop.png`, {
        fullPage: true,
      });
    });

    test(`${page.name} - mobile`, async ({ page: testPage }) => {
      testPage.setViewportSize({ width: 375, height: 667 });
      await testPage.goto(`http://localhost:4321${page.path}`);
      await testPage.waitForLoadState('networkidle');

      await expect(testPage).toHaveScreenshot(`${page.name}-mobile.png`, {
        fullPage: true,
      });
    });
  }
});
