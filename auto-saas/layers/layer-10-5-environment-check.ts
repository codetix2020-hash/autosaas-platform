// CAPA 10.5: Pre-flight Environment & Dependency Check
// Valida que el entorno esté listo antes de avanzar a Components

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { LayerResult } from '../types';

interface CheckResult {
  name: string;
  status: 'ok' | 'missing' | 'warning';
  details: string;
  action?: string;
}

interface EnvironmentReport {
  ok: CheckResult[];
  missing: CheckResult[];
  warnings: CheckResult[];
  requiredActions: string[];
  canProceed: boolean;
}

export async function layer10_5_environmentCheck(): Promise<LayerResult> {
  const startTime = Date.now();
  const report: EnvironmentReport = {
    ok: [],
    missing: [],
    warnings: [],
    requiredActions: [],
    canProceed: true,
  };

  console.log('🔍 Layer 10.5: Pre-flight Environment Check\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ═══════════════════════════════════════════════════════════════
  // 1. CHECK: Variables de entorno
  // ═══════════════════════════════════════════════════════════════
  console.log('📋 1. Checking Environment Variables...\n');

  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    report.ok.push({ name: '.env.local exists', status: 'ok', details: 'File found' });
  } else {
    report.missing.push({
      name: '.env.local',
      status: 'missing',
      details: 'File not found',
      action: 'cp .env.local.example .env.local',
    });
    report.requiredActions.push('Create .env.local from .env.local.example');
    report.canProceed = false;
  }

  const requiredEnvVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', critical: true },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', critical: true },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', critical: true },
    { key: 'ANTHROPIC_API_KEY', critical: false },
  ];

  for (const envVar of requiredEnvVars) {
    const hasVar = envContent.includes(`${envVar.key}=`) && 
                   !envContent.includes(`${envVar.key}=your_`) &&
                   !envContent.includes(`${envVar.key}=tu_`) &&
                   !envContent.includes(`${envVar.key}=""`) &&
                   !envContent.includes(`${envVar.key}=\n`);

    if (hasVar) {
      console.log(`   ✅ ${envVar.key}`);
      report.ok.push({ name: envVar.key, status: 'ok', details: 'Configured' });
    } else if (envVar.critical) {
      console.log(`   ❌ ${envVar.key} (CRITICAL)`);
      report.missing.push({
        name: envVar.key,
        status: 'missing',
        details: 'Not configured or placeholder value',
        action: `Add ${envVar.key} to .env.local`,
      });
      report.requiredActions.push(`Configure ${envVar.key} in .env.local`);
      report.canProceed = false;
    } else {
      console.log(`   ⚠️  ${envVar.key} (optional)`);
      report.warnings.push({
        name: envVar.key,
        status: 'warning',
        details: 'Not configured (optional)',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. CHECK: Dependencias críticas
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📋 2. Checking Dependencies...\n');

  const criticalDeps = [
    '@supabase/supabase-js',
    '@tanstack/react-query',
    'zod',
    'next',
    'react',
  ];

  for (const dep of criticalDeps) {
    try {
      // Check in apps/web/package.json
      const packageJsonPath = path.join(process.cwd(), 'apps/web/package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };
        if (allDeps[dep]) {
          console.log(`   ✅ ${dep} (${allDeps[dep]})`);
          report.ok.push({ name: dep, status: 'ok', details: `Installed: ${allDeps[dep]}` });
        } else {
          throw new Error('Not found in package.json');
        }
      } else {
        throw new Error('package.json not found');
      }
    } catch {
      console.log(`   ❌ ${dep}`);
      report.missing.push({
        name: dep,
        status: 'missing',
        details: 'Not installed',
        action: `npx pnpm add ${dep} -w --filter web`,
      });
      report.requiredActions.push(`Install ${dep}: npx pnpm add ${dep} -w --filter web`);
      if (['@supabase/supabase-js', '@tanstack/react-query', 'zod'].includes(dep)) {
        report.canProceed = false;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. CHECK: Estructura de archivos ContentFlow
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📋 3. Checking ContentFlow Structure...\n');

  const requiredPaths = [
    { path: 'apps/web/src/types/contentflow-ai.ts', name: 'Types file' },
    { path: 'apps/web/src/hooks/contentflow/index.ts', name: 'Hooks index' },
    { path: 'apps/web/src/app/api/contentflow/agencies/route.ts', name: 'Agencies API' },
    { path: 'apps/web/src/app/api/contentflow/agency-clients/route.ts', name: 'Clients API' },
    { path: 'apps/web/src/app/api/contentflow/content-calendar/route.ts', name: 'Calendar API' },
    { path: 'apps/web/src/lib/api/client.ts', name: 'API Client' },
    { path: 'apps/web/src/lib/api/auth-helper.ts', name: 'Auth Helper' },
  ];

  for (const item of requiredPaths) {
    const fullPath = path.join(process.cwd(), item.path);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${item.name}`);
      report.ok.push({ name: item.name, status: 'ok', details: item.path });
    } else {
      console.log(`   ❌ ${item.name}`);
      report.missing.push({
        name: item.name,
        status: 'missing',
        details: `${item.path} not found`,
      });
      report.canProceed = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. CHECK: Supabase Client
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📋 4. Checking Supabase Client...\n');

  const supabaseClientPath = path.join(process.cwd(), 'apps/web/src/lib/supabase/server.ts');
  if (fs.existsSync(supabaseClientPath)) {
    const content = fs.readFileSync(supabaseClientPath, 'utf-8');
    if (content.includes('createClient') && content.includes('@supabase/supabase-js')) {
      console.log('   ✅ Supabase server client configured');
      report.ok.push({ name: 'Supabase Client', status: 'ok', details: 'Properly configured' });
    } else {
      console.log('   ⚠️  Supabase client file exists but may be incomplete');
      report.warnings.push({
        name: 'Supabase Client',
        status: 'warning',
        details: 'File exists but check configuration',
      });
    }
  } else {
    console.log('   ❌ Supabase server client not found');
    report.missing.push({
      name: 'Supabase Client',
      status: 'missing',
      details: 'apps/web/src/lib/supabase/server.ts not found',
    });
    report.canProceed = false;
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. CHECK: QueryClientProvider en layout
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📋 5. Checking React Query Provider...\n');

  const layoutPaths = [
    'apps/web/src/app/layout.tsx',
    'apps/web/app/layout.tsx',
    'src/app/layout.tsx',
  ];

  let queryProviderFound = false;
  for (const layoutPath of layoutPaths) {
    const fullPath = path.join(process.cwd(), layoutPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('QueryClientProvider') || content.includes('QueryClient')) {
        queryProviderFound = true;
        console.log('   ✅ QueryClientProvider found in layout');
        report.ok.push({ name: 'QueryClientProvider', status: 'ok', details: layoutPath });
        break;
      }
    }
  }

  if (!queryProviderFound) {
    console.log('   ⚠️  QueryClientProvider not found in layout');
    report.warnings.push({
      name: 'QueryClientProvider',
      status: 'warning',
      details: 'May need to wrap app with QueryClientProvider',
      action: 'Add QueryClientProvider to root layout',
    });
    report.requiredActions.push('Consider adding QueryClientProvider to root layout for hooks to work');
  }

  // ═══════════════════════════════════════════════════════════════
  // 6. CHECK: TypeScript alias @/
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📋 6. Checking TypeScript Alias...\n');

  const tsConfigPaths = [
    'apps/web/tsconfig.json',
    'tsconfig.json',
  ];

  let aliasConfigured = false;
  for (const tsPath of tsConfigPaths) {
    const fullPath = path.join(process.cwd(), tsPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Check for any path aliases (Supastarter uses custom aliases)
      if (content.includes('"paths"') && content.includes('"@')) {
        aliasConfigured = true;
        console.log('   ✅ TypeScript path aliases configured');
        report.ok.push({ name: 'TS Path Aliases', status: 'ok', details: tsPath });
        break;
      }
    }
  }

  if (!aliasConfigured) {
    console.log('   ⚠️  TypeScript path aliases not found');
    report.warnings.push({
      name: 'TS Path Aliases',
      status: 'warning',
      details: 'May need to configure path alias',
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 7. CHECK: Shadcn UI
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📋 7. Checking Shadcn UI...\n');

  const shadcnConfigPaths = [
    'apps/web/components.json',
    'components.json',
  ];

  let shadcnInstalled = false;
  for (const configPath of shadcnConfigPaths) {
    const fullPath = path.join(process.cwd(), configPath);
    if (fs.existsSync(fullPath)) {
      shadcnInstalled = true;
      console.log('   ✅ Shadcn UI configured');
      report.ok.push({ name: 'Shadcn UI', status: 'ok', details: configPath });
      break;
    }
  }

  if (!shadcnInstalled) {
    console.log('   ⚠️  Shadcn UI not detected (optional for basic components)');
    report.warnings.push({
      name: 'Shadcn UI',
      status: 'warning',
      details: 'Not installed - components will use basic HTML/Tailwind',
      action: 'npx shadcn@latest init (optional)',
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RESUMEN FINAL
  // ═══════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 ENVIRONMENT CHECK SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`   ✅ OK: ${report.ok.length}`);
  console.log(`   ❌ Missing: ${report.missing.length}`);
  console.log(`   ⚠️  Warnings: ${report.warnings.length}`);
  console.log(`\n   Can Proceed: ${report.canProceed ? '✅ YES' : '❌ NO'}`);

  if (report.requiredActions.length > 0) {
    console.log('\n📋 REQUIRED ACTIONS:');
    report.requiredActions.forEach((action, i) => {
      console.log(`   ${i + 1}. ${action}`);
    });
  }

  if (report.canProceed) {
    console.log('\n✅ Environment is ready for Capa 11 (React Components)');
  } else {
    console.log('\n❌ Fix the missing items above before proceeding');
  }

  // Save report
  const outputDir = path.join(process.cwd(), 'auto-saas/output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, 'environment-check.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📄 Full report saved to: auto-saas/output/environment-check.json`);

  return {
    layer: 10.5,
    name: 'Environment Check',
    success: report.canProceed,
    output: report,
    duration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    needsHumanReview: !report.canProceed,
  };
}

if (require.main === module) {
  console.log('\n🧪 Layer 10.5: Pre-flight Environment Check\n');
  layer10_5_environmentCheck().then((r) => {
    process.exit(r.success ? 0 : 1);
  });
}

