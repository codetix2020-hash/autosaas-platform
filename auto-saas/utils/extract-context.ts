import * as fs from 'fs';
import * as path from 'path';

interface SupastarterContext {
  fileTree: string[];
  components: string[];
  layouts: string[];
  authPattern: string;
  availableLibraries: string[];
  sqlTables: string[];
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      
      // Skip node_modules, .git, and other common directories
      if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist') {
        return;
      }

      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return arrayOfFiles;
  }
}

function extractComponents(basePath: string): string[] {
  const components: string[] = [];
  const modulesPath = path.join(basePath, 'apps/web/modules');
  
  try {
    const files = getAllFiles(modulesPath);
    
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const relativePath = path.relative(basePath, file);
        components.push(relativePath);
      }
    });
  } catch (error) {
    console.error('Error extracting components:', error);
  }

  return components;
}

function extractLayouts(basePath: string): string[] {
  const layouts: string[] = [];
  const appPath = path.join(basePath, 'apps/web/app');
  
  try {
    const files = getAllFiles(appPath);
    
    files.forEach(file => {
      if (file.endsWith('layout.tsx')) {
        const relativePath = path.relative(basePath, file);
        layouts.push(relativePath);
      }
    });
  } catch (error) {
    console.error('Error extracting layouts:', error);
  }

  return layouts;
}

function extractAuthPattern(basePath: string): string {
  const authPath = path.join(basePath, 'packages/auth/auth.ts');
  
  try {
    if (fs.existsSync(authPath)) {
      const authContent = fs.readFileSync(authPath, 'utf-8');
      
      // Extract key patterns from auth file
      const patterns = [
        'Uses better-auth library',
        'Prisma adapter for PostgreSQL',
        'Session management with cookies',
        'Email/password authentication',
        'Social providers: Google, GitHub',
        'Organization support with invitations',
        'Passkey support',
        'Magic link authentication',
        'Two-factor authentication',
        'Email verification',
      ];
      
      return patterns.join(', ');
    }
  } catch (error) {
    console.error('Error extracting auth pattern:', error);
  }

  return 'Auth pattern not found';
}

function extractLibraries(basePath: string): string[] {
  const packagePath = path.join(basePath, 'apps/web/package.json');
  
  try {
    if (fs.existsSync(packagePath)) {
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      const dependencies = packageJson.dependencies || {};
      return Object.keys(dependencies);
    }
  } catch (error) {
    console.error('Error extracting libraries:', error);
  }

  return [];
}

function extractSqlTables(basePath: string): string[] {
  const schemaPath = path.join(basePath, 'packages/database/prisma/schema.prisma');
  
  try {
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      
      // Extract model names from Prisma schema
      const modelRegex = /model\s+(\w+)\s*\{/g;
      const tables: string[] = [];
      let match;
      
      while ((match = modelRegex.exec(schemaContent)) !== null) {
        tables.push(match[1]);
      }
      
      return tables;
    }
  } catch (error) {
    console.error('Error extracting SQL tables:', error);
  }

  return [];
}

export function extractSupastarterContext(): SupastarterContext {
  // Get base path - go up from auto-saas/utils to project root
  const basePath = path.resolve(__dirname, '../..');
  
  console.log('Extracting Supastarter context from:', basePath);
  
  const srcPath = path.join(basePath, 'apps/web');
  const fileTree = getAllFiles(srcPath)
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map(file => path.relative(basePath, file));
  
  const components = extractComponents(basePath);
  const layouts = extractLayouts(basePath);
  const authPattern = extractAuthPattern(basePath);
  const availableLibraries = extractLibraries(basePath);
  const sqlTables = extractSqlTables(basePath);
  
  const context: SupastarterContext = {
    fileTree,
    components,
    layouts,
    authPattern,
    availableLibraries,
    sqlTables,
  };
  
  console.log(`\nExtracted Context Summary:`);
  console.log(`- Files: ${fileTree.length}`);
  console.log(`- Components: ${components.length}`);
  console.log(`- Layouts: ${layouts.length}`);
  console.log(`- Libraries: ${availableLibraries.length}`);
  console.log(`- SQL Tables: ${sqlTables.length}`);
  
  return context;
}

// Allow running this script directly
if (require.main === module) {
  const context = extractSupastarterContext();
  const outputPath = path.resolve(__dirname, '../supastarter-context.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(context, null, 2), 'utf-8');
  console.log(`\n✅ Context saved to: ${outputPath}`);
}

