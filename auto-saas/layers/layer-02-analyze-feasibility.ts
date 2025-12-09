// CAPA 2: Análisis de Viabilidad Técnica
// Verifica que todas las dependencias existen y el blueprint es técnicamente posible

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult, FeasibilityReport, FeasibilityCheck } from '../types';
import { extractSupastarterContext } from '../utils/extract-context';

export async function layer02_analyzeFeasibility(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();
  const checks: FeasibilityCheck[] = [];
  const blockers: string[] = [];
  const recommendations: string[] = [];

  console.log('🔍 Layer 02: Analyzing Technical Feasibility...');

  try {
    // 1. Extraer contexto de Supastarter
    console.log('   📊 Extracting Supastarter context...');
    const context = await extractSupastarterContext();

    // 2. CHECK: Verificar que database está configurado (Prisma o Supabase)
    const hasPrisma = context.availableLibraries.some(lib => 
      lib.includes('prisma') || lib.includes('@prisma')
    );
    const hasSupabase = context.availableLibraries.some(lib => 
      lib.includes('supabase')
    );
    const hasDatabase = hasPrisma || hasSupabase;
    
    checks.push({
      name: 'Database Client',
      passed: hasDatabase,
      details: hasPrisma 
        ? 'Prisma ORM detected' 
        : hasSupabase 
          ? 'Supabase client available' 
          : 'No database client found (Prisma or Supabase)'
    });
    if (!hasDatabase) {
      recommendations.push('Install Prisma (@prisma/client) or Supabase client');
    }

    // 3. CHECK: Verificar que auth está configurado
    const hasAuth = context.authPattern && context.authPattern.length > 100;
    checks.push({
      name: 'Authentication System',
      passed: hasAuth,
      details: hasAuth ? 'Auth pattern detected (better-auth)' : 'No auth pattern found'
    });
    if (!hasAuth) {
      recommendations.push('Consider setting up authentication before generating user-specific tables');
    }

    // 4. CHECK: Verificar que no hay colisión de tablas
    const existingTables = new Set(context.sqlTables.map(t => t.toLowerCase()));
    const newTables = blueprint.database.new_tables.map(t => t.name.toLowerCase());
    const tableCollisions = newTables.filter(t => existingTables.has(t));
    
    checks.push({
      name: 'Table Name Uniqueness',
      passed: tableCollisions.length === 0,
      details: tableCollisions.length === 0 
        ? 'All table names are unique' 
        : `Collisions found: ${tableCollisions.join(', ')}`
    });
    if (tableCollisions.length > 0) {
      blockers.push(`Table names already exist: ${tableCollisions.join(', ')}`);
    }

    // 5. CHECK: Verificar foreign keys a tablas existentes
    const fkPattern = /REFERENCES\s+(?:["']?(\w+)["']?\.)?["']?(\w+)["']?/gi;
    const foreignKeyTargets: string[] = [];
    
    blueprint.database.new_tables.forEach(table => {
      table.columns.forEach(col => {
        const pattern = /REFERENCES\s+(?:["']?(\w+)["']?\.)?["']?(\w+)["']?/gi;
        let match;
        while ((match = pattern.exec(col)) !== null) {
          // Si hay schema.table, usar solo la tabla (match[2]), sino usar match[2] o match[1]
          const tableName = match[2] || match[1];
          if (tableName) {
            foreignKeyTargets.push(tableName.toLowerCase());
          }
        }
      });
    });

    // Verificar que las tablas referenciadas existen
    const validFks = foreignKeyTargets.every(fk => 
      existingTables.has(fk) || newTables.includes(fk)
    );
    const invalidFks = foreignKeyTargets.filter(fk => 
      !existingTables.has(fk) && !newTables.includes(fk)
    );

    checks.push({
      name: 'Foreign Key Validity',
      passed: validFks,
      details: validFks 
        ? 'All foreign keys reference valid tables'
        : `Invalid FK references: ${invalidFks.join(', ')}`
    });
    if (!validFks) {
      blockers.push(`Foreign keys reference non-existent tables: ${invalidFks.join(', ')}`);
    }

    // 6. CHECK: Verificar dependencias externas de componentes
    if (blueprint.components) {
      const allDeps = blueprint.components.flatMap(c => c.dependencies || []);
      const uniqueDeps = [...new Set(allDeps)];
      const installedDeps = uniqueDeps.filter(dep => 
        context.availableLibraries.some(lib => lib.includes(dep.replace('@', '')))
      );
      const missingDeps = uniqueDeps.filter(dep => 
        !context.availableLibraries.some(lib => lib.includes(dep.replace('@', '')))
      );

      checks.push({
        name: 'Component Dependencies',
        passed: missingDeps.length === 0,
        details: missingDeps.length === 0 
          ? 'All component dependencies available'
          : `Missing: ${missingDeps.join(', ')}`
      });
      if (missingDeps.length > 0) {
        recommendations.push(`Install missing dependencies: pnpm add ${missingDeps.join(' ')}`);
      }
    }

    // 7. CHECK: Verificar APIs externas configuradas
    if (blueprint.external_apis) {
      blueprint.external_apis.forEach(api => {
        const envVar = process.env[api.env_var];
        checks.push({
          name: `External API: ${api.name}`,
          passed: !!envVar,
          details: envVar ? `${api.env_var} is configured` : `${api.env_var} not found in environment`
        });
        if (!envVar) {
          recommendations.push(`Configure ${api.env_var} in .env.local for ${api.name}`);
        }
      });
    }

    // 8. CHECK: Verificar espacio de rutas disponible
    if (blueprint.routes) {
      const existingPaths = context.fileTree
        .filter(f => f.includes('/app/'))
        .map(f => f.replace(/.*\/app/, '').replace('/page.tsx', ''));
      
      const routeCollisions = blueprint.routes.filter(r => 
        existingPaths.some(p => p === r.path || p.startsWith(r.path + '/'))
      );

      checks.push({
        name: 'Route Path Availability',
        passed: routeCollisions.length === 0,
        details: routeCollisions.length === 0
          ? 'All routes are available'
          : `Potential collisions: ${routeCollisions.map(r => r.path).join(', ')}`
      });
    }

    // 9. Calcular score de viabilidad
    const passedChecks = checks.filter(c => c.passed).length;
    const score = Math.round((passedChecks / checks.length) * 100);
    const feasible = blockers.length === 0 && score >= 70;

    // 10. Generar reporte
    const report: FeasibilityReport = {
      feasible,
      score,
      checks,
      blockers,
      recommendations
    };

    console.log(`\n📊 Feasibility Score: ${score}%`);
    console.log(`   ✅ Passed: ${passedChecks}/${checks.length} checks`);
    
    if (blockers.length > 0) {
      console.log('   🚫 Blockers:');
      blockers.forEach(b => console.log(`      - ${b}`));
    }
    
    if (recommendations.length > 0) {
      console.log('   💡 Recommendations:');
      recommendations.forEach(r => console.log(`      - ${r}`));
    }

    console.log(feasible ? '\n✅ Blueprint is FEASIBLE' : '\n❌ Blueprint has BLOCKERS');

    return {
      layer: 2,
      name: 'Analyze Feasibility',
      success: feasible,
      output: report,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      needsHumanReview: !feasible && blockers.length > 0
    };

  } catch (error) {
    console.log(`❌ Layer 02 failed: ${error.message}`);
    return {
      layer: 2,
      name: 'Analyze Feasibility',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

// Test directo
if (require.main === module) {
  const blueprint = require('../blueprints/contentflow.json');
  console.log('\n🧪 Testing Layer 02: Feasibility Analysis\n');
  
  layer02_analyzeFeasibility(blueprint).then(result => {
    console.log('\n📊 Full Result:', JSON.stringify(result, null, 2));
  });
}

