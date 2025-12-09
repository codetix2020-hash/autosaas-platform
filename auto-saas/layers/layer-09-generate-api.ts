// CAPA 9: Generación de API Routes
// Verifica que existan las API routes CRUD para el blueprint

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult } from '../types';

const API_BASE_PATH = 'apps/web/src/app/api/contentflow';

interface ApiRouteCheck {
  name: string;
  path: string;
  exists: boolean;
  methods: string[];
}

export async function layer09_generateAPI(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();

  console.log(`🔄 Layer 09: Verifying API Routes for ${blueprint.name}...`);

  try {
    const checks: ApiRouteCheck[] = [];
    const expectedRoutes = ['agencies', 'agency-clients', 'content-calendar'];

    for (const route of expectedRoutes) {
      const routePath = path.join(process.cwd(), API_BASE_PATH, route, 'route.ts');
      const exists = fs.existsSync(routePath);

      let methods: string[] = [];
      if (exists) {
        const content = fs.readFileSync(routePath, 'utf-8');
        if (content.includes('export async function GET')) methods.push('GET');
        if (content.includes('export async function POST')) methods.push('POST');
        if (content.includes('export async function PUT')) methods.push('PUT');
        if (content.includes('export async function DELETE')) methods.push('DELETE');
      }

      checks.push({ name: route, path: routePath, exists, methods });
      
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} /api/contentflow/${route} [${methods.join(', ') || 'NOT FOUND'}]`);
    }

    // Check helpers
    const helperPaths = [
      'apps/web/src/lib/supabase/server.ts',
      'apps/web/src/lib/api/auth-helper.ts'
    ];

    for (const helper of helperPaths) {
      const exists = fs.existsSync(path.join(process.cwd(), helper));
      console.log(`   ${exists ? '✅' : '❌'} ${helper}`);
    }

    const allRoutesExist = checks.every(c => c.exists);
    const allMethodsPresent = checks.every(c => c.methods.length === 4);

    // Save result
    const outputDir = path.join(process.cwd(), 'auto-saas/output', blueprint.id);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
      path.join(outputDir, 'layer-09-result.json'),
      JSON.stringify({ layer: 9, checks, timestamp: new Date().toISOString() }, null, 2)
    );

    const success = allRoutesExist && allMethodsPresent;
    console.log(success ? '\n✅ Layer 09 completed' : '\n❌ Layer 09 incomplete');

    return {
      layer: 9,
      name: 'Generate API Routes',
      success,
      output: {
        routes: checks,
        totalEndpoints: checks.reduce((acc, c) => acc + c.methods.length, 0)
      },
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.log(`\n❌ Layer 09 failed: ${error.message}`);
    return {
      layer: 9,
      name: 'Generate API Routes',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

if (require.main === module) {
  const blueprint = require('../blueprints/contentflow.json');
  console.log('\n🧪 Layer 09: API Routes Verification\n');
  layer09_generateAPI(blueprint).then(r => {
    console.log('\n📊 Result:', JSON.stringify(r, null, 2));
    process.exit(r.success ? 0 : 1);
  });
}

