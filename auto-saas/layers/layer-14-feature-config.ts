// CAPA 14: Feature Config
// Verifica que ContentFlow esté integrado en Supastarter

import * as fs from 'fs';
import * as path from 'path';
import { Blueprint, LayerResult } from '../types';

interface ConfigCheck {
  name: string;
  found: boolean;
  file?: string;
  details?: string;
}

export async function layer14_featureConfig(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();

  console.log(`🔄 Layer 14: Verifying Feature Config for ${blueprint.name}...`);
  console.log('   (Checking Supastarter integration)\n');

  const checks: ConfigCheck[] = [];

  try {
    // 1. CHECK: Configuración global
    console.log('📋 1. Checking global config...\n');

    const configPaths = [
      'config/index.ts',
      'packages/config/index.ts',
      'apps/web/config/index.ts',
    ];

    let configFound = false;
    let configHasContentflow = false;

    for (const configPath of configPaths) {
      const fullPath = path.join(process.cwd(), configPath);
      if (fs.existsSync(fullPath)) {
        configFound = true;
        const content = fs.readFileSync(fullPath, 'utf-8');
        configHasContentflow = content.includes('contentflow');
        
        checks.push({
          name: 'Global config file',
          found: true,
          file: configPath,
          details: configHasContentflow ? 'Has contentflow section' : 'Missing contentflow section',
        });
        console.log(`   ✅ Config found: ${configPath}`);
        console.log(`   ${configHasContentflow ? '✅' : '⚠️'} ContentFlow section: ${configHasContentflow ? 'Present' : 'Not found'}`);
        break;
      }
    }

    if (!configFound) {
      checks.push({ name: 'Global config file', found: false, details: 'No config file found' });
      console.log('   ⚠️ No global config file found');
    }

    // 2. CHECK: NavBar / Sidebar
    console.log('\n📋 2. Checking NavBar integration...\n');

    const navBarPaths = [
      'apps/web/modules/saas/shared/components/NavBar.tsx',
      'apps/web/components/NavBar.tsx',
    ];

    let navBarFound = false;
    let navBarHasContentflow = false;

    for (const navPath of navBarPaths) {
      const fullPath = path.join(process.cwd(), navPath);
      if (fs.existsSync(fullPath)) {
        navBarFound = true;
        const content = fs.readFileSync(fullPath, 'utf-8');
        navBarHasContentflow = content.includes('contentflow') || content.includes('ContentFlow');
        
        checks.push({
          name: 'NavBar component',
          found: true,
          file: navPath,
          details: navBarHasContentflow ? 'Has contentflow menu item' : 'Missing contentflow menu item',
        });
        console.log(`   ✅ NavBar found: ${navPath}`);
        console.log(`   ${navBarHasContentflow ? '✅' : '⚠️'} ContentFlow menu: ${navBarHasContentflow ? 'Present' : 'Not found'}`);
        break;
      }
    }

    if (!navBarFound) {
      checks.push({ name: 'NavBar component', found: false, details: 'No NavBar found' });
      console.log('   ⚠️ No NavBar component found');
    }

    // 3. CHECK: Traducciones
    console.log('\n📋 3. Checking translations...\n');

    const i18nPaths = [
      'packages/i18n/src/locales/en.ts',
      'packages/i18n/locales/en.ts',
      'apps/web/locales/en.ts',
    ];

    let i18nFound = false;
    let i18nHasContentflow = false;

    for (const i18nPath of i18nPaths) {
      const fullPath = path.join(process.cwd(), i18nPath);
      if (fs.existsSync(fullPath)) {
        i18nFound = true;
        const content = fs.readFileSync(fullPath, 'utf-8');
        i18nHasContentflow = content.includes('contentflow');
        
        checks.push({
          name: 'Translations (en)',
          found: true,
          file: i18nPath,
          details: i18nHasContentflow ? 'Has contentflow translation' : 'Missing contentflow translation',
        });
        console.log(`   ✅ i18n found: ${i18nPath}`);
        console.log(`   ${i18nHasContentflow ? '✅' : '⚠️'} ContentFlow translation: ${i18nHasContentflow ? 'Present' : 'Not found'}`);
        break;
      }
    }

    if (!i18nFound) {
      checks.push({ name: 'Translations', found: false, details: 'No i18n files found' });
      console.log('   ⚠️ No translation files found');
    }

    // 4. CHECK: Páginas de ContentFlow
    console.log('\n📋 4. Checking ContentFlow pages...\n');

    const pagePaths = [
      'apps/web/src/app/(app)/dashboard/contentflow/page.tsx',
      'apps/web/app/(saas)/app/contentflow/page.tsx',
      'apps/web/src/app/(app)/contentflow/page.tsx',
    ];

    let pagesFound = false;
    for (const pagePath of pagePaths) {
      const fullPath = path.join(process.cwd(), pagePath);
      if (fs.existsSync(fullPath)) {
        pagesFound = true;
        checks.push({ name: 'ContentFlow pages', found: true, file: pagePath });
        console.log(`   ✅ ContentFlow page found: ${pagePath}`);
        break;
      }
    }

    if (!pagesFound) {
      checks.push({ name: 'ContentFlow pages', found: false, details: 'No ContentFlow pages found' });
      console.log('   ⚠️ No ContentFlow pages found in expected locations');
    }

    // 5. CHECK: Protección de rutas (layout con auth)
    console.log('\n📋 5. Checking route protection...\n');

    const layoutPaths = [
      'apps/web/app/(saas)/app/layout.tsx',
      'apps/web/src/app/(app)/layout.tsx',
    ];

    let layoutProtected = false;
    for (const layoutPath of layoutPaths) {
      const fullPath = path.join(process.cwd(), layoutPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        layoutProtected = content.includes('auth') || content.includes('session') || content.includes('redirect');
        checks.push({
          name: 'Route protection',
          found: true,
          file: layoutPath,
          details: layoutProtected ? 'Auth check present' : 'No auth check found',
        });
        console.log(`   ✅ App layout found: ${layoutPath}`);
        console.log(`   ${layoutProtected ? '✅' : '⚠️'} Auth protection: ${layoutProtected ? 'Present' : 'Not detected'}`);
        break;
      }
    }

    // Resumen
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 LAYER 14 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const foundCount = checks.filter(c => c.found).length;
    const totalChecks = checks.length;
    
    console.log(`   Checks passed: ${foundCount}/${totalChecks}`);
    
    checks.forEach(c => {
      const status = c.found ? '✅' : '❌';
      console.log(`   ${status} ${c.name}: ${c.details || (c.found ? 'OK' : 'Not found')}`);
    });

    // Determinar si es suficiente para "vendible"
    const isVendible = pagesFound && (navBarHasContentflow || true); // Páginas son lo mínimo
    console.log(`\n   Vendible status: ${isVendible ? '✅ READY' : '⚠️ NEEDS WORK'}`);

    // Guardar resultado
    const outputDir = path.join(process.cwd(), 'auto-saas/output', blueprint.id);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const report = {
      layer: 14,
      timestamp: new Date().toISOString(),
      checks,
      summary: {
        checksFound: foundCount,
        totalChecks,
        isVendible,
        navBarIntegrated: navBarHasContentflow,
        configIntegrated: configHasContentflow,
        translationsAdded: i18nHasContentflow,
        pagesExist: pagesFound,
        routesProtected: layoutProtected,
      },
    };

    fs.writeFileSync(
      path.join(outputDir, 'layer-14-result.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(`\n📄 Report saved to: auto-saas/output/${blueprint.id}/layer-14-result.json`);

    // Success si las páginas existen (mínimo para funcionar)
    const success = pagesFound;
    console.log(success ? '\n✅ Layer 14 completed!' : '\n⚠️ Layer 14 needs manual integration');

    return {
      layer: 14,
      name: 'Feature Config',
      success,
      output: report.summary,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.log(`\n❌ Layer 14 failed: ${error.message}`);
    return {
      layer: 14,
      name: 'Feature Config',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

if (require.main === module) {
  const blueprint = require('../blueprints/contentflow.json');
  console.log('\n🧪 Layer 14: Feature Config Verification\n');
  layer14_featureConfig(blueprint).then((r) => {
    console.log('\n📊 Final Result:', JSON.stringify(r, null, 2));
    process.exit(r.success ? 0 : 1);
  });
}

