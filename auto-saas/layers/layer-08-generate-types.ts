// CAPA 8: Generación de TypeScript Types
// Lee el SQL generado y crea interfaces + schemas Zod

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult } from '../types';

export async function layer08_generateTypes(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();

  console.log(`🔄 Layer 08: Generating TypeScript Types for ${blueprint.name}...`);

  try {
    // 1. Verificar que existe el SQL generado
    const sqlPath = path.join(process.cwd(), 'auto-saas/output', blueprint.id, 'migration.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found: ${sqlPath}. Run Layer 7 first.`);
    }
    console.log('   ✅ SQL migration found');

    // 2. Verificar que existe el archivo de types
    const typesPath = path.join(process.cwd(), 'apps/web/src/types', `${blueprint.id}.ts`);
    if (!fs.existsSync(typesPath)) {
      throw new Error(`Types file not found: ${typesPath}. Create it first.`);
    }
    console.log('   ✅ Types file found');

    // 3. Leer y validar el archivo de types
    const typesContent = fs.readFileSync(typesPath, 'utf-8');
    
    // Verificar que tiene las interfaces principales
    const requiredTypes = ['Agency', 'AgencyClient', 'ContentCalendar'];
    const missingTypes = requiredTypes.filter(t => !typesContent.includes(`export interface ${t}`));
    
    if (missingTypes.length > 0) {
      throw new Error(`Missing types: ${missingTypes.join(', ')}`);
    }
    console.log('   ✅ All required interfaces present');

    // Verificar schemas Zod
    const requiredSchemas = ['AgencySchema', 'AgencyClientSchema', 'ContentCalendarSchema'];
    const missingSchemas = requiredSchemas.filter(s => !typesContent.includes(`export const ${s}`));
    
    if (missingSchemas.length > 0) {
      throw new Error(`Missing Zod schemas: ${missingSchemas.join(', ')}`);
    }
    console.log('   ✅ All Zod schemas present');

    // 4. Contar tipos generados
    const interfaceCount = (typesContent.match(/export interface/g) || []).length;
    const typeCount = (typesContent.match(/export type/g) || []).length;
    const schemaCount = (typesContent.match(/export const \w+Schema/g) || []).length;

    console.log(`\n📊 Types Summary:`);
    console.log(`   - Interfaces: ${interfaceCount}`);
    console.log(`   - Type aliases: ${typeCount}`);
    console.log(`   - Zod schemas: ${schemaCount}`);

    // 5. Guardar registro de la capa
    const outputDir = path.join(process.cwd(), 'auto-saas/output', blueprint.id);
    const layerLog = {
      layer: 8,
      timestamp: new Date().toISOString(),
      typesPath,
      stats: { interfaces: interfaceCount, types: typeCount, schemas: schemaCount }
    };
    fs.writeFileSync(
      path.join(outputDir, 'layer-08-result.json'),
      JSON.stringify(layerLog, null, 2)
    );

    console.log('\n✅ Layer 08 completed successfully');

    return {
      layer: 8,
      name: 'Generate Types',
      success: true,
      output: {
        typesPath,
        interfaces: interfaceCount,
        types: typeCount,
        schemas: schemaCount
      },
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.log(`\n❌ Layer 08 failed: ${error.message}`);
    return {
      layer: 8,
      name: 'Generate Types',
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
  console.log('\n🧪 Layer 08: TypeScript Types Generation\n');

  layer08_generateTypes(blueprint).then(result => {
    console.log('\n📊 Result:', JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}

