// CAPA 12: Generación de Pages Next.js
// Verifica que existan las páginas del dashboard ContentFlow

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult } from '../types';

const PAGES_BASE = 'apps/web/src/app/(app)/dashboard/contentflow';

interface PageCheck {
  route: string;
  file: string;
  exists: boolean;
  hasUseClient?: boolean;
  importsHooks?: boolean;
  importsComponents?: boolean;
}

export async function layer12_generatePages(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();

  console.log(`🔄 Layer 12: Verifying Next.js Pages for ${blueprint.name}...`);
  console.log('   (Checking dashboard routes)\n');

  try {
    const expectedPages = [
      { route: '/dashboard/contentflow', file: 'page.tsx' },
      { route: '/dashboard/contentflow (layout)', file: 'layout.tsx' },
      { route: '/dashboard/contentflow/clients/[agencyId]', file: 'clients/[agencyId]/page.tsx' },
      { route: '/dashboard/contentflow/calendar/[clientId]', file: 'calendar/[clientId]/page.tsx' },
      { route: '/dashboard/contentflow/generate', file: 'generate/page.tsx' },
    ];

    const results: PageCheck[] = [];

    console.log('📋 Checking page files:\n');

    for (const page of expectedPages) {
      const fullPath = path.join(process.cwd(), PAGES_BASE, page.file);
      const exists = fs.existsSync(fullPath);

      let hasUseClient = false;
      let importsHooks = false;
      let importsComponents = false;

      if (exists) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        hasUseClient = content.includes("'use client'") || content.includes('"use client"');
        importsHooks = content.includes('@/hooks/contentflow');
        importsComponents = content.includes('@/components/contentflow');
      }

      results.push({
        route: page.route,
        file: page.file,
        exists,
        hasUseClient,
        importsHooks,
        importsComponents,
      });

      const status = exists ? '✅' : '❌';
      const flags = [];
      if (hasUseClient) flags.push('client');
      if (importsHooks) flags.push('hooks');
      if (importsComponents) flags.push('components');
      const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';

      console.log(`   ${status} ${page.route}${flagStr}`);
    }

    // Calcular resultados
    const pagesFound = results.filter((r) => r.exists).length;
    const allExist = results.every((r) => r.exists);

    // Resumen
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 LAYER 12 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`   Pages: ${pagesFound}/${expectedPages.length}`);
    console.log(`   With hooks: ${results.filter((r) => r.importsHooks).length}`);
    console.log(`   With components: ${results.filter((r) => r.importsComponents).length}`);
    console.log(`\n   Overall: ${allExist ? '✅ PASS' : '❌ INCOMPLETE'}`);

    // Guardar resultado
    const outputDir = path.join(process.cwd(), 'auto-saas/output', blueprint.id);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const report = {
      layer: 12,
      timestamp: new Date().toISOString(),
      pages: results,
      summary: {
        pagesFound,
        pagesExpected: expectedPages.length,
        allExist,
      },
    };

    fs.writeFileSync(
      path.join(outputDir, 'layer-12-result.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(`\n📄 Report saved to: auto-saas/output/${blueprint.id}/layer-12-result.json`);

    const success = allExist;
    console.log(success ? '\n✅ Layer 12 completed successfully!' : '\n❌ Layer 12 incomplete');

    return {
      layer: 12,
      name: 'Generate Pages',
      success,
      output: report.summary,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.log(`\n❌ Layer 12 failed: ${error.message}`);
    return {
      layer: 12,
      name: 'Generate Pages',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

if (require.main === module) {
  const blueprint = require('../blueprints/contentflow.json');
  console.log('\n🧪 Layer 12: Next.js Pages Verification\n');
  layer12_generatePages(blueprint).then((r) => {
    console.log('\n📊 Final Result:', JSON.stringify(r, null, 2));
    process.exit(r.success ? 0 : 1);
  });
}



