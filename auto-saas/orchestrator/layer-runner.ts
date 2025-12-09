// ORQUESTADOR: Layer Runner
// Ejecuta las capas 1-6 secuencialmente y reporta resultados

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult } from '../types';
import { layer01_validateBlueprint } from '../layers/layer-01-validate-blueprint';
import { layer02_analyzeFeasibility } from '../layers/layer-02-analyze-feasibility';
import { layer04_analyzeConflicts } from '../layers/layer-04-analyze-conflicts';
import { layer05_generatePlan } from '../layers/layer-05-generate-plan';
import { layer06_createCheckpoint } from '../layers/layer-06-checkpoint';

interface RunnerResult {
  blueprintId: string;
  totalLayers: number;
  successfulLayers: number;
  failedLayers: number;
  results: LayerResult[];
  totalDuration: number;
  timestamp: string;
  canProceed: boolean;
}

export async function runPreparationLayers(blueprintPath: string): Promise<RunnerResult> {
  const startTime = Date.now();
  const results: LayerResult[] = [];
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🚀 AUTO-SAAS BUILDER - PREPARATION LAYERS (1-6)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let blueprint: Blueprint | null = null;
  let canProceed = true;

  // ═══════════════════════════════════════════════════════════════
  // CAPA 1: Validar Blueprint
  // ═══════════════════════════════════════════════════════════════
  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│  CAPA 1/6: Validación de Blueprint                          │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');
  
  const layer1Result = await layer01_validateBlueprint(blueprintPath);
  results.push(layer1Result);
  
  if (!layer1Result.success) {
    canProceed = false;
    console.log('\n🛑 STOPPING: Blueprint validation failed');
  } else {
    blueprint = layer1Result.output.blueprint;
  }

  // ═══════════════════════════════════════════════════════════════
  // CAPA 2: Analizar Viabilidad
  // ═══════════════════════════════════════════════════════════════
  if (canProceed && blueprint) {
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│  CAPA 2/6: Análisis de Viabilidad Técnica                   │');
    console.log('└─────────────────────────────────────────────────────────────┘\n');
    
    const layer2Result = await layer02_analyzeFeasibility(blueprint);
    results.push(layer2Result);
    
    if (!layer2Result.success) {
      canProceed = false;
      console.log('\n🛑 STOPPING: Feasibility analysis found blockers');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CAPA 3: Extraer Contexto (ya se hace en capas 2 y 4)
  // ═══════════════════════════════════════════════════════════════
  if (canProceed) {
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│  CAPA 3/6: Extracción de Contexto (integrada)               │');
    console.log('└─────────────────────────────────────────────────────────────┘\n');
    console.log('   ✅ Context extraction integrated in layers 2 and 4');
    
    results.push({
      layer: 3,
      name: 'Extract Context',
      success: true,
      output: 'Integrated in feasibility and conflict analysis',
      duration: 0,
      timestamp: new Date().toISOString()
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CAPA 4: Analizar Conflictos
  // ═══════════════════════════════════════════════════════════════
  if (canProceed && blueprint) {
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│  CAPA 4/6: Análisis de Conflictos                           │');
    console.log('└─────────────────────────────────────────────────────────────┘\n');
    
    const layer4Result = await layer04_analyzeConflicts(blueprint);
    results.push(layer4Result);
    
    if (!layer4Result.success) {
      canProceed = false;
      console.log('\n🛑 STOPPING: Blocking conflicts detected');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CAPA 5: Generar Plan de Ejecución
  // ═══════════════════════════════════════════════════════════════
  if (canProceed && blueprint) {
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│  CAPA 5/6: Generación de Plan de Ejecución                  │');
    console.log('└─────────────────────────────────────────────────────────────┘\n');
    
    const layer5Result = await layer05_generatePlan(blueprint);
    results.push(layer5Result);
    
    if (!layer5Result.success) {
      canProceed = false;
      console.log('\n🛑 STOPPING: Plan generation failed');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CAPA 6: Crear Checkpoint
  // ═══════════════════════════════════════════════════════════════
  if (canProceed && blueprint) {
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│  CAPA 6/6: Creación de Checkpoint                           │');
    console.log('└─────────────────────────────────────────────────────────────┘\n');
    
    const layer6Result = await layer06_createCheckpoint(blueprint);
    results.push(layer6Result);
    
    if (!layer6Result.success) {
      console.log('\n⚠️  WARNING: Checkpoint creation failed (non-blocking)');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RESUMEN FINAL
  // ═══════════════════════════════════════════════════════════════
  const successfulLayers = results.filter(r => r.success).length;
  const failedLayers = results.filter(r => !r.success).length;
  const totalDuration = Date.now() - startTime;

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   📊 PREPARATION LAYERS - SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`   Blueprint: ${blueprint?.name || 'N/A'}`);
  console.log(`   Total Layers: ${results.length}`);
  console.log(`   ✅ Successful: ${successfulLayers}`);
  console.log(`   ❌ Failed: ${failedLayers}`);
  console.log(`   ⏱️  Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`\n   Can Proceed to Generation: ${canProceed ? '✅ YES' : '❌ NO'}`);

  if (canProceed) {
    console.log('\n   🎯 Next Step: Run generation layers (7-14)');
    console.log('      Command: npx tsx auto-saas/orchestrator/run-generation.ts');
  } else {
    console.log('\n   🔧 Action Required: Fix the issues above before proceeding');
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  // Guardar resultados
  const outputDir = path.join(process.cwd(), 'auto-saas/output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const runnerResult: RunnerResult = {
    blueprintId: blueprint?.id || 'unknown',
    totalLayers: results.length,
    successfulLayers,
    failedLayers,
    results,
    totalDuration,
    timestamp: new Date().toISOString(),
    canProceed
  };

  const resultPath = path.join(outputDir, 'preparation-results.json');
  fs.writeFileSync(resultPath, JSON.stringify(runnerResult, null, 2));
  console.log(`📄 Results saved to: ${resultPath}`);

  return runnerResult;
}

// Ejecutar directamente
if (require.main === module) {
  const blueprintPath = process.argv[2] || path.join(process.cwd(), 'auto-saas/blueprints/contentflow.json');
  
  console.log(`\n📋 Using blueprint: ${blueprintPath}\n`);
  
  runPreparationLayers(blueprintPath).then(result => {
    process.exit(result.canProceed ? 0 : 1);
  });
}

