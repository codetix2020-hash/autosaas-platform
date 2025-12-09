// CAPA 1: Validación de Blueprint
// Verifica que el blueprint tenga todos los campos requeridos y formato correcto

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult } from '../types';

const REQUIRED_FIELDS = ['id', 'name', 'description', 'vpu', 'target_audience', 'pricing', 'database'];
const REQUIRED_TABLE_FIELDS = ['name', 'columns'];

export async function layer01_validateBlueprint(blueprintPath: string): Promise<LayerResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('🔍 Layer 01: Validating Blueprint...');

  try {
    // 1. Verificar que el archivo existe
    if (!fs.existsSync(blueprintPath)) {
      throw new Error(`Blueprint file not found: ${blueprintPath}`);
    }

    // 2. Leer y parsear JSON
    const rawContent = fs.readFileSync(blueprintPath, 'utf-8');
    let blueprint: Blueprint;

    try {
      blueprint = JSON.parse(rawContent);
    } catch (e) {
      throw new Error(`Invalid JSON in blueprint: ${e.message}`);
    }

    // 3. Validar campos requeridos del blueprint
    for (const field of REQUIRED_FIELDS) {
      if (!blueprint[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // 4. Validar ID (debe ser slug válido)
    if (blueprint.id && !/^[a-z0-9-]+$/.test(blueprint.id)) {
      errors.push(`Invalid blueprint ID: "${blueprint.id}". Must be lowercase alphanumeric with hyphens only.`);
    }

    // 5. Validar estructura de database
    if (blueprint.database) {
      if (!blueprint.database.new_tables || !Array.isArray(blueprint.database.new_tables)) {
        errors.push('database.new_tables must be an array');
      } else {
        // Validar cada tabla
        blueprint.database.new_tables.forEach((table, index) => {
          for (const field of REQUIRED_TABLE_FIELDS) {
            if (!table[field]) {
              errors.push(`Table ${index + 1}: missing required field "${field}"`);
            }
          }

          // Validar nombre de tabla
          if (table.name && !/^[a-z_][a-z0-9_]*$/.test(table.name)) {
            errors.push(`Invalid table name: "${table.name}". Must be lowercase with underscores.`);
          }

          // Validar que hay al menos una columna
          if (table.columns && table.columns.length === 0) {
            errors.push(`Table "${table.name}" has no columns defined`);
          }

          // Validar columnas tienen formato SQL válido
          table.columns?.forEach((col, colIndex) => {
            if (!col.includes(' ')) {
              warnings.push(`Table "${table.name}", column ${colIndex + 1}: "${col}" may be missing data type`);
            }
          });
        });
      }
    }

    // 6. Validar rutas (si existen)
    if (blueprint.routes) {
      blueprint.routes.forEach((route, index) => {
        if (!route.path) {
          errors.push(`Route ${index + 1}: missing path`);
        }
        if (!route.component) {
          errors.push(`Route ${index + 1}: missing component`);
        }
        if (route.path && !route.path.startsWith('/')) {
          warnings.push(`Route "${route.path}" should start with /`);
        }
      });
    }

    // 7. Validar componentes (si existen)
    if (blueprint.components) {
      blueprint.components.forEach((comp, index) => {
        if (!comp.name) {
          errors.push(`Component ${index + 1}: missing name`);
        }
        if (!comp.path) {
          errors.push(`Component ${index + 1}: missing path`);
        }
        if (comp.path && !comp.path.endsWith('.tsx')) {
          warnings.push(`Component "${comp.name}": path should end with .tsx`);
        }
      });
    }

    // 8. Validar API routes (si existen)
    if (blueprint.api_routes) {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      blueprint.api_routes.forEach((api, index) => {
        if (!api.path) {
          errors.push(`API Route ${index + 1}: missing path`);
        }
        if (api.method && !validMethods.includes(api.method)) {
          errors.push(`API Route "${api.path}": invalid method "${api.method}"`);
        }
      });
    }

    // 9. Determinar resultado
    const success = errors.length === 0;

    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach(w => console.log(`   - ${w}`));
    }

    if (errors.length > 0) {
      console.log('❌ Validation errors:');
      errors.forEach(e => console.log(`   - ${e}`));
    } else {
      console.log('✅ Blueprint validation passed!');
      console.log(`   - ${blueprint.database.new_tables.length} tables defined`);
      console.log(`   - ${blueprint.routes?.length || 0} routes defined`);
      console.log(`   - ${blueprint.components?.length || 0} components defined`);
    }

    return {
      layer: 1,
      name: 'Validate Blueprint',
      success,
      output: {
        blueprint,
        errors,
        warnings,
        stats: {
          tables: blueprint.database?.new_tables?.length || 0,
          routes: blueprint.routes?.length || 0,
          components: blueprint.components?.length || 0,
          apiRoutes: blueprint.api_routes?.length || 0
        }
      },
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.log(`❌ Layer 01 failed: ${error.message}`);
    return {
      layer: 1,
      name: 'Validate Blueprint',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

// Test directo
if (require.main === module) {
  const testPath = path.join(__dirname, '../blueprints/contentflow.json');
  console.log('\n🧪 Testing Layer 01: Blueprint Validation\n');
  
  layer01_validateBlueprint(testPath).then(result => {
    console.log('\n📊 Result:', JSON.stringify(result, null, 2));
  });
}

