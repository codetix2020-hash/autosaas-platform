// CAPA 5: Generación de Plan de Ejecución
// Define el orden óptimo de creación de archivos basado en dependencias

import * as path from 'path';
import { Blueprint, LayerResult, ExecutionPlan, ExecutionStep } from '../types';

export async function layer05_generatePlan(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();
  const steps: ExecutionStep[] = [];
  let order = 0;

  console.log('🔍 Layer 05: Generating Execution Plan...');

  try {
    // 1. PASO: SQL Migrations (siempre primero)
    console.log('   📋 Planning database migrations...');
    steps.push({
      order: ++order,
      type: 'sql',
      name: 'Database Migration',
      path: `auto-saas/output/${blueprint.id}/migration.sql`,
      dependencies: [],
      description: `Create ${blueprint.database.new_tables.length} tables: ${blueprint.database.new_tables.map(t => t.name).join(', ')}`
    });

    // 2. PASO: TypeScript Types (depende de SQL)
    console.log('   📋 Planning TypeScript types...');
    steps.push({
      order: ++order,
      type: 'types',
      name: 'Database Types',
      path: `src/types/${blueprint.id}.ts`,
      dependencies: ['Database Migration'],
      description: 'Generate TypeScript types from database schema'
    });

    // 3. PASO: API Routes (depende de types)
    if (blueprint.api_routes) {
      console.log('   📋 Planning API routes...');
      blueprint.api_routes.forEach(api => {
        steps.push({
          order: ++order,
          type: 'api',
          name: `API: ${api.method} ${api.path.split('/').pop()}`,
          path: api.path,
          dependencies: ['Database Types'],
          description: api.description
        });
      });
    }

    // 4. PASO: Hooks personalizados (depende de types y API)
    console.log('   📋 Planning custom hooks...');
    const hookDependencies = ['Database Types'];
    if (blueprint.api_routes) {
      hookDependencies.push(...blueprint.api_routes.map(a => `API: ${a.method} ${a.path.split('/').pop()}`));
    }

    // Generar hooks basados en las tablas
    blueprint.database.new_tables.forEach(table => {
      const hookName = `use${table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`;
      steps.push({
        order: ++order,
        type: 'hook',
        name: `Hook: ${hookName}`,
        path: `src/hooks/${blueprint.id}/${hookName}.ts`,
        dependencies: ['Database Types'],
        description: `CRUD operations for ${table.name} table`
      });
    });

    // 5. PASO: Componentes (depende de hooks)
    if (blueprint.components) {
      console.log('   📋 Planning React components...');
      
      // Ordenar componentes por dependencias (UI básicos primero, luego compuestos)
      const sortedComponents = [...blueprint.components].sort((a, b) => {
        // Componentes con menos dependencias van primero
        const aDeps = a.dependencies?.length || 0;
        const bDeps = b.dependencies?.length || 0;
        return aDeps - bDeps;
      });

      sortedComponents.forEach(comp => {
        const deps = ['Database Types'];
        // Si usa hooks de las tablas, agregar dependencia
        blueprint.database.new_tables.forEach(table => {
          const hookName = `use${table.name.charAt(0).toUpperCase() + table.name.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`;
          deps.push(`Hook: ${hookName}`);
        });

        steps.push({
          order: ++order,
          type: 'component',
          name: `Component: ${comp.name}`,
          path: comp.path,
          dependencies: deps,
          description: comp.description
        });
      });
    }

    // 6. PASO: Pages/Routes (depende de componentes)
    if (blueprint.routes) {
      console.log('   📋 Planning page routes...');
      
      blueprint.routes.forEach(route => {
        const deps = ['Database Types'];
        
        // Agregar dependencias de componentes que usa esta ruta
        if (blueprint.components) {
          const relatedComponent = blueprint.components.find(c => c.name === route.component);
          if (relatedComponent) {
            deps.push(`Component: ${relatedComponent.name}`);
          }
        }

        steps.push({
          order: ++order,
          type: 'component',
          name: `Page: ${route.path}`,
          path: `src/app${route.path}/page.tsx`,
          dependencies: deps,
          description: route.description
        });
      });
    }

    // 7. PASO: Tests (dependen de todo)
    console.log('   📋 Planning tests...');
    steps.push({
      order: ++order,
      type: 'test',
      name: 'Unit Tests',
      path: `src/__tests__/${blueprint.id}/`,
      dependencies: steps.filter(s => s.type === 'component' || s.type === 'hook').map(s => s.name),
      description: 'Generate unit tests for components and hooks'
    });

    steps.push({
      order: ++order,
      type: 'test',
      name: 'Integration Tests',
      path: `src/__tests__/${blueprint.id}/integration/`,
      dependencies: ['Unit Tests'],
      description: 'Generate integration tests for API routes'
    });

    // 8. PASO: Config final
    steps.push({
      order: ++order,
      type: 'config',
      name: 'Feature Config',
      path: `src/config/${blueprint.id}.ts`,
      dependencies: [],
      description: 'Feature flags and configuration'
    });

    // 9. Calcular duración estimada
    const estimatedDuration = steps.reduce((acc, step) => {
      const timePerType = {
        sql: 30,      // 30 segundos
        types: 15,
        api: 45,
        hook: 30,
        component: 60,
        test: 45,
        config: 10
      };
      return acc + (timePerType[step.type] || 30);
    }, 0);

    // 10. Crear plan
    const plan: ExecutionPlan = {
      blueprintId: blueprint.id,
      totalSteps: steps.length,
      steps,
      estimatedDuration,
      generatedAt: new Date().toISOString()
    };

    // 11. Mostrar resumen
    console.log(`\n📊 Execution Plan Generated:`);
    console.log(`   📁 Total steps: ${plan.totalSteps}`);
    console.log(`   ⏱️  Estimated duration: ${Math.round(estimatedDuration / 60)} minutes`);
    console.log(`\n📋 Step Order:`);
    
    steps.forEach(step => {
      const icon = {
        sql: '🗄️',
        types: '📝',
        api: '🔌',
        hook: '🪝',
        component: '🧩',
        test: '🧪',
        config: '⚙️'
      }[step.type] || '📄';
      
      console.log(`   ${step.order}. ${icon} ${step.name}`);
    });

    console.log('\n✅ Execution plan ready');

    return {
      layer: 5,
      name: 'Generate Execution Plan',
      success: true,
      output: plan,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.log(`❌ Layer 05 failed: ${error.message}`);
    return {
      layer: 5,
      name: 'Generate Execution Plan',
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
  console.log('\n🧪 Testing Layer 05: Execution Plan Generation\n');
  
  layer05_generatePlan(blueprint).then(result => {
    console.log('\n📊 Full Result:', JSON.stringify(result, null, 2));
  });
}

