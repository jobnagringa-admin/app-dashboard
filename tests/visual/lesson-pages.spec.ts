import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Visual regression tests for lesson pages
 * Tests a sample of lesson pages
 */

// Sample of lesson pages to test
const sampleLessons = [
  'introducao-a-busca-como-comecar-a-procurar',
  'linkedin-seo-1-4-seja-o-candidato-perfeito-para-headhunters-e-recruiters',
  'como-funciona-o-feed-do-linkedin',
  'guia-definitivo-de-entrevista',
  'negociando-um-bom-salario',
];

async function openPageForScreenshot(testPage: Page, path: string) {
  await testPage.goto(path, { waitUntil: 'domcontentloaded' });
  await testPage.waitForTimeout(1000);
}

test.describe('Lesson Pages Visual Regression', () => {
  for (const lesson of sampleLessons) {
    test(`${lesson} - desktop`, async ({ page: testPage }) => {
      await openPageForScreenshot(testPage, `/aulas/${lesson}`);

      const screenshot = await testPage.screenshot({ fullPage: true });
      expect(screenshot).toMatchSnapshot(`lesson-${lesson}-desktop.png`);
    });

    test(`${lesson} - mobile`, async ({ page: testPage }) => {
      await testPage.setViewportSize({ width: 375, height: 667 });
      await openPageForScreenshot(testPage, `/aulas/${lesson}`);

      const screenshot = await testPage.screenshot({ fullPage: true });
      expect(screenshot).toMatchSnapshot(`lesson-${lesson}-mobile.png`);
    });
  }
});
