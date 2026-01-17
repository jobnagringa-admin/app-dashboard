import { test, expect } from '@playwright/test';
import { readdir } from 'fs/promises';
import { join } from 'path';

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

test.describe('Lesson Pages Visual Regression', () => {
  for (const lesson of sampleLessons) {
    test(`${lesson} - desktop`, async ({ page: testPage }) => {
      await testPage.goto(`http://localhost:4321/jng/aulas/${lesson}`);
      await testPage.waitForLoadState('networkidle');
      
      await expect(testPage).toHaveScreenshot(`lesson-${lesson}-desktop.png`, {
        fullPage: true,
      });
    });

    test(`${lesson} - mobile`, async ({ page: testPage }) => {
      testPage.setViewportSize({ width: 375, height: 667 });
      await testPage.goto(`http://localhost:4321/jng/aulas/${lesson}`);
      await testPage.waitForLoadState('networkidle');
      
      await expect(testPage).toHaveScreenshot(`lesson-${lesson}-mobile.png`, {
        fullPage: true,
      });
    });
  }
});
