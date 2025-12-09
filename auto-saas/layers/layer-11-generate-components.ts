// CAPA 11: Generación de React Components
// Verifica que existan los componentes para ContentFlow
// NO hace typecheck global (evita errores de módulos legacy de Supastarter)

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult } from '../types';

const COMPONENTS_PATH = 'apps/web/src/components/contentflow';

interface ComponentCheck {
  file: string;
  exists: boolean;
  size?: number;
  hasUseClient?: boolean;
}

export async function layer11_generateComponents(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();

  console.log(`🔄 Layer 11: Verifying React Components for ${blueprint.name}...`);
  console.log('   (Skipping global typecheck to avoid Supastarter legacy errors)\n');

  try {
    const expectedFiles = [
      // UI Components
      'ui/StatusBadge.tsx',
      'ui/PlatformIcon.tsx',
      'ui/LoadingSpinner.tsx',
      'ui/EmptyState.tsx',
      // Agency Components
      'agencies/AgenciesList.tsx',
      'agencies/AgencyCard.tsx',
      'agencies/AgencyForm.tsx',
      // Client Components
      'clients/ClientsList.tsx',
      'clients/ClientForm.tsx',
      // Calendar Components
      'calendar/ContentCard.tsx',
      'calendar/CalendarView.tsx',
      // Index
      'index.ts',
    ];

    const results: ComponentCheck[] = [];

    console.log('📋 Checking component files:\n');

    for (const file of expectedFiles) {
      const fullPath = path.join(process.cwd(), COMPONENTS_PATH, file);
      const exists = fs.existsSync(fullPath);
      
      let size: number | undefined;
      let hasUseClient: boolean | undefined;

      if (exists) {
        const stats = fs.statSync(fullPath);
        size = stats.size;
        
        if (file.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          hasUseClient = content.includes("'use client'") || content.includes('"use client"');
        }
      }

      results.push({ file, exists, size, hasUseClient });
      
      const status = exists ? '✅' : '❌';
      const sizeStr = size ? ` (${size} bytes)` : '';
      const clientStr = hasUseClient ? ' [client]' : '';
      console.log(`   ${status} ${file}${sizeStr}${clientStr}`);
    }

    // Verificar dependencias internas (hooks, types)
    console.log('\n📋 Checking dependencies:\n');

    const dependencies = [
      { path: 'apps/web/src/hooks/contentflow/index.ts', name: 'Hooks' },
      { path: 'apps/web/src/types/contentflow-ai.ts', name: 'Types' },
      { path: 'apps/web/src/lib/utils.ts', name: 'Utils (cn)' },
    ];

    const depResults: { name: string; exists: boolean }[] = [];
    for (const dep of dependencies) {
      const exists = fs.existsSync(path.join(process.cwd(), dep.path));
      depResults.push({ name: dep.name, exists });
      console.log(`   ${exists ? '✅' : '❌'} ${dep.name}`);
    }

    // Calcular resultados
    const componentCount = results.filter((r) => r.exists && r.file.endsWith('.tsx')).length;
    const totalExpected = expectedFiles.filter((f) => f.endsWith('.tsx')).length;
    const allExist = results.every((r) => r.exists);
    const allDepsExist = depResults.every((d) => d.exists);

    // Resumen
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 LAYER 11 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`   Components: ${componentCount}/${totalExpected} .tsx files`);
    console.log(`   Index file: ${results.find((r) => r.file === 'index.ts')?.exists ? '✅' : '❌'}`);
    console.log(`   Dependencies: ${depResults.filter((d) => d.exists).length}/${dependencies.length}`);
    console.log(`\n   Overall: ${allExist && allDepsExist ? '✅ PASS' : '❌ INCOMPLETE'}`);

    // Guardar resultado
    const outputDir = path.join(process.cwd(), 'auto-saas/output', blueprint.id);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const report = {
      layer: 11,
      timestamp: new Date().toISOString(),
      components: results,
      dependencies: depResults,
      summary: {
        componentsFound: componentCount,
        componentsExpected: totalExpected,
        allFilesExist: allExist,
        allDepsExist: allDepsExist,
      },
      note: 'Typecheck global skipped to avoid Supastarter legacy errors',
    };

    fs.writeFileSync(
      path.join(outputDir, 'layer-11-result.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(`\n📄 Report saved to: auto-saas/output/${blueprint.id}/layer-11-result.json`);

    const success = allExist && allDepsExist;
    console.log(success ? '\n✅ Layer 11 completed successfully!' : '\n❌ Layer 11 incomplete');

    return {
      layer: 11,
      name: 'Generate Components',
      success,
      output: report.summary,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.log(`\n❌ Layer 11 failed: ${error.message}`);
    return {
      layer: 11,
      name: 'Generate Components',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

if (require.main === module) {
  const blueprint = require('../blueprints/contentflow.json');
  console.log('\n🧪 Layer 11: React Components Verification\n');
  layer11_generateComponents(blueprint).then((r) => {
    console.log('\n📊 Final Result:', JSON.stringify(r, null, 2));
    process.exit(r.success ? 0 : 1);
  });
}
