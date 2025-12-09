// CAPA 10: Generación de React Hooks
// Verifica que existan los hooks para el blueprint

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult } from '../types';

const HOOKS_PATH = 'apps/web/src/hooks/contentflow';

interface HookCheck {
  name: string;
  path: string;
  exists: boolean;
  exports: string[];
}

export async function layer10_generateHooks(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();

  console.log(`🔄 Layer 10: Verifying React Hooks for ${blueprint.name}...`);

  try {
    const checks: HookCheck[] = [];
    const expectedHooks = [
      { file: 'useAgencies.ts', exports: ['useAgencies', 'useAgency'] },
      { file: 'useAgencyClients.ts', exports: ['useAgencyClients', 'useAgencyClient'] },
      { file: 'useContentCalendar.ts', exports: ['useContentCalendar', 'useCalendarView'] },
      { file: 'index.ts', exports: ['useAgencies', 'useAgencyClients', 'useContentCalendar'] },
    ];

    for (const hook of expectedHooks) {
      const hookPath = path.join(process.cwd(), HOOKS_PATH, hook.file);
      const exists = fs.existsSync(hookPath);

      let foundExports: string[] = [];
      if (exists) {
        const content = fs.readFileSync(hookPath, 'utf-8');
        foundExports = hook.exports.filter(
          (exp) => content.includes(`export function ${exp}`) || content.includes(`export { ${exp}`)
        );
      }

      checks.push({ name: hook.file, path: hookPath, exists, exports: foundExports });

      const status = exists && foundExports.length === hook.exports.length ? '✅' : '❌';
      console.log(`   ${status} ${hook.file} [${foundExports.join(', ') || 'NOT FOUND'}]`);
    }

    // Check API client helper
    const clientPath = 'apps/web/src/lib/api/client.ts';
    const clientExists = fs.existsSync(path.join(process.cwd(), clientPath));
    console.log(`   ${clientExists ? '✅' : '❌'} ${clientPath}`);

    const allHooksExist = checks.every((c) => c.exists);
    const allExportsPresent = checks.every((c, i) => c.exports.length === expectedHooks[i].exports.length);

    // Save result
    const outputDir = path.join(process.cwd(), 'auto-saas/output', blueprint.id);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
      path.join(outputDir, 'layer-10-result.json'),
      JSON.stringify({ layer: 10, checks, clientExists, timestamp: new Date().toISOString() }, null, 2)
    );

    const success = allHooksExist && allExportsPresent && clientExists;
    console.log(success ? '\n✅ Layer 10 completed' : '\n❌ Layer 10 incomplete');

    return {
      layer: 10,
      name: 'Generate Hooks',
      success,
      output: {
        hooks: checks,
        totalHooks: checks.filter((c) => c.name !== 'index.ts').length,
        totalExports: checks.reduce((acc, c) => acc + c.exports.length, 0),
      },
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.log(`\n❌ Layer 10 failed: ${error.message}`);
    return {
      layer: 10,
      name: 'Generate Hooks',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

if (require.main === module) {
  const blueprint = require('../blueprints/contentflow.json');
  console.log('\n🧪 Layer 10: React Hooks Verification\n');
  layer10_generateHooks(blueprint).then((r) => {
    console.log('\n📊 Result:', JSON.stringify(r, null, 2));
    process.exit(r.success ? 0 : 1);
  });
}

