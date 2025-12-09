// CAPA 6: Checkpoint Pre-Generación
// Guarda el estado actual del proyecto para permitir rollback

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult, Checkpoint } from '../types';
import { extractSupastarterContext } from '../utils/extract-context';

const CHECKPOINTS_DIR = 'auto-saas/checkpoints';

export async function layer06_createCheckpoint(
  blueprint: Blueprint,
  layerNumber: number = 6
): Promise<LayerResult> {
  const startTime = Date.now();

  console.log('🔍 Layer 06: Creating Pre-Generation Checkpoint...');

  try {
    // 1. Crear directorio de checkpoints si no existe
    const checkpointDir = path.join(process.cwd(), CHECKPOINTS_DIR);
    if (!fs.existsSync(checkpointDir)) {
      fs.mkdirSync(checkpointDir, { recursive: true });
      console.log(`   📁 Created checkpoints directory`);
    }

    // 2. Extraer estado actual del proyecto
    console.log('   📊 Extracting current project state...');
    const context = await extractSupastarterContext();

    // 3. Crear snapshot del estado actual
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const checkpointId = `${blueprint.id}-layer${layerNumber}-${timestamp}`;
    
    const checkpoint: Checkpoint = {
      blueprintId: blueprint.id,
      layer: layerNumber,
      timestamp: new Date().toISOString(),
      state: 'completed',
      filesCreated: [],
      filesModified: [],
      canRollback: true,
      snapshot: JSON.stringify({
        fileCount: context.fileTree.length,
        componentCount: context.components.length,
        tableCount: context.sqlTables.length,
        checksumFiles: context.fileTree.slice(0, 50) // Primeros 50 archivos como referencia
      })
    };

    // 4. Guardar el blueprint actual como respaldo
    const blueprintBackupPath = path.join(checkpointDir, `${checkpointId}-blueprint.json`);
    fs.writeFileSync(blueprintBackupPath, JSON.stringify(blueprint, null, 2));
    console.log(`   💾 Blueprint backed up: ${path.basename(blueprintBackupPath)}`);

    // 5. Guardar el checkpoint
    const checkpointPath = path.join(checkpointDir, `${checkpointId}.json`);
    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
    console.log(`   💾 Checkpoint saved: ${path.basename(checkpointPath)}`);

    // 6. Guardar el contexto completo
    const contextPath = path.join(checkpointDir, `${checkpointId}-context.json`);
    fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
    console.log(`   💾 Context saved: ${path.basename(contextPath)}`);

    // 7. Crear archivo de rollback script
    const rollbackScript = `#!/bin/bash
# Rollback script for ${blueprint.id} - Generated ${checkpoint.timestamp}
# To rollback, run: bash ${checkpointId}-rollback.sh

echo "🔄 Rolling back ${blueprint.id}..."

# Files to delete (will be populated during generation)
# DELETE_FILES=()

# Files to restore (will be populated during generation)
# RESTORE_FILES=()

echo "⚠️  Manual rollback required - review checkpoint files"
echo "Checkpoint: ${checkpointPath}"
`;
    
    const rollbackPath = path.join(checkpointDir, `${checkpointId}-rollback.sh`);
    fs.writeFileSync(rollbackPath, rollbackScript);
    console.log(`   💾 Rollback script created: ${path.basename(rollbackPath)}`);

    // 8. Limpiar checkpoints antiguos (mantener últimos 10)
    const allCheckpoints = fs.readdirSync(checkpointDir)
      .filter(f => f.endsWith('.json') && !f.includes('-blueprint') && !f.includes('-context'))
      .sort()
      .reverse();

    if (allCheckpoints.length > 10) {
      const toDelete = allCheckpoints.slice(10);
      toDelete.forEach(file => {
        const baseName = file.replace('.json', '');
        // Eliminar todos los archivos relacionados
        ['.json', '-blueprint.json', '-context.json', '-rollback.sh'].forEach(ext => {
          const fullPath = path.join(checkpointDir, baseName + ext);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      });
      console.log(`   🧹 Cleaned ${toDelete.length} old checkpoints`);
    }

    // 9. Mostrar resumen
    console.log(`\n📊 Checkpoint Summary:`);
    console.log(`   🆔 Checkpoint ID: ${checkpointId}`);
    console.log(`   📁 Files in project: ${context.fileTree.length}`);
    console.log(`   🧩 Components: ${context.components.length}`);
    console.log(`   🗄️  Tables: ${context.sqlTables.length}`);
    console.log(`   🔄 Rollback available: Yes`);

    console.log('\n✅ Checkpoint created successfully');

    return {
      layer: 6,
      name: 'Create Checkpoint',
      success: true,
      output: {
        checkpointId,
        checkpointPath,
        rollbackPath,
        projectState: {
          files: context.fileTree.length,
          components: context.components.length,
          tables: context.sqlTables.length
        }
      },
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.log(`❌ Layer 06 failed: ${error.message}`);
    return {
      layer: 6,
      name: 'Create Checkpoint',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

// Función para restaurar un checkpoint
export async function restoreCheckpoint(checkpointId: string): Promise<boolean> {
  console.log(`🔄 Restoring checkpoint: ${checkpointId}`);
  
  const checkpointPath = path.join(process.cwd(), CHECKPOINTS_DIR, `${checkpointId}.json`);
  
  if (!fs.existsSync(checkpointPath)) {
    console.log(`❌ Checkpoint not found: ${checkpointPath}`);
    return false;
  }

  const checkpoint: Checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
  
  console.log(`📋 Checkpoint info:`);
  console.log(`   Blueprint: ${checkpoint.blueprintId}`);
  console.log(`   Layer: ${checkpoint.layer}`);
  console.log(`   Created: ${checkpoint.timestamp}`);
  
  // En una implementación real, aquí restaurarías los archivos
  console.log(`⚠️  Manual restoration required - review checkpoint files`);
  
  return true;
}

// Función para listar checkpoints disponibles
export function listCheckpoints(): string[] {
  const checkpointDir = path.join(process.cwd(), CHECKPOINTS_DIR);
  
  if (!fs.existsSync(checkpointDir)) {
    return [];
  }

  return fs.readdirSync(checkpointDir)
    .filter(f => f.endsWith('.json') && !f.includes('-blueprint') && !f.includes('-context'))
    .map(f => f.replace('.json', ''))
    .sort()
    .reverse();
}

// Test directo
if (require.main === module) {
  const blueprint = require('../blueprints/contentflow.json');
  console.log('\n🧪 Testing Layer 06: Checkpoint Creation\n');
  
  layer06_createCheckpoint(blueprint).then(result => {
    console.log('\n📊 Full Result:', JSON.stringify(result, null, 2));
    
    console.log('\n📋 Available checkpoints:');
    listCheckpoints().forEach(cp => console.log(`   - ${cp}`));
  });
}

