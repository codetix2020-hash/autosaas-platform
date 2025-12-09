// CAPA 4: Análisis de Conflictos
// Detecta colisiones de nombres de tablas, rutas, componentes y archivos

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult, ConflictReport, Conflict, Warning } from '../types';
import { extractSupastarterContext } from '../utils/extract-context';

export async function layer04_analyzeConflicts(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();
  const conflicts: Conflict[] = [];
  const warnings: Warning[] = [];

  console.log('🔍 Layer 04: Analyzing Conflicts...');

  try {
    // 1. Extraer contexto
    console.log('   📊 Extracting project context...');
    const context = await extractSupastarterContext();

    // 2. Verificar conflictos de nombres de tablas
    console.log('   🗄️  Checking table name conflicts...');
    const existingTables = new Set(context.sqlTables.map(t => t.toLowerCase()));
    
    blueprint.database.new_tables.forEach(table => {
      const tableName = table.name.toLowerCase();
      
      if (existingTables.has(tableName)) {
        conflicts.push({
          type: 'table_name',
          existing: tableName,
          new: table.name,
          severity: 'error',
          suggestion: `Rename table to "${table.name}_${blueprint.id.replace(/-/g, '_')}" or use a unique name`
        });
      }

      // Verificar nombres reservados de PostgreSQL
      const reservedNames = ['user', 'order', 'group', 'table', 'index', 'select', 'insert', 'update', 'delete'];
      if (reservedNames.includes(tableName)) {
        warnings.push({
          type: 'reserved_name',
          message: `Table name "${table.name}" is a PostgreSQL reserved word`,
          suggestion: `Consider using "${table.name}s" or "${blueprint.id}_${table.name}"`
        });
      }
    });

    // 3. Verificar conflictos de rutas
    if (blueprint.routes) {
      console.log('   🛤️  Checking route path conflicts...');
      
      // Extraer rutas existentes del file tree
      const existingRoutes = context.fileTree
        .filter(f => f.includes('/app/') && f.includes('page.tsx'))
        .map(f => {
          const match = f.match(/\/app(.*)\/page\.tsx/);
          return match ? match[1].replace(/\\/g, '/') : null;
        })
        .filter(Boolean);

      blueprint.routes.forEach(route => {
        const normalizedPath = route.path.replace(/\[.*?\]/g, '[param]');
        
        const collision = existingRoutes.find(existing => {
          const normalizedExisting = existing.replace(/\[.*?\]/g, '[param]');
          return normalizedExisting === normalizedPath;
        });

        if (collision) {
          conflicts.push({
            type: 'route_path',
            existing: collision,
            new: route.path,
            severity: 'error',
            suggestion: `Use a different path like "/${blueprint.id}${route.path}" or modify existing route`
          });
        }
      });
    }

    // 4. Verificar conflictos de componentes
    if (blueprint.components) {
      console.log('   🧩 Checking component name conflicts...');
      
      const existingComponents = new Set(
        context.components.map(c => c.split(' → ')[0].toLowerCase())
      );

      blueprint.components.forEach(comp => {
        if (existingComponents.has(comp.name.toLowerCase())) {
          conflicts.push({
            type: 'component_name',
            existing: comp.name,
            new: comp.name,
            severity: 'warning',
            suggestion: `Rename to "${blueprint.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}${comp.name}"`
          });
        }
      });
    }

    // 5. Verificar conflictos de archivos
    if (blueprint.components) {
      console.log('   📁 Checking file path conflicts...');
      
      const existingFiles = new Set(context.fileTree.map(f => f.toLowerCase()));

      blueprint.components.forEach(comp => {
        const normalizedPath = comp.path.toLowerCase().replace(/\\/g, '/');
        
        if (existingFiles.has(normalizedPath)) {
          conflicts.push({
            type: 'file_path',
            existing: comp.path,
            new: comp.path,
            severity: 'error',
            suggestion: `Create in a new directory: "src/components/${blueprint.id}/${comp.name}.tsx"`
          });
        }
      });
    }

    // 6. Verificar posibles colisiones de API routes
    if (blueprint.api_routes) {
      console.log('   🔌 Checking API route conflicts...');
      
      const existingApiRoutes = context.fileTree
        .filter(f => f.includes('/api/') && f.includes('route.ts'))
        .map(f => {
          const match = f.match(/\/api(.*)\/route\.ts/);
          return match ? `/api${match[1]}` : null;
        })
        .filter(Boolean);

      blueprint.api_routes.forEach(api => {
        const normalizedPath = api.path.replace(/src\/app/, '').replace('/route.ts', '');
        
        if (existingApiRoutes.some(e => e === normalizedPath)) {
          conflicts.push({
            type: 'route_path',
            existing: normalizedPath,
            new: api.path,
            severity: 'error',
            suggestion: `Use "/api/${blueprint.id}${normalizedPath.replace('/api', '')}"`
          });
        }
      });
    }

    // 7. Generar reporte
    const report: ConflictReport = {
      hasConflicts: conflicts.filter(c => c.severity === 'error').length > 0,
      conflicts,
      warnings
    };

    const errorConflicts = conflicts.filter(c => c.severity === 'error');
    const warningConflicts = conflicts.filter(c => c.severity === 'warning');

    console.log(`\n📊 Conflict Analysis Complete:`);
    console.log(`   ❌ Errors: ${errorConflicts.length}`);
    console.log(`   ⚠️  Warnings: ${warningConflicts.length + warnings.length}`);

    if (errorConflicts.length > 0) {
      console.log('\n🚫 Error Conflicts:');
      errorConflicts.forEach(c => {
        console.log(`   - [${c.type}] "${c.existing}" conflicts with "${c.new}"`);
        console.log(`     💡 ${c.suggestion}`);
      });
    }

    if (warningConflicts.length > 0 || warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warningConflicts.forEach(c => {
        console.log(`   - [${c.type}] "${c.existing}"`);
        console.log(`     💡 ${c.suggestion}`);
      });
      warnings.forEach(w => {
        console.log(`   - [${w.type}] ${w.message}`);
        console.log(`     💡 ${w.suggestion}`);
      });
    }

    const success = errorConflicts.length === 0;
    console.log(success ? '\n✅ No blocking conflicts found' : '\n❌ Blocking conflicts detected');

    return {
      layer: 4,
      name: 'Analyze Conflicts',
      success,
      output: report,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      needsHumanReview: !success
    };

  } catch (error) {
    console.log(`❌ Layer 04 failed: ${error.message}`);
    return {
      layer: 4,
      name: 'Analyze Conflicts',
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
  console.log('\n🧪 Testing Layer 04: Conflict Analysis\n');
  
  layer04_analyzeConflicts(blueprint).then(result => {
    console.log('\n📊 Full Result:', JSON.stringify(result, null, 2));
  });
}

