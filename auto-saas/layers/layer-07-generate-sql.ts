// CAPA 7: Generación de SQL con Claude (Haiku - bajo costo)
// Genera migraciones SQL basadas en el blueprint

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { extractSupastarterContext } from '../utils/extract-context';

interface Blueprint {
  id: string;
  name: string;
  description: string;
  database: {
    new_tables: Array<{
      name: string;
      columns: string[];
      rls?: string[];
      indexes?: string[];
    }>;
  };
}

interface LayerResult {
  layer: number;
  name: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  timestamp: string;
  model?: string;
  tokens?: number;
}

export async function layer07_generateSQL(blueprint: Blueprint): Promise<LayerResult> {
  const startTime = Date.now();

  console.log(`🔄 Layer 07: Generating SQL for ${blueprint.name}...`);

  try {
    // 1. Verificar API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    // 2. Extraer contexto
    console.log('   📊 Extracting Supastarter context...');
    const context = await extractSupastarterContext();
    console.log(`   - Existing tables: ${context.sqlTables.join(', ')}`);

    // 3. Construir prompt conciso
    const prompt = `Generate PostgreSQL migration SQL for these tables. 
Existing tables (DO NOT recreate): ${context.sqlTables.join(', ')}

New tables needed:
${JSON.stringify(blueprint.database.new_tables, null, 2)}

Requirements:
- Use gen_random_uuid() for UUIDs
- Add created_at/updated_at timestamps
- Include RLS policies
- Add useful indexes
- Foreign keys with CASCADE

Output ONLY valid SQL, no explanations.`;

    // 4. Llamar a Claude Haiku (bajo costo)
    console.log('   🤖 Calling Claude Haiku...');
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    // 5. Extraer SQL
    const sqlContent = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // 6. Limpiar SQL (remover backticks si los hay)
    const cleanSQL = sqlContent
      .replace(/```sql\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    // 7. Guardar archivo
    const outputDir = path.join(process.cwd(), 'auto-saas/output', blueprint.id);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'migration.sql');
    const header = `-- Migration: ${blueprint.id}
-- Generated: ${new Date().toISOString()}
-- Model: claude-3-haiku-20240307
-- Blueprint: ${blueprint.name}

`;
    fs.writeFileSync(outputPath, header + cleanSQL);

    console.log(`   ✅ SQL saved to: ${outputPath}`);
    console.log(`   📊 Tokens used: ${response.usage?.output_tokens || 'N/A'}`);

    return {
      layer: 7,
      name: 'Generate SQL',
      success: true,
      output: cleanSQL,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      model: 'claude-3-haiku-20240307',
      tokens: response.usage?.output_tokens
    };

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      layer: 7,
      name: 'Generate SQL',
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

// Ejecutar directamente
if (require.main === module) {
  // Cargar .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }

  const blueprint = require('../blueprints/contentflow.json');
  console.log('\n🧪 Layer 07: SQL Generation with Claude Haiku\n');

  layer07_generateSQL(blueprint).then(result => {
    console.log('\n📊 Result:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Model: ${result.model}`);
    console.log(`   Tokens: ${result.tokens}`);
    
    if (result.success) {
      console.log('\n📄 Generated SQL:\n');
      console.log(result.output);
    } else {
      console.log(`\n❌ Error: ${result.error}`);
    }
  });
}
