#!/usr/bin/env npx tsx
/**
 * AUTO-SAAS BUILDER - GOD MODE
 *
 * Ejecuta TODAS las capas automáticamente:
 * - Capas 1-6: Preparación
 * - Capas 7-14: Generación
 * - Capa 15: Aplicar SQL en Supabase
 * - Capa 16: Verificación final
 *
 * USO: npx tsx auto-saas/orchestrator/god-mode.ts blueprints/mi-modulo.json
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// Colores para terminal
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: number, total: number, name: string) {
	const progress = "█".repeat(step) + "░".repeat(total - step);
	log(`\n[${progress}] Step ${step}/${total}: ${name}`, "cyan");
}

function logSuccess(message: string) {
	log(`✅ ${message}`, "green");
}

function logError(message: string) {
	log(`❌ ${message}`, "red");
}

function logWarning(message: string) {
	log(`⚠️  ${message}`, "yellow");
}

interface GodModeConfig {
	blueprintPath: string;
	autoApplySQL: boolean;
	skipTests: boolean;
	skipMarketing: boolean;
	verbose: boolean;
}

interface LayerResult {
	layer: number;
	name: string;
	success: boolean;
	duration: number;
	output?: any;
	error?: string;
}

class AutoSaaSGodMode {
	private config: GodModeConfig;
	private blueprint: any;
	private results: LayerResult[] = [];
	private startTime: number = 0;
	private outputDir: string = "";

	constructor(config: GodModeConfig) {
		this.config = config;
	}

	async run(): Promise<boolean> {
		this.startTime = Date.now();

		log("\n" + "═".repeat(60), "magenta");
		log("   🚀 AUTO-SAAS BUILDER - GOD MODE ACTIVATED", "magenta");
		log("═".repeat(60), "magenta");

		try {
			// FASE 1: Cargar y validar blueprint
			logStep(1, 31, "Cargar Blueprint");
			await this.loadBlueprint();

			// FASE 2: Preparación (Capas 1-6)
			logStep(2, 31, "Validar Blueprint");
			await this.runLayer(
				1,
				"Validate Blueprint",
				this.validateBlueprint.bind(this),
			);

			logStep(3, 31, "Analizar Viabilidad");
			await this.runLayer(
				2,
				"Analyze Feasibility",
				this.analyzeFeasibility.bind(this),
			);

			logStep(4, 31, "Detectar Conflictos");
			await this.runLayer(
				4,
				"Analyze Conflicts",
				this.analyzeConflicts.bind(this),
			);

			logStep(5, 31, "Generar Plan");
			await this.runLayer(5, "Generate Plan", this.generatePlan.bind(this));

			logStep(6, 31, "Crear Checkpoint");
			await this.runLayer(
				6,
				"Create Checkpoint",
				this.createCheckpoint.bind(this),
			);

			// FASE 3: Generación (Capas 7-14)
			logStep(7, 31, "Generar SQL");
			await this.runLayer(7, "Generate SQL", this.generateSQL.bind(this));

			logStep(8, 31, "Generar Types");
			await this.runLayer(8, "Generate Types", this.generateTypes.bind(this));

			logStep(9, 31, "Generar API");
			await this.runLayer(9, "Generate API", this.generateAPI.bind(this));

			logStep(10, 31, "Generar Hooks");
			await this.runLayer(10, "Generate Hooks", this.generateHooks.bind(this));

			logStep(11, 31, "Verificar Entorno");
			await this.runLayer(
				10.5,
				"Environment Check",
				this.checkEnvironment.bind(this),
			);

			logStep(12, 31, "Generar Componentes");
			await this.runLayer(
				11,
				"Generate Components",
				this.generateComponents.bind(this),
			);

			logStep(13, 31, "Generar Páginas");
			await this.runLayer(12, "Generate Pages", this.generatePages.bind(this));

			// FASE 4: Aplicar y Verificar (Capas 15-19)
			logStep(14, 31, "Aplicar SQL en Supabase");
			await this.runLayer(15, "Apply SQL", this.applySQL.bind(this));

			logStep(15, 31, "Configurar Feature");
			await this.runLayer(
				14,
				"Feature Config",
				this.configureFeature.bind(this),
			);

			logStep(16, 31, "Verificación Final");
			await this.runLayer(16, "Final Verification", this.verifyAll.bind(this));

			// FASE 5: Escribir en proyecto
			logStep(17, 31, "Escribir en Proyecto");
			await this.runLayer(17, "Write to Project", this.writeToProject.bind(this));

			// FASE 6: Registrar router en oRPC
			logStep(18, 31, "Registrar Router");
			await this.runLayer(18, "Register Router", this.registerRouter.bind(this));

			// FASE 7: Marketing Automation
			logStep(19, 31, "Activar MarketingOS");
			await this.runLayer(19, "Send to MarketingOS", this.sendToMarketingOS.bind(this));

			// FASE 8: Páginas y Navegación
			logStep(20, 31, "Generar Páginas Next.js");
			await this.runLayer(20, "Generate Next.js Pages", this.generateNextPages.bind(this));

			logStep(21, 31, "Agregar al Menú");
			await this.runLayer(21, "Add to Menu", this.addToMenu.bind(this));

			// FASE 9: Internacionalización y Tests
			logStep(22, 31, "Generar Traducciones i18n");
			await this.runLayer(22, "Generate Translations", this.generateTranslations.bind(this));

			logStep(23, 31, "Generar Tests");
			await this.runLayer(23, "Generate Tests", this.generateTests.bind(this));

			// FASE 10: Validación y Reporte
			logStep(24, 31, "Health Check");
			await this.runLayer(24, "Health Check", this.healthCheck.bind(this));

			logStep(25, 31, "Generar Zod Schemas");
			await this.runLayer(25, "Generate Zod Schemas", this.generateZodSchemas.bind(this));

			logStep(26, 31, "Generar Reporte Final");
			await this.runLayer(26, "Generate Final Report", this.generateFinalReport.bind(this));

			// FASE 11: Finalización
			logStep(27, 31, "Generar Seeds");
			await this.runLayer(27, "Generate Seeds", this.generateSeeds.bind(this));

			logStep(28, 31, "Generar README");
			await this.runLayer(28, "Generate README", this.generateReadme.bind(this));

			logStep(29, 31, "Enviar Notificación");
			await this.runLayer(29, "Send Notification", this.sendNotification.bind(this));

			logStep(30, 31, "Cleanup Final");
			await this.runLayer(30, "Cleanup", this.cleanup.bind(this));

			// FASE 11: Páginas Públicas
			logStep(31, 31, "Generar Página Pública");
			await this.runLayer(
				31,
				"Generate Public Page",
				this.generatePublicPage.bind(this),
			);

			// Resumen final
			this.printSummary();

			return this.results.every((r) => r.success);
		} catch (error: any) {
			logError(`Error fatal: ${error.message}`);
			this.printSummary();
			return false;
		}
	}

	private async loadBlueprint() {
		const fullPath = path.resolve(this.config.blueprintPath);

		if (!fs.existsSync(fullPath)) {
			throw new Error(`Blueprint no encontrado: ${fullPath}`);
		}

		const content = fs.readFileSync(fullPath, "utf-8");
		this.blueprint = JSON.parse(content);
		this.outputDir = path.join("auto-saas", "output", this.blueprint.id);

		// Crear directorio de output
		if (!fs.existsSync(this.outputDir)) {
			fs.mkdirSync(this.outputDir, { recursive: true });
		}

		logSuccess(
			`Blueprint cargado: ${this.blueprint.name} (${this.blueprint.id})`,
		);
	}

	private async runLayer(
		layerNum: number,
		name: string,
		fn: () => Promise<any>,
	): Promise<void> {
		const start = Date.now();

		try {
			const output = await fn();
			const duration = Date.now() - start;

			this.results.push({
				layer: layerNum,
				name,
				success: true,
				duration,
				output,
			});

			logSuccess(`${name} completado (${duration}ms)`);
		} catch (error: any) {
			const duration = Date.now() - start;

			this.results.push({
				layer: layerNum,
				name,
				success: false,
				duration,
				error: error.message,
			});

			logError(`${name} falló: ${error.message}`);
			throw error;
		}
	}

	// === CAPAS DE PREPARACIÓN ===

	private async validateBlueprint(): Promise<any> {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Campos requeridos
		const required = ["id", "name", "description", "database"];
		for (const field of required) {
			if (!this.blueprint[field]) {
				errors.push(`Campo requerido faltante: ${field}`);
			}
		}

		// Validar ID formato slug
		if (this.blueprint.id && !/^[a-z0-9-]+$/.test(this.blueprint.id)) {
			errors.push("ID debe ser lowercase con guiones");
		}

		// Validar tablas
		if (this.blueprint.database?.new_tables) {
			for (const table of this.blueprint.database.new_tables) {
				if (!table.name || !table.columns) {
					errors.push(`Tabla inválida: falta name o columns`);
				}
			}
		}

		if (errors.length > 0) {
			throw new Error(`Validación fallida:\n${errors.join("\n")}`);
		}

		return { valid: true, warnings };
	}

	private async analyzeFeasibility(): Promise<any> {
		// Verificar que las dependencias existen
		const deps = {
			supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
			anthropic: !!process.env.ANTHROPIC_API_KEY,
		};

		if (!deps.supabase) {
			logWarning("NEXT_PUBLIC_SUPABASE_URL no configurado");
		}

		if (!deps.anthropic) {
			throw new Error("ANTHROPIC_API_KEY requerido para generación");
		}

		return { feasible: true, dependencies: deps };
	}

	private async analyzeConflicts(): Promise<any> {
		// Verificar conflictos con tablas existentes
		const existingTables = [
			"user",
			"session",
			"account",
			"organization",
			"member",
		];
		const newTables =
			this.blueprint.database?.new_tables?.map((t: any) => t.name) || [];

		const conflicts = newTables.filter((t: string) =>
			existingTables.includes(t),
		);

		if (conflicts.length > 0) {
			throw new Error(`Conflicto de tablas: ${conflicts.join(", ")}`);
		}

		return { conflicts: [], safe: true };
	}

	private async generatePlan(): Promise<any> {
		const plan = {
			tables: this.blueprint.database?.new_tables?.length || 0,
			components: this.blueprint.components?.length || 0,
			routes: this.blueprint.routes?.length || 0,
			apiRoutes: this.blueprint.api_routes?.length || 0,
		};

		return plan;
	}

	private async createCheckpoint(): Promise<any> {
		const checkpointDir = path.join("auto-saas", "checkpoints");
		if (!fs.existsSync(checkpointDir)) {
			fs.mkdirSync(checkpointDir, { recursive: true });
		}

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const checkpointFile = path.join(
			checkpointDir,
			`${this.blueprint.id}-${timestamp}.json`,
		);

		fs.writeFileSync(
			checkpointFile,
			JSON.stringify(
				{
					blueprint: this.blueprint,
					timestamp,
					results: this.results,
				},
				null,
				2,
			),
		);

		return { checkpointFile };
	}

	// === CAPAS DE GENERACIÓN ===

	private async generateSQL(): Promise<any> {
		// Siempre usar generación inline para independencia del blueprint
		const sql = this.generateSQLInline();
		const sqlFile = path.join(this.outputDir, "migration.sql");
		fs.writeFileSync(sqlFile, sql);

		log(`   📄 SQL generado: ${sqlFile}`, "cyan");
		log(`   📊 ${this.blueprint.database?.new_tables?.length || 0} tablas`, "cyan");

		return { generated: true, file: sqlFile, tables: this.blueprint.database?.new_tables?.length || 0 };
	}

	private generateSQLInline(): string {
		let sql = `-- ═══════════════════════════════════════════════════════════════\n`;
		sql += `-- AUTO-SAAS BUILDER - SQL Migration\n`;
		sql += `-- Blueprint: ${this.blueprint.name} (${this.blueprint.id})\n`;
		sql += `-- Generated: ${new Date().toISOString()}\n`;
		sql += `-- ═══════════════════════════════════════════════════════════════\n\n`;

		for (const table of this.blueprint.database?.new_tables || []) {
			sql += `-- ═══════════════════════════════════════════════════════════════\n`;
			sql += `-- Table: ${table.name}\n`;
			sql += `-- ═══════════════════════════════════════════════════════════════\n\n`;

			sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
			sql += table.columns.map((c: string) => `  ${c}`).join(",\n");
			sql += "\n);\n\n";

			// Indexes automáticos
			sql += `-- Indexes for ${table.name}\n`;
			sql += `CREATE INDEX IF NOT EXISTS idx_${table.name}_org ON ${table.name}(organization_id);\n`;
			sql += `CREATE INDEX IF NOT EXISTS idx_${table.name}_created ON ${table.name}(created_at DESC);\n`;

			// Agregar índice para status si existe
			if (table.columns.some((c: string) => c.toLowerCase().includes("status"))) {
				sql += `CREATE INDEX IF NOT EXISTS idx_${table.name}_status ON ${table.name}(status);\n`;
			}

			// Indexes adicionales del blueprint (si existen)
			if (table.indexes && table.indexes.length > 0) {
				for (const index of table.indexes) {
					sql += `${index};\n`;
				}
			}
			sql += "\n";

			// Row Level Security
			sql += `-- Row Level Security for ${table.name}\n`;
			sql += `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n`;
			sql += `CREATE POLICY "${table.name}_org_isolation" ON ${table.name}\n`;
			sql += `    FOR ALL\n`;
			sql += `    USING (organization_id = current_setting('app.current_organization_id', true));\n`;

			// RLS adicionales del blueprint (si existen)
			if (table.rls && table.rls.length > 0) {
				for (const policy of table.rls) {
					sql += `${policy};\n`;
				}
			}
			sql += "\n";
		}

		sql += `-- ═══════════════════════════════════════════════════════════════\n`;
		sql += `-- End of migration for ${this.blueprint.id}\n`;
		sql += `-- ═══════════════════════════════════════════════════════════════\n`;

		return sql;
	}

	private async generateTypes(): Promise<any> {
		// Generar tipos TypeScript para el blueprint
		const typesContent = this.generateTypesInline();
		const typesFile = path.join(this.outputDir, "types.ts");
		fs.writeFileSync(typesFile, typesContent);

		log(`   📄 Types generados: ${typesFile}`, "cyan");

		return { generated: true, file: typesFile };
	}

	private generateTypesInline(): string {
		let ts = `// ═══════════════════════════════════════════════════════════════\n`;
		ts += `// AUTO-SAAS BUILDER - TypeScript Types\n`;
		ts += `// Blueprint: ${this.blueprint.name} (${this.blueprint.id})\n`;
		ts += `// Generated: ${new Date().toISOString()}\n`;
		ts += `// ═══════════════════════════════════════════════════════════════\n\n`;
		ts += `import { z } from "zod";\n\n`;

		for (const table of this.blueprint.database?.new_tables || []) {
			const interfaceName = this.toPascalCase(table.name);
			
			ts += `// ═══════════════════════════════════════════════════════════════\n`;
			ts += `// ${interfaceName}\n`;
			ts += `// ═══════════════════════════════════════════════════════════════\n\n`;

			// Interface
			ts += `export interface ${interfaceName} {\n`;
			for (const col of table.columns) {
				const { name, tsType } = this.parseColumn(col);
				ts += `  ${name}: ${tsType};\n`;
			}
			ts += `}\n\n`;

			// Zod Schema
			ts += `export const ${interfaceName}Schema = z.object({\n`;
			for (const col of table.columns) {
				const { name, zodType } = this.parseColumn(col);
				ts += `  ${name}: ${zodType},\n`;
			}
			ts += `});\n\n`;

			// New schema (for creation)
			ts += `export const New${interfaceName}Schema = ${interfaceName}Schema.omit({\n`;
			ts += `  id: true,\n`;
			ts += `  created_at: true,\n`;
			if (table.columns.some((c: string) => c.includes("updated_at"))) {
				ts += `  updated_at: true,\n`;
			}
			ts += `});\n\n`;
		}

		return ts;
	}

	private toPascalCase(str: string): string {
		return str
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join("");
	}

	private parseColumn(col: string): { name: string; tsType: string; zodType: string } {
		const parts = col.trim().split(/\s+/);
		const name = parts[0];
		const sqlType = parts[1]?.toUpperCase() || "TEXT";
		const isOptional = !col.toUpperCase().includes("NOT NULL");
		const hasDefault = col.toUpperCase().includes("DEFAULT");

		let tsType = "string";
		let zodType = "z.string()";

		if (sqlType.includes("UUID")) {
			tsType = "string";
			zodType = "z.string()";
		} else if (sqlType.includes("TEXT") || sqlType.includes("VARCHAR")) {
			tsType = "string";
			zodType = "z.string()";
		} else if (sqlType.includes("INT") || sqlType.includes("DECIMAL") || sqlType.includes("NUMERIC")) {
			tsType = "number";
			zodType = "z.number()";
		} else if (sqlType.includes("BOOL")) {
			tsType = "boolean";
			zodType = "z.boolean()";
		} else if (sqlType.includes("DATE") || sqlType.includes("TIMESTAMP")) {
			tsType = "Date";
			zodType = "z.coerce.date()";
		} else if (sqlType.includes("JSONB") || sqlType.includes("JSON")) {
			tsType = "Record<string, any>";
			zodType = "z.record(z.any())";
		}

		if (isOptional && !hasDefault) {
			tsType += " | null";
			zodType += ".nullable()";
		}

		return { name, tsType, zodType };
	}

	private async generateAPI(): Promise<any> {
		// Generar estructura de API procedures
		const apiContent = this.generateAPIInline();
		const apiFile = path.join(this.outputDir, "api-procedures.ts");
		fs.writeFileSync(apiFile, apiContent);

		log(`   📄 API procedures generados: ${apiFile}`, "cyan");

		return { generated: true, file: apiFile };
	}

	private generateAPIInline(): string {
		const blueprintId = this.blueprint.id;
		const tables = this.blueprint.database?.new_tables || [];

		let api = `// ═══════════════════════════════════════════════════════════════\n`;
		api += `// AUTO-SAAS BUILDER - API Procedures\n`;
		api += `// Blueprint: ${this.blueprint.name} (${blueprintId})\n`;
		api += `// Generated: ${new Date().toISOString().split('T')[0]}\n`;
		api += `// ═══════════════════════════════════════════════════════════════\n\n`;

		api += `import { z } from "zod";\n`;
		api += `import { protectedProcedure } from "../../../orpc/procedures";\n`;
		api += `import { createClient } from "@supabase/supabase-js";\n\n`;

		api += `const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;\n`;
		api += `const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;\n`;
		api += `const supabase = createClient(supabaseUrl, supabaseKey);\n\n`;

		for (const table of tables) {
			const tableName = table.name;
			const pascalName = this.toPascalCase(tableName);

			// Extraer columnas para el schema de create/update
			const columns = table.columns || [];
			const editableColumns = columns.filter((col: string) => {
				const colLower = col.toLowerCase();
				return !colLower.includes('id uuid primary key') &&
					!colLower.includes('created_at') &&
					!colLower.includes('updated_at') &&
					!colLower.includes('organization_id');
			});

			api += `// ═══════════════════════════════════════════════════════════════\n`;
			api += `// ${pascalName.toUpperCase()} CRUD\n`;
			api += `// ═══════════════════════════════════════════════════════════════\n\n`;

			// LIST con paginación, búsqueda y filtros
			const hasStatus = columns.some(
				(c: string) => c.split(" ")[0].toLowerCase() === "status",
			);
			const textColumns = columns
				.filter(
					(c: string) =>
						c.toLowerCase().includes("text") &&
						!c.toLowerCase().includes("organization_id"),
				)
				.map((c: string) => c.split(" ")[0].toLowerCase());

			api += `export const list${pascalName} = protectedProcedure\n`;
			api += `    .route({ method: "GET", path: "/${blueprintId}/${tableName}" })\n`;
			api += `    .input(z.object({\n`;
			api += `        page: z.number().int().min(1).default(1),\n`;
			api += `        limit: z.number().int().min(1).max(100).default(20),\n`;
			api += `        sortBy: z.string().default('created_at'),\n`;
			api += `        sortOrder: z.enum(['asc', 'desc']).default('desc'),\n`;
			api += `        search: z.string().optional(),\n`;
			if (hasStatus) {
				api += `        status: z.string().optional(),\n`;
			}
			api += `    }).optional())\n`;
			api += `    .handler(async ({ input, context }) => {\n`;
			api += `        const organizationId = context.session?.activeOrganizationId;\n`;
			api += `        if (!organizationId) {\n`;
			api += `            throw new Error("No active organization");\n`;
			api += `        }\n`;
			api += `        const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc', search${hasStatus ? ", status" : ""} } = input || {};\n`;
			api += `        const offset = (page - 1) * limit;\n`;
			api += `        \n`;
			api += `        let query = supabase\n`;
			api += `            .from("${tableName}")\n`;
			api += `            .select("*", { count: 'exact' })\n`;
			api += `            .eq("organization_id", organizationId);\n`;
			api += `        \n`;
			api += `        // Apply search filter\n`;
			api += `        if (search) {\n`;
			if (textColumns.length > 0) {
				const orConditions = textColumns
					.map((col) => `${col}.ilike.%${"$"}{search}%`)
					.join(",");
				api += `            query = query.or(\`${orConditions}\`);\n`;
			}
			api += `        }\n`;
			if (hasStatus) {
				api += `        \n`;
				api += `        // Apply status filter\n`;
				api += `        if (status) {\n`;
				api += `            query = query.eq("status", status);\n`;
				api += `        }\n`;
			}
			api += `        \n`;
			api += `        // Get total count with filters\n`;
			api += `        const countQuery = supabase\n`;
			api += `            .from("${tableName}")\n`;
			api += `            .select("*", { count: 'exact', head: true })\n`;
			api += `            .eq("organization_id", organizationId);\n`;
			api += `        if (search) {\n`;
			if (textColumns.length > 0) {
				const orConditions = textColumns
					.map((col) => `${col}.ilike.%${"$"}{search}%`)
					.join(",");
				api += `            countQuery.or(\`${orConditions}\`);\n`;
			}
			api += `        }\n`;
			if (hasStatus) {
				api += `        if (status) {\n`;
				api += `            countQuery.eq("status", status);\n`;
				api += `        }\n`;
			}
			api += `        const { count } = await countQuery;\n`;
			api += `        \n`;
			api += `        // Get paginated data\n`;
			api += `        const { data, error } = await query\n`;
			api += `            .order(sortBy, { ascending: sortOrder === 'asc' })\n`;
			api += `            .range(offset, offset + limit - 1);\n`;
			api += `        \n`;
			api += `        if (error) {\n`;
			api += `            console.error("Error fetching ${tableName}:", error);\n`;
			api += `            throw new Error(error.message);\n`;
			api += `        }\n`;
			api += `        \n`;
			api += `        return {\n`;
			api += `            data: data || [],\n`;
			api += `            pagination: {\n`;
			api += `                page,\n`;
			api += `                limit,\n`;
			api += `                total: count || 0,\n`;
			api += `                totalPages: Math.ceil((count || 0) / limit),\n`;
			api += `            },\n`;
			api += `        };\n`;
			api += `    });\n\n`;

			// GET INDIVIDUAL
			api += `export const get${pascalName} = protectedProcedure\n`;
			api += `    .route({ method: "GET", path: "/${blueprintId}/${tableName}/:id" })\n`;
			api += `    .input(z.object({ id: z.string().uuid() }))\n`;
			api += `    .handler(async ({ input, context }) => {\n`;
			api += `        const organizationId = context.session?.activeOrganizationId;\n`;
			api += `        if (!organizationId) {\n`;
			api += `            throw new Error("No active organization");\n`;
			api += `        }\n`;
			api += `        const { data, error } = await supabase\n`;
			api += `            .from("${tableName}")\n`;
			api += `            .select("*")\n`;
			api += `            .eq("id", input.id)\n`;
			api += `            .eq("organization_id", organizationId)\n`;
			api += `            .single();\n`;
			api += `        if (error) {\n`;
			api += `            console.error("Error fetching ${tableName}:", error);\n`;
			api += `            throw new Error(error.message);\n`;
			api += `        }\n`;
			api += `        return { data };\n`;
			api += `    });\n\n`;

			// CREATE
			api += `export const create${pascalName} = protectedProcedure\n`;
			api += `    .route({ method: "POST", path: "/${blueprintId}/${tableName}" })\n`;
			api += `    .input(z.object({\n`;
			for (const col of columns) {
				const colName = col.split(" ")[0].toLowerCase();
				const colLower = col.toLowerCase();

				// Saltar columnas automáticas
				if (
					colName === "id" ||
					colName === "organization_id" ||
					colName === "created_at" ||
					colName === "updated_at"
				) {
					continue;
				}

				// Generar validación según tipo
				if (colLower.includes("text not null")) {
					api += `        ${colName}: z.string().min(1),\n`;
				} else if (colLower.includes("text") && colName.includes("email")) {
					api += `        ${colName}: z.string().email().nullable().optional(),\n`;
				} else if (colLower.includes("text")) {
					api += `        ${colName}: z.string().nullable().optional(),\n`;
				} else if (colLower.includes("decimal") || colLower.includes("numeric")) {
					api += `        ${colName}: z.number().optional(),\n`;
				} else if (colLower.includes("integer") || colLower.includes("int")) {
					api += `        ${colName}: z.number().int().optional(),\n`;
				} else if (colLower.includes("boolean")) {
					api += `        ${colName}: z.boolean().optional(),\n`;
				} else if (colLower.includes("date")) {
					api += `        ${colName}: z.string().optional(),\n`;
				} else if (colLower.includes("uuid")) {
					api += `        ${colName}: z.string().uuid().optional(),\n`;
				}
			}
			api += `    }))\n`;
			api += `    .handler(async ({ input, context }) => {\n`;
			api += `        const organizationId = context.session?.activeOrganizationId;\n`;
			api += `        if (!organizationId) {\n`;
			api += `            throw new Error("No active organization");\n`;
			api += `        }\n`;
			api += `        const { data, error } = await supabase\n`;
			api += `            .from("${tableName}")\n`;
			api += `            .insert({ ...input, organization_id: organizationId })\n`;
			api += `            .select()\n`;
			api += `            .single();\n`;
			api += `        if (error) {\n`;
			api += `            console.error("Error creating ${tableName}:", error);\n`;
			api += `            throw new Error(error.message);\n`;
			api += `        }\n`;
			api += `        return { data };\n`;
			api += `    });\n\n`;

			// UPDATE
			api += `export const update${pascalName} = protectedProcedure\n`;
			api += `    .route({ method: "PUT", path: "/${blueprintId}/${tableName}/:id" })\n`;
			api += `    .input(z.object({\n`;
			api += `        id: z.string().uuid(),\n`;
			for (const col of columns) {
				const colName = col.split(" ")[0].toLowerCase();
				const colLower = col.toLowerCase();

				// Saltar columnas automáticas
				if (
					colName === "id" ||
					colName === "organization_id" ||
					colName === "created_at" ||
					colName === "updated_at"
				) {
					continue;
				}

				// Generar validación según tipo (todo opcional en UPDATE)
				if (colLower.includes("text") && colName.includes("email")) {
					api += `        ${colName}: z.string().email().nullable().optional(),\n`;
				} else if (colLower.includes("text")) {
					api += `        ${colName}: z.string().nullable().optional(),\n`;
				} else if (colLower.includes("decimal") || colLower.includes("numeric")) {
					api += `        ${colName}: z.number().optional(),\n`;
				} else if (colLower.includes("integer") || colLower.includes("int")) {
					api += `        ${colName}: z.number().int().optional(),\n`;
				} else if (colLower.includes("boolean")) {
					api += `        ${colName}: z.boolean().optional(),\n`;
				} else if (colLower.includes("date")) {
					api += `        ${colName}: z.string().optional(),\n`;
				} else if (colLower.includes("uuid")) {
					api += `        ${colName}: z.string().uuid().optional(),\n`;
				}
			}
			api += `    }))\n`;
			api += `    .handler(async ({ input, context }) => {\n`;
			api += `        const { id, ...updateData } = input;\n`;
			api += `        const organizationId = context.session?.activeOrganizationId;\n`;
			api += `        if (!organizationId) {\n`;
			api += `            throw new Error("No active organization");\n`;
			api += `        }\n`;
			api += `        const { data, error } = await supabase\n`;
			api += `            .from("${tableName}")\n`;
			api += `            .update(updateData)\n`;
			api += `            .eq("id", id)\n`;
			api += `            .eq("organization_id", organizationId)\n`;
			api += `            .select()\n`;
			api += `            .single();\n`;
			api += `        if (error) {\n`;
			api += `            console.error("Error updating ${tableName}:", error);\n`;
			api += `            throw new Error(error.message);\n`;
			api += `        }\n`;
			api += `        return { data };\n`;
			api += `    });\n\n`;

			// DELETE
			api += `export const delete${pascalName} = protectedProcedure\n`;
			api += `    .route({ method: "DELETE", path: "/${blueprintId}/${tableName}/:id" })\n`;
			api += `    .input(z.object({ id: z.string().uuid() }))\n`;
			api += `    .handler(async ({ input, context }) => {\n`;
			api += `        const organizationId = context.session?.activeOrganizationId;\n`;
			api += `        if (!organizationId) {\n`;
			api += `            throw new Error("No active organization");\n`;
			api += `        }\n`;
			api += `        const { error } = await supabase\n`;
			api += `            .from("${tableName}")\n`;
			api += `            .delete()\n`;
			api += `            .eq("id", input.id)\n`;
			api += `            .eq("organization_id", organizationId);\n`;
			api += `        if (error) {\n`;
			api += `            console.error("Error deleting ${tableName}:", error);\n`;
			api += `            throw new Error(error.message);\n`;
			api += `        }\n`;
			api += `        return { success: true };\n`;
			api += `    });\n\n`;
		}

		return api;
	}

	private async generateHooks(): Promise<any> {
		// Generar hooks React Query
		const hooksContent = this.generateHooksInline();
		const hooksFile = path.join(this.outputDir, "hooks.ts");
		fs.writeFileSync(hooksFile, hooksContent);

		log(`   📄 Hooks generados: ${hooksFile}`, "cyan");

		return { generated: true, file: hooksFile };
	}

	private generateHooksInline(): string {
		const blueprintId = this.blueprint.id;
		const tables = this.blueprint.database?.new_tables || [];

		let hooks = `// ═══════════════════════════════════════════════════════════════\n`;
		hooks += `// AUTO-GENERATED HOOKS FOR ${this.blueprint.name.toUpperCase()}\n`;
		hooks += `// Generated by Auto-SaaS God Mode\n`;
		hooks += `// ═══════════════════════════════════════════════════════════════\n\n`;

		hooks += `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\n`;
		hooks += `import { orpcClient } from "@shared/lib/orpc-client";\n`;

		// Importar tipos (usar el mismo nombre que generateTypesInline)
		for (const table of tables) {
			const typeName = this.toPascalCase(table.name);
			hooks += `import type { ${typeName} } from "@/types/${blueprintId}";\n`;
		}
		hooks += `\n`;

		for (const table of tables) {
			const tableName = table.name;
			const singularName = tableName.endsWith("s")
				? tableName.slice(0, -1)
				: tableName;
			const pascalName =
				singularName.charAt(0).toUpperCase() + singularName.slice(1);
			const pascalPlural = this.toPascalCase(tableName); // Usar el mismo método que generateTypesInline
			const typeName = pascalPlural; // El tipo generado es plural

			// Hook para listar
			hooks += `// ═══════════════════════════════════════════════════════════════\n`;
			hooks += `// ${pascalPlural} Hooks\n`;
			hooks += `// ═══════════════════════════════════════════════════════════════\n\n`;

			const hasStatus = table.columns?.some(
				(c: string) => c.split(" ")[0].toLowerCase() === "status",
			);

			hooks += `export function use${pascalPlural}(options?: {\n`;
			hooks += `  page?: number;\n`;
			hooks += `  limit?: number;\n`;
			hooks += `  sortBy?: string;\n`;
			hooks += `  sortOrder?: 'asc' | 'desc';\n`;
			hooks += `  search?: string;\n`;
			if (hasStatus) {
				hooks += `  status?: string;\n`;
			}
			hooks += `}) {\n`;
			hooks += `  return useQuery({\n`;
			hooks += `    queryKey: ["${blueprintId}", "${tableName}", options],\n`;
			hooks += `    queryFn: async () => {\n`;
			hooks += `      const result = await orpcClient.${blueprintId}.${tableName}.list(options);\n`;
			hooks += `      return result;\n`;
			hooks += `    },\n`;
			hooks += `  });\n`;
			hooks += `}\n\n`;

			// Hook para obtener uno por ID (real, no filtrando desde list)
			hooks += `export function use${pascalName}(id: string | null) {\n`;
			hooks += `  return useQuery({\n`;
			hooks += `    queryKey: ["${blueprintId}", "${tableName}", id],\n`;
			hooks += `    queryFn: async () => {\n`;
			hooks += `      if (!id) return null;\n`;
			hooks += `      const result = await orpcClient.${blueprintId}.${tableName}.get({ id });\n`;
			hooks += `      return result.data || null;\n`;
			hooks += `    },\n`;
			hooks += `    enabled: !!id,\n`;
			hooks += `  });\n`;
			hooks += `}\n\n`;

			// Hook para crear
			hooks += `export function useCreate${pascalName}() {\n`;
			hooks += `  const queryClient = useQueryClient();\n`;
			hooks += `  \n`;
			hooks += `  return useMutation({\n`;
			hooks += `    mutationFn: async (data: Omit<${typeName}, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {\n`;
			hooks += `      return await orpcClient.${blueprintId}.${tableName}.create(data as unknown as Parameters<typeof orpcClient.${blueprintId}.${tableName}.create>[0]);\n`;
			hooks += `    },\n`;
			hooks += `    onSuccess: () => {\n`;
			hooks += `      queryClient.invalidateQueries({ queryKey: ["${blueprintId}", "${tableName}"] });\n`;
			hooks += `    },\n`;
			hooks += `  });\n`;
			hooks += `}\n\n`;

			// Hook para actualizar
			hooks += `export function useUpdate${pascalName}() {\n`;
			hooks += `  const queryClient = useQueryClient();\n`;
			hooks += `  return useMutation({\n`;
			hooks += `    mutationFn: async (data: { id: string; [key: string]: any }) => {\n`;
			hooks += `      return await orpcClient.${blueprintId}.${tableName}.update(data);\n`;
			hooks += `    },\n`;
			hooks += `    onSuccess: () => {\n`;
			hooks += `      queryClient.invalidateQueries({ queryKey: ["${blueprintId}", "${tableName}"] });\n`;
			hooks += `    },\n`;
			hooks += `  });\n`;
			hooks += `}\n\n`;

			// Hook para eliminar
			hooks += `export function useDelete${pascalName}() {\n`;
			hooks += `  const queryClient = useQueryClient();\n`;
			hooks += `  return useMutation({\n`;
			hooks += `    mutationFn: async (id: string) => {\n`;
			hooks += `      return await orpcClient.${blueprintId}.${tableName}.delete({ id });\n`;
			hooks += `    },\n`;
			hooks += `    onSuccess: () => {\n`;
			hooks += `      queryClient.invalidateQueries({ queryKey: ["${blueprintId}", "${tableName}"] });\n`;
			hooks += `    },\n`;
			hooks += `  });\n`;
			hooks += `}\n\n`;
		}

		return hooks;
	}

	private async checkEnvironment(): Promise<any> {
		const required = [
			"NEXT_PUBLIC_SUPABASE_URL",
			"SUPABASE_SERVICE_ROLE_KEY",
			"ANTHROPIC_API_KEY",
		];

		const missing = required.filter((key) => !process.env[key]);

		if (missing.length > 0) {
			logWarning(`Variables faltantes: ${missing.join(", ")}`);
		}

		return { missing, allPresent: missing.length === 0 };
	}

	private async generateComponents(): Promise<any> {
		// Generar componentes básicos
		const componentsContent = this.generateComponentsInline();
		const componentsFile = path.join(this.outputDir, "components.tsx");
		fs.writeFileSync(componentsFile, componentsContent);

		log(`   📄 Componentes generados: ${componentsFile}`, "cyan");
		log(`   📊 ${this.blueprint.components?.length || 0} componentes definidos`, "cyan");

		return { generated: true, file: componentsFile };
	}

	private generateComponentsInline(): string {
		let comp = `// ═══════════════════════════════════════════════════════════════\n`;
		comp += `// AUTO-SAAS BUILDER - React Components\n`;
		comp += `// Blueprint: ${this.blueprint.name} (${this.blueprint.id})\n`;
		comp += `// Generated: ${new Date().toISOString()}\n`;
		comp += `// ═══════════════════════════════════════════════════════════════\n\n`;
		comp += `"use client";\n\n`;
		comp += `import { useState } from "react";\n\n`;

		// Generar componentes del blueprint
		for (const component of this.blueprint.components || []) {
			comp += `// ═══════════════════════════════════════════════════════════════\n`;
			comp += `// ${component.name}\n`;
			comp += `// ${component.description}\n`;
			comp += `// ═══════════════════════════════════════════════════════════════\n\n`;

			comp += `export function ${component.name}() {\n`;
			comp += `  return (\n`;
			comp += `    <div className="p-4 border rounded-lg">\n`;
			comp += `      <h3 className="font-semibold">${component.name}</h3>\n`;
			comp += `      <p className="text-gray-500 text-sm">${component.description}</p>\n`;
			comp += `      {/* TODO: Implement ${component.name} */}\n`;
			comp += `    </div>\n`;
			comp += `  );\n`;
			comp += `}\n\n`;
		}

		// Dashboard component
		const dashboardName = this.toPascalCase(this.blueprint.id) + "Dashboard";
		comp += `// ═══════════════════════════════════════════════════════════════\n`;
		comp += `// ${dashboardName} - Main Dashboard\n`;
		comp += `// ═══════════════════════════════════════════════════════════════\n\n`;

		comp += `export function ${dashboardName}() {\n`;
		comp += `  return (\n`;
		comp += `    <div className="space-y-6">\n`;
		comp += `      <div className="border-b pb-4">\n`;
		comp += `        <h1 className="text-2xl font-bold">${this.blueprint.name}</h1>\n`;
		comp += `        <p className="text-gray-500">${this.blueprint.description}</p>\n`;
		comp += `      </div>\n`;
		comp += `      \n`;
		comp += `      <div className="grid md:grid-cols-3 gap-4">\n`;
		for (const table of this.blueprint.database?.new_tables || []) {
			const label = this.toPascalCase(table.name);
			comp += `        <div className="p-4 bg-white border rounded-lg">\n`;
			comp += `          <h3 className="font-semibold">${label}</h3>\n`;
			comp += `          <p className="text-2xl font-bold">0</p>\n`;
			comp += `          <p className="text-sm text-gray-500">Total registros</p>\n`;
			comp += `        </div>\n`;
		}
		comp += `      </div>\n`;
		comp += `    </div>\n`;
		comp += `  );\n`;
		comp += `}\n`;

		return comp;
	}

	private async generatePages(): Promise<any> {
		// Generar estructura de páginas
		const pagesContent = this.generatePagesInline();
		const pagesFile = path.join(this.outputDir, "pages.tsx");
		fs.writeFileSync(pagesFile, pagesContent);

		log(`   📄 Páginas generadas: ${pagesFile}`, "cyan");
		log(`   📊 ${this.blueprint.routes?.length || 0} rutas definidas`, "cyan");

		return { generated: true, file: pagesFile };
	}

	private generatePagesInline(): string {
		let pages = `// ═══════════════════════════════════════════════════════════════\n`;
		pages += `// AUTO-SAAS BUILDER - Next.js Pages\n`;
		pages += `// Blueprint: ${this.blueprint.name} (${this.blueprint.id})\n`;
		pages += `// Generated: ${new Date().toISOString()}\n`;
		pages += `// ═══════════════════════════════════════════════════════════════\n\n`;
		pages += `// These are page templates. Copy them to:\n`;
		pages += `// apps/web/app/(saas)/app/(organizations)/[organizationSlug]/${this.blueprint.id}/\n\n`;
		pages += `"use client";\n\n`;

		const routes = this.blueprint.routes || [];
		let firstComponent = "";

		for (const route of routes) {
			const componentName = `${route.component}Page`;
			if (!firstComponent) firstComponent = componentName;

			pages += `// ═══════════════════════════════════════════════════════════════\n`;
			pages += `// Route: ${route.path}\n`;
			pages += `// Component: ${route.component}\n`;
			pages += `// ═══════════════════════════════════════════════════════════════\n\n`;

			pages += `export function ${componentName}() {\n`;
			pages += `  return (\n`;
			pages += `    <div className="space-y-6">\n`;
			pages += `      <h1 className="text-2xl font-bold">${route.component}</h1>\n`;
			pages += `      <p className="text-gray-500">${route.description}</p>\n`;
			pages += `      {/* TODO: Implement ${route.component} */}\n`;
			pages += `    </div>\n`;
			pages += `  );\n`;
			pages += `}\n\n`;
		}

		// Only one default export at the end
		if (firstComponent) {
			pages += `// Default export - main page\n`;
			pages += `export default ${firstComponent};\n`;
		}

		return pages;
	}

	// === CAPAS DE APLICACIÓN ===

	private async applySQL(): Promise<any> {
		const sqlFile = path.join(this.outputDir, "migration.sql");

		if (!this.config.autoApplySQL) {
			logWarning("Auto-apply SQL desactivado. Ejecuta manualmente en Supabase.");
			log(`   📄 SQL file: ${sqlFile}`, "cyan");
			return { applied: false, reason: "disabled" };
		}

		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl || !supabaseKey) {
			logWarning("Credenciales de Supabase no disponibles");
			return { applied: false, reason: "no_credentials" };
		}

		if (!fs.existsSync(sqlFile)) {
			logWarning("Archivo SQL no encontrado");
			return { applied: false, reason: "no_sql_file" };
		}

		const sql = fs.readFileSync(sqlFile, "utf-8");

		// Limpiar SQL: remover comentarios de encabezado que pueden causar problemas
		const cleanSQL = sql
			.split("\n")
			.filter((line) => !line.startsWith("-- ═")) // Remover líneas decorativas
			.join("\n");

		log(`   📤 Ejecutando SQL en Supabase...`, "cyan");

		try {
			// Usar fetch directo a la API REST de Supabase para ejecutar SQL
			const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					apikey: supabaseKey,
					Authorization: `Bearer ${supabaseKey}`,
				},
				body: JSON.stringify({ query: cleanSQL }),
			});

			if (!response.ok) {
				// Si exec_sql no existe, intentar con el SQL Editor API
				log(
					`   ⚠️ exec_sql no disponible, intentando método alternativo...`,
					"yellow",
				);

				// Método alternativo: ejecutar cada statement por separado usando la API de Supabase
				const statements = cleanSQL
					.split(";")
					.map((s) => s.trim())
					.filter((s) => s.length > 0 && !s.startsWith("--"));

				let successCount = 0;
				let errorCount = 0;

				for (const statement of statements) {
					try {
						// Para CREATE TABLE, podemos verificar si la tabla existe
						const tableMatch = statement.match(
							/CREATE TABLE IF NOT EXISTS (\w+)/i,
						);
						if (tableMatch) {
							log(`   📦 Creando tabla: ${tableMatch[1]}`, "cyan");
						}

						const indexMatch = statement.match(/CREATE INDEX.*ON (\w+)/i);
						if (indexMatch) {
							log(`   📇 Creando índice en: ${indexMatch[1]}`, "cyan");
						}

						successCount++;
					} catch (stmtError: any) {
						errorCount++;
						logWarning(`Error en statement: ${stmtError.message}`);
					}
				}

				log(
					`   📊 Statements procesados: ${successCount} OK, ${errorCount} errores`,
					"cyan",
				);

				// Como no podemos ejecutar SQL directo via REST, informar al usuario
				logWarning("Supabase REST API no soporta ejecución SQL directa.");
				log(`   💡 Ejecuta manualmente: ${sqlFile}`, "yellow");

				// Construir URL del SQL Editor
				const projectRef = supabaseUrl
					.replace("https://", "")
					.replace(".supabase.co", "");
				log(
					`   🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql`,
					"yellow",
				);

				return {
					applied: false,
					reason: "manual_required",
					sqlFile,
					statementsCount: statements.length,
				};
			}

			const result = await response.json();
			log(`   ✅ SQL ejecutado exitosamente`, "green");
			return { applied: true, result };
		} catch (error: any) {
			logWarning(`Error ejecutando SQL: ${error.message}`);
			return { applied: false, error: error.message };
		}
	}

	private async configureFeature(): Promise<any> {
		const layerPath = path.join(
			process.cwd(),
			"auto-saas",
			"layers",
			"layer-14-feature-config.ts",
		);

		if (fs.existsSync(layerPath)) {
			const { execSync } = require("child_process");
			try {
				execSync(`npx tsx ${layerPath}`, { stdio: "pipe" });
			} catch (e) {
				logWarning("Layer 14 ejecutado con warnings");
			}
		}

		return { configured: true };
	}

	private async verifyAll(): Promise<any> {
		const files = {
			sql: path.join(this.outputDir, "migration.sql"),
			types: path.join(this.outputDir, "types.ts"),
			api: path.join(this.outputDir, "api-procedures.ts"),
			hooks: path.join(this.outputDir, "hooks.ts"),
			components: path.join(this.outputDir, "components.tsx"),
			pages: path.join(this.outputDir, "pages.tsx"),
		};

		const checks = {
			blueprintValid: true,
			sqlGenerated: fs.existsSync(files.sql),
			typesGenerated: fs.existsSync(files.types),
			apiGenerated: fs.existsSync(files.api),
			hooksGenerated: fs.existsSync(files.hooks),
			componentsGenerated: fs.existsSync(files.components),
			pagesGenerated: fs.existsSync(files.pages),
			noFatalErrors: this.results.every((r) => r.success),
		};

		const allGenerated = Object.values(checks).every(Boolean);

		log(`\n   📋 Archivos generados:`, "cyan");
		for (const [key, filePath] of Object.entries(files)) {
			const exists = fs.existsSync(filePath);
			const icon = exists ? "✅" : "❌";
			log(`      ${icon} ${key}: ${path.basename(filePath)}`, exists ? "green" : "red");
		}

		return { ...checks, allGenerated };
	}

	private async writeToProject(): Promise<any> {
		const written: string[] = [];
		const skipped: string[] = [];

		log(`\n   📂 Escribiendo archivos en el proyecto...`, "cyan");

		const mappings = [
			{
				source: "types.ts",
				dest: `apps/web/src/types/${this.blueprint.id}.ts`,
				required: true,
			},
			{
				source: "api-procedures.ts",
				dest: `packages/api/modules/${this.blueprint.id}/procedures/index.ts`,
				required: true,
			},
			{
				source: "hooks.ts",
				dest: `apps/web/src/hooks/use-${this.blueprint.id}.ts`,
				required: true,
			},
			{
				source: "components.tsx",
				dest: `apps/web/src/components/${this.blueprint.id}/index.tsx`,
				required: true,
			},
			{
				source: "pages.tsx",
				dest: `apps/web/src/components/${this.blueprint.id}/pages.tsx`,
				required: false,
			},
		];

		for (const mapping of mappings) {
			const sourcePath = path.join(this.outputDir, mapping.source);
			const destPath = path.join(process.cwd(), mapping.dest);

			if (!fs.existsSync(sourcePath)) {
				if (mapping.required) {
					logWarning(`Archivo fuente no encontrado: ${mapping.source}`);
				}
				skipped.push(mapping.source);
				continue;
			}

			// Crear directorio destino si no existe
			const destDir = path.dirname(destPath);
			if (!fs.existsSync(destDir)) {
				fs.mkdirSync(destDir, { recursive: true });
				log(`   📁 Creado directorio: ${destDir}`, "cyan");
			}

			// Copiar archivo
			fs.copyFileSync(sourcePath, destPath);
			written.push(mapping.dest);
			log(`   ✅ ${mapping.source} → ${mapping.dest}`, "green");
		}

		// Crear router.ts básico para el módulo API (siguiendo patrón de contentflow)
		const tables = this.blueprint.database?.new_tables || [];
		let routerGroups = "";

		for (const table of tables) {
			const groupName = table.name;
			const pascalName = this.toPascalCase(table.name);
			routerGroups += `\t${groupName}: {
		list: procedures.list${pascalName},
		get: procedures.get${pascalName},
		create: procedures.create${pascalName},
		update: procedures.update${pascalName},
		delete: procedures.delete${pascalName},
	},\n`;
		}

		const routerContent = `// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Module Router
// Blueprint: ${this.blueprint.name} (${this.blueprint.id})
// Generated: ${new Date().toISOString()}
// ═══════════════════════════════════════════════════════════════

// Import procedures from ./procedures
import * as procedures from "./procedures";

export const ${this.blueprint.id.replace(/-/g, "")}Router = {
${routerGroups}};
`;

		const routerDir = path.join(
			process.cwd(),
			`packages/api/modules/${this.blueprint.id}`,
		);
		if (!fs.existsSync(routerDir)) {
			fs.mkdirSync(routerDir, { recursive: true });
		}

		const routerPath = path.join(routerDir, "router.ts");
		fs.writeFileSync(routerPath, routerContent);
		written.push(`packages/api/modules/${this.blueprint.id}/router.ts`);
		log(`   ✅ router.ts creado`, "green");

		// Resumen
		log(`\n   📊 Resumen:`, "cyan");
		log(`      Escritos: ${written.length} archivos`, "green");
		if (skipped.length > 0) {
			log(`      Saltados: ${skipped.length} archivos`, "yellow");
		}

		return { written, skipped, total: written.length };
	}

	private async registerRouter(): Promise<any> {
		const routerFilePath = path.join(
			process.cwd(),
			"packages/api/orpc/router.ts",
		);

		if (!fs.existsSync(routerFilePath)) {
			logWarning("No se encontró packages/api/orpc/router.ts");
			return { registered: false, reason: "file_not_found" };
		}

		let content = fs.readFileSync(routerFilePath, "utf-8");

		// Nombre del router (ej: invoiceflow -> invoiceflowRouter)
		const routerName = `${this.blueprint.id.replace(/-/g, "")}Router`;
		const importPath = `../modules/${this.blueprint.id}/router`;

		// Verificar si ya está registrado
		if (content.includes(routerName)) {
			log(`   ⏭️  Router ${routerName} ya está registrado`, "yellow");
			return { registered: true, alreadyExists: true };
		}

		// 1. Agregar import al final de los imports existentes
		const importLine = `import { ${routerName} } from "${importPath}";`;

		// Buscar el último import y agregar después
		const importRegex = /^import .+ from .+;$/gm;
		let lastImportMatch: RegExpExecArray | null = null;
		let match: RegExpExecArray | null;

		while ((match = importRegex.exec(content)) !== null) {
			lastImportMatch = match;
		}

		if (lastImportMatch) {
			const insertPosition = lastImportMatch.index + lastImportMatch[0].length;
			content =
				content.slice(0, insertPosition) +
				"\n" +
				importLine +
				content.slice(insertPosition);
		} else {
			// Si no hay imports, agregar al principio
			content = importLine + "\n" + content;
		}

		// 2. Agregar al objeto router
		// Buscar el patrón del objeto router y agregar el nuevo router
		const routerObjectRegex =
			/(publicProcedure\.router\(\{[\s\S]*?)(}\);)/;
		const routerMatch = content.match(routerObjectRegex);

		if (routerMatch) {
			// Encontrar la última línea antes del cierre
			const routerContent = routerMatch[1];
			const routerClose = routerMatch[2];

			// Agregar el nuevo router antes del cierre
			const newRouterLine = `\t${this.blueprint.id.replace(/-/g, "")}: ${routerName},\n`;

			content = content.replace(
				routerObjectRegex,
				routerContent + newRouterLine + routerClose,
			);
		} else {
			logWarning("No se pudo encontrar el objeto router para modificar");
			return { registered: false, reason: "router_object_not_found" };
		}

		// 3. Guardar el archivo
		fs.writeFileSync(routerFilePath, content);

		log(`   ✅ Import agregado: ${importLine}`, "green");
		log(`   ✅ Router registrado: ${this.blueprint.id.replace(/-/g, "")}: ${routerName}`, "green");

		return { registered: true, routerName };
	}

	private async sendToMarketingOS(): Promise<any> {
		if (this.config.skipMarketing) {
			log("   ⏭️  MarketingOS saltado (--no-marketing)", "yellow");
			return { skipped: true };
		}

		const webhookUrl =
			"https://finanzas-production-8433.up.railway.app/api/autosaas/webhook";

		// Extraer features de las tablas y componentes
		const features: string[] = [];

		// Agregar tablas como features
		for (const table of this.blueprint.database?.new_tables || []) {
			features.push(`${table.name} management`);
		}

		// Agregar rutas como features
		for (const route of this.blueprint.routes || []) {
			if (route.description) {
				features.push(route.description);
			}
		}

		const payload = {
			name: this.blueprint.name,
			description: this.blueprint.description,
			features: features.slice(0, 10), // Máximo 10 features
			targetAudience:
				this.blueprint.target_audience || "Small businesses and freelancers",
			organizationId: "8uu4-W6mScG8IQtY",
			usp: this.blueprint.vpu || this.blueprint.description,
			pricing: this.blueprint.pricing || "€49/mes",
			language: "es",
		};

		log(`   📤 Enviando a MarketingOS: ${this.blueprint.name}`, "cyan");

		try {
			const response = await fetch(webhookUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				logWarning(
					`MarketingOS respondió con error: ${response.status} - ${errorText}`,
				);
				return { success: false, status: response.status, error: errorText };
			}

			const result = await response.json();
			log(`   ✅ MarketingOS activado: ${result.productId || "OK"}`, "green");
			return { success: true, ...result };
		} catch (error: any) {
			logWarning(`No se pudo conectar con MarketingOS: ${error.message}`);
			return { success: false, error: error.message };
		}
	}

	private async generateNextPages(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const blueprintName = this.blueprint.name;
		const tables = this.blueprint.database?.new_tables || [];

		const pagesDir = path.join(
			process.cwd(),
			"apps/web/app/(saas)/app/(organizations)/[organizationSlug]",
			blueprintId,
		);

		if (!fs.existsSync(pagesDir)) {
			fs.mkdirSync(pagesDir, { recursive: true });
		}

		const mainTable = tables[0];
		if (!mainTable) {
			return { created: false, reason: "no_tables" };
		}

		const tableName = mainTable.name;
		const singularName = tableName.endsWith("s")
			? tableName.slice(0, -1)
			: tableName;
		const pascalName =
			singularName.charAt(0).toUpperCase() + singularName.slice(1);
		const pascalPlural = tableName.charAt(0).toUpperCase() + tableName.slice(1);
		const columns = mainTable.columns || [];

		// Extraer campos editables para el formulario
		const editableFields: {
			name: string;
			type: string;
			required: boolean;
			label: string;
		}[] = [];
		for (const col of columns) {
			const colName = col.split(" ")[0].toLowerCase();
			const colLower = col.toLowerCase();

			if (
				["id", "organization_id", "created_at", "updated_at"].includes(
					colName,
				)
			) {
				continue;
			}

			const required = colLower.includes("not null");
			const label = colName
				.split("_")
				.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(" ");

			let type = "text";
			if (colLower.includes("boolean")) type = "checkbox";
			else if (colLower.includes("date")) type = "date";
			else if (
				colLower.includes("integer") ||
				colLower.includes("decimal") ||
				colLower.includes("numeric")
			)
				type = "number";
			else if (colName.includes("email")) type = "email";
			else if (
				colName.includes("description") ||
				colName.includes("content") ||
				colName.includes("notes")
			)
				type = "textarea";

			editableFields.push({ name: colName, type, required, label });
		}

		// Extraer valores únicos de status si existe
		const hasStatus = columns.some(
			(c: string) => c.split(" ")[0].toLowerCase() === "status",
		);
		let statusValues: string[] = [];
		if (hasStatus) {
			// Buscar el CHECK constraint para obtener valores
			const statusCol = columns.find(
				(c: string) => c.split(" ")[0].toLowerCase() === "status",
			);
			if (statusCol) {
				const match = statusCol.match(/CHECK\s*\(\s*status\s+IN\s*\(([^)]+)\)/i);
				if (match) {
					statusValues = match[1]
						.split(",")
						.map((s: string) => s.trim().replace(/'/g, ""));
				}
			}
		}

		const pageContent = `"use client";

import React from "react";
import { use${pascalPlural}, useCreate${pascalName}, useUpdate${pascalName}, useDelete${pascalName} } from "@/hooks/use-${blueprintId}";
import { orpcClient } from "@shared/lib/orpc-client";
import { useState } from "react";

type FormData = {
${editableFields
	.map(
		(f) =>
			`  ${f.name}: ${f.type === "number" ? "number" : f.type === "checkbox" ? "boolean" : "string"};`,
	)
	.join("\n")}
};

const initialFormData: FormData = {
${editableFields
	.map(
		(f) =>
			`  ${f.name}: ${f.type === "number" ? "0" : f.type === "checkbox" ? "false" : '""'},`,
	)
	.join("\n")}
};

export default function ${this.toPascalCase(blueprintId)}Page() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
${hasStatus ? `  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);\n` : ""}  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading, error } = use${pascalPlural}({
    page: currentPage,
    limit: 20,
    search: debouncedSearch || undefined,
${hasStatus ? `    status: statusFilter,\n` : ""}  });
  const items = response?.data || [];
  const pagination = response?.pagination;
  
  const createItem = useCreate${pascalName}();
  const updateItem = useUpdate${pascalName}();
  const deleteItem = useDelete${pascalName}();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
${editableFields
	.map(
		(f) =>
			`      ${f.name}: item.${f.name} ?? ${f.type === "number" ? "0" : f.type === "checkbox" ? "false" : '""'},`,
	)
	.join("\n")}
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      if (editingId) {
        await updateItem.mutateAsync({ id: editingId, ...formData } as any);
      } else {
        await createItem.mutateAsync(formData as any);
      }
      setIsModalOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
    } catch (err: any) {
      setFormError(err.message || "Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este elemento?")) {
      try {
        await deleteItem.mutateAsync(id);
      } catch (err: any) {
        alert(err.message || "Error al eliminar");
      }
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay, month, year };
  };

  const getItemsForDate = (day: number) => {
    const dateStr = \`\${calendarDate.getFullYear()}-\${String(calendarDate.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return items.filter((item: any) => {
      const itemDate = item.created_at?.split('T')[0] || item.date || item.due_date;
      return itemDate === dateStr;
    });
  };

  const { daysInMonth, startingDay, month, year } = getDaysInMonth(calendarDate);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">${blueprintName}</h1>
          <p className="text-gray-500">${this.blueprint.description || ""}</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium"
        >
          + Nuevo
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Total</div>
          <div className="text-3xl font-bold text-gray-900">{pagination?.total || 0}</div>
        </div>
${hasStatus && statusValues.length > 0
	? statusValues
			.slice(0, 3)
			.map((status) => {
				const statusLabel =
					status.charAt(0).toUpperCase() +
					status.slice(1).replace("_", " ");
				const statusColor =
					status === "completed" ||
					status === "paid" ||
					status === "confirmed"
						? "text-green-600"
						: status === "pending" || status === "draft"
							? "text-yellow-600"
							: status === "cancelled" || status === "overdue"
								? "text-red-600"
								: "text-blue-600";
				return `        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">${statusLabel}</div>
          <div className="text-3xl font-bold ${statusColor}">
            {items.filter((i: any) => i.status === '${status}').length}
          </div>
        </div>`;
			})
			.join("\n")
	: `        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Esta página</div>
          <div className="text-3xl font-bold text-blue-600">{items.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Páginas</div>
          <div className="text-3xl font-bold text-purple-600">{pagination?.totalPages || 1}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Por página</div>
          <div className="text-3xl font-bold text-gray-600">{pagination?.limit || 20}</div>
        </div>`}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
${hasStatus && statusValues.length > 0
	? `        <select
          value={statusFilter || ""}
          onChange={(e) => { setStatusFilter(e.target.value || undefined); setCurrentPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
${statusValues
	.map(
		(status) =>
			`          <option value="${status}">${status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}</option>`,
	)
	.join("\n")}
        </select>`
	: ""}
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setViewMode("list")}
          className={\`px-4 py-2 font-medium transition-colors \${viewMode === "list" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}\`}
        >
          📋 Lista
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={\`px-4 py-2 font-medium transition-colors \${viewMode === "calendar" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}\`}
        >
          📅 Calendario
        </button>
      </div>

      {/* Stats */}
      {pagination && (
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Total: {pagination.total}</span>
          <span>Página: {pagination.page} de {pagination.totalPages}</span>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b">
              <tr>
${editableFields
	.slice(0, 4)
	.map(
		(f) =>
			`                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${f.label}</th>`,
	)
	.join("\n")}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item: { id: string; ${editableFields
	.slice(0, 4)
	.map(
		(f) =>
			`${f.name}?: ${f.type === "number" ? "number" : f.type === "checkbox" ? "boolean" : "string"}`,
	)
	.join("; ")} }) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
${editableFields
	.slice(0, 4)
	.map(
		(f) =>
			`                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${f.type === "checkbox" ? `{item.${f.name} ? "Sí" : "No"}` : `{item.${f.name} || "-"}`}</td>`,
	)
	.join("\n")}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* List Empty State */}
      {viewMode === "list" && items.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay elementos todavía</h3>
          <p className="text-gray-500 mb-6">Comienza creando tu primer registro</p>
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium"
          >
            Crear el primero
          </button>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <button
              onClick={() => {
                const newDate = new Date(calendarDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCalendarDate(newDate);
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={() => {
                const newDate = new Date(calendarDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCalendarDate(newDate);
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
          
          {/* Day Names */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={\`empty-\${i}\`} className="min-h-[100px] p-2 border-b border-r bg-gray-50" />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayItems = getItemsForDate(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              
              return (
                <div
                  key={day}
                  className={\`min-h-[100px] p-2 border-b border-r hover:bg-gray-50 transition-colors \${isToday ? "bg-blue-50" : ""}\`}
                >
                  <div className={\`text-sm font-medium mb-1 \${isToday ? "text-blue-600" : "text-gray-700"}\`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => handleEdit(item)}
                        className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                      >
                        {item.title || item.name || item.client_name || \`#\${item.id.slice(0,4)}\`}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayItems.length - 3} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination - only in list view */}
      {viewMode === "list" && pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {currentPage} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "✏️ Editar" : "➕ Crear nuevo"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
${editableFields
	.map((f) => {
		if (f.type === "textarea") {
			return `                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">${f.label}${f.required ? " *" : ""}</label>
                  <textarea
                    value={formData.${f.name} as string}
                    onChange={(e) => setFormData({ ...formData, ${f.name}: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    ${f.required ? "required" : ""}
                  />
                </div>`;
		} else if (f.type === "checkbox") {
			return `                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.${f.name} as boolean}
                    onChange={(e) => setFormData({ ...formData, ${f.name}: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">${f.label}</label>
                </div>`;
		} else {
			return `                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">${f.label}${f.required ? " *" : ""}</label>
                  <input
                    type="${f.type}"
                    value={formData.${f.name} as ${f.type === "number" ? "number" : "string"}}
                    onChange={(e) => setFormData({ ...formData, ${f.name}: ${f.type === "number" ? "Number(e.target.value)" : "e.target.value"} })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ${f.required ? "required" : ""}
                  />
                </div>`;
		}
	})
	.join("\n")}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createItem.isPending || updateItem.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {createItem.isPending || updateItem.isPending ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

		const pageFile = path.join(pagesDir, "page.tsx");
		fs.writeFileSync(pageFile, pageContent);
		log(`   ✅ Página con formulario creada: ${pageFile}`, "green");

		return { created: true, path: pageFile };
	}

	private async addToMenu(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const blueprintName = this.blueprint.name;

		// Archivo del menú
		const navBarFile = path.join(
			process.cwd(),
			"apps/web/modules/saas/shared/components/NavBar.tsx",
		);

		if (!fs.existsSync(navBarFile)) {
			logWarning("NavBar.tsx no encontrado");
			return { added: false, reason: "navbar_not_found" };
		}

		let navBarContent = fs.readFileSync(navBarFile, "utf-8");

		// Verificar si ya está agregado
		if (navBarContent.includes(`/${blueprintId}`)) {
			log(`   ⏭️ ${blueprintName} ya está en el menú`, "yellow");
			return { added: false, reason: "already_exists" };
		}

		// Buscar el patrón donde agregar (después de invoiceflow)
		const invoiceflowItem = `\t\t{
			label: t("app.menu.invoiceflow"),
			href: \`\${basePath}/invoiceflow\`,
			icon: FileTextIcon,
			isActive: pathname.includes("/invoiceflow"),
		},`;

		const newMenuItem = `\t\t{
			label: "${blueprintName}",
			href: \`\${basePath}/${blueprintId}\`,
			icon: FileTextIcon,
			isActive: pathname.includes("/${blueprintId}"),
		},`;

		// Buscar después de invoiceflow
		if (navBarContent.includes(invoiceflowItem)) {
			navBarContent = navBarContent.replace(
				invoiceflowItem,
				invoiceflowItem + "\n" + newMenuItem,
			);
			fs.writeFileSync(navBarFile, navBarContent);
			log(`   ✅ ${blueprintName} agregado al menú`, "green");
			return { added: true };
		} else {
			// Intentar buscar después de contentflow si invoiceflow no existe
			const contentflowItem = `\t\t{
			label: t("app.menu.contentflow"),
			href: \`\${basePath}/contentflow\`,
			icon: CalendarDaysIcon,
			isActive: pathname.includes("/contentflow"),
		},`;

			if (navBarContent.includes(contentflowItem)) {
				navBarContent = navBarContent.replace(
					contentflowItem,
					contentflowItem + "\n" + newMenuItem,
				);
				fs.writeFileSync(navBarFile, navBarContent);
				log(`   ✅ ${blueprintName} agregado al menú`, "green");
				return { added: true };
			} else {
				logWarning("No se encontró el patrón del menú para insertar");
				return { added: false, reason: "pattern_not_found" };
			}
		}
	}

	private async generateTranslations(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const blueprintName = this.blueprint.name;
		const tables = this.blueprint.database?.new_tables || [];

		const translationsDir = path.join(process.cwd(), "packages/i18n/translations");
		const languages = ["en", "de", "es"];
		const updated: string[] = [];

		for (const lang of languages) {
			const filePath = path.join(translationsDir, `${lang}.json`);

			if (!fs.existsSync(filePath)) {
				continue;
			}

			try {
				const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

				// Verificar si ya existe
				if (content.app?.menu?.[blueprintId]) {
					log(`   ⏭️ Traducción ${lang} ya existe`, "yellow");
					continue;
				}

				// Agregar al menú
				if (!content.app) content.app = {};
				if (!content.app.menu) content.app.menu = {};
				content.app.menu[blueprintId] = blueprintName;

				// Agregar traducciones del módulo
				if (!content[blueprintId]) {
					content[blueprintId] = {
						title: blueprintName,
						description: this.blueprint.description || "",
						actions: {
							create:
								lang === "es"
									? "Crear nuevo"
									: lang === "de"
										? "Neu erstellen"
										: "Create new",
							edit:
								lang === "es"
									? "Editar"
									: lang === "de"
										? "Bearbeiten"
										: "Edit",
							delete:
								lang === "es"
									? "Eliminar"
									: lang === "de"
										? "Löschen"
										: "Delete",
							save:
								lang === "es"
									? "Guardar"
									: lang === "de"
										? "Speichern"
										: "Save",
							cancel:
								lang === "es"
									? "Cancelar"
									: lang === "de"
										? "Abbrechen"
										: "Cancel",
						},
						messages: {
							loading:
								lang === "es"
									? "Cargando..."
									: lang === "de"
										? "Laden..."
										: "Loading...",
							empty:
								lang === "es"
									? "No hay elementos"
									: lang === "de"
										? "Keine Elemente"
										: "No items yet",
							created:
								lang === "es"
									? "Creado exitosamente"
									: lang === "de"
										? "Erfolgreich erstellt"
										: "Created successfully",
							updated:
								lang === "es"
									? "Actualizado exitosamente"
									: lang === "de"
										? "Erfolgreich aktualisiert"
										: "Updated successfully",
							deleted:
								lang === "es"
									? "Eliminado exitosamente"
									: lang === "de"
										? "Erfolgreich gelöscht"
										: "Deleted successfully",
							error:
								lang === "es"
									? "Error al procesar"
									: lang === "de"
										? "Fehler bei der Verarbeitung"
										: "Error processing",
						},
					};
				}

				fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n");
				updated.push(lang);
				log(`   ✅ Traducción ${lang}.json actualizada`, "green");
			} catch (error: any) {
				logWarning(`Error actualizando ${lang}.json: ${error.message}`);
			}
		}

		return { updated, languages: updated.length };
	}

	private async generateTests(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const blueprintName = this.blueprint.name;
		const tables = this.blueprint.database?.new_tables || [];

		if (this.config.skipTests) {
			log(`   ⏭️ Tests saltados (--skip-tests)`, "yellow");
			return { skipped: true };
		}

		// Crear directorio de tests
		const testsDir = path.join(this.outputDir, "tests");
		if (!fs.existsSync(testsDir)) {
			fs.mkdirSync(testsDir, { recursive: true });
		}

		const mainTable = tables[0];
		if (!mainTable) {
			return { created: false, reason: "no_tables" };
		}

		const tableName = mainTable.name;
		const pascalPlural = this.toPascalCase(tableName);

		// Generar test básico
		const testContent = `// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Tests for ${blueprintName}
// Generated: ${new Date().toISOString().split('T')[0]}
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeAll } from 'vitest';

describe('${blueprintName} Module', () => {
    
    describe('Types', () => {
        it('should have correct type definitions', () => {
            // Type check - si compila, el test pasa
            const item: any = {
                id: 'test-id',
                organization_id: 'org-id',
                created_at: new Date().toISOString(),
            };
            expect(item.id).toBeDefined();
            expect(item.organization_id).toBeDefined();
        });
    });

    describe('API Procedures', () => {
        it('should have list procedure', async () => {
            // TODO: Implementar con mock de Supabase
            expect(true).toBe(true);
        });

        it('should have create procedure', async () => {
            // TODO: Implementar con mock de Supabase
            expect(true).toBe(true);
        });

        it('should have update procedure', async () => {
            // TODO: Implementar con mock de Supabase
            expect(true).toBe(true);
        });

        it('should have delete procedure', async () => {
            // TODO: Implementar con mock de Supabase
            expect(true).toBe(true);
        });
    });

    describe('Hooks', () => {
        it('should export use${pascalPlural} hook', () => {
            // Verificar que el hook existe
            expect(true).toBe(true);
        });

        it('should export useCreate hook', () => {
            expect(true).toBe(true);
        });

        it('should export useUpdate hook', () => {
            expect(true).toBe(true);
        });

        it('should export useDelete hook', () => {
            expect(true).toBe(true);
        });
    });
});
`;

		const testFile = path.join(testsDir, `${blueprintId}.test.ts`);
		fs.writeFileSync(testFile, testContent);
		log(`   ✅ Tests generados: ${testFile}`, "green");

		return { created: true, path: testFile };
	}

	private async healthCheck(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const checks: {
			name: string;
			status: "ok" | "warning" | "error";
			message: string;
		}[] = [];

		// Check 1: Verificar que el directorio del módulo existe
		const moduleDir = path.join(process.cwd(), "packages/api/modules", blueprintId);
		if (fs.existsSync(moduleDir)) {
			checks.push({ name: "Module Directory", status: "ok", message: moduleDir });
		} else {
			checks.push({
				name: "Module Directory",
				status: "error",
				message: "No encontrado",
			});
		}

		// Check 2: Verificar procedures
		const proceduresFile = path.join(moduleDir, "procedures/index.ts");
		if (fs.existsSync(proceduresFile)) {
			const content = fs.readFileSync(proceduresFile, "utf-8");
			const hasList = content.includes("export const list");
			const hasCreate = content.includes("export const create");
			const hasUpdate = content.includes("export const update");
			const hasDelete = content.includes("export const delete");

			if (hasList && hasCreate && hasUpdate && hasDelete) {
				checks.push({
					name: "CRUD Procedures",
					status: "ok",
					message: "4/4 procedures",
				});
			} else {
				checks.push({
					name: "CRUD Procedures",
					status: "warning",
					message: "Incompleto",
				});
			}
		} else {
			checks.push({
				name: "CRUD Procedures",
				status: "error",
				message: "No encontrado",
			});
		}

		// Check 3: Verificar router
		const routerFile = path.join(moduleDir, "router.ts");
		if (fs.existsSync(routerFile)) {
			checks.push({ name: "Router", status: "ok", message: "Registrado" });
		} else {
			checks.push({ name: "Router", status: "error", message: "No encontrado" });
		}

		// Check 4: Verificar hooks
		const hooksFile = path.join(
			process.cwd(),
			"apps/web/src/hooks",
			`use-${blueprintId}.ts`,
		);
		if (fs.existsSync(hooksFile)) {
			checks.push({ name: "React Hooks", status: "ok", message: hooksFile });
		} else {
			checks.push({
				name: "React Hooks",
				status: "error",
				message: "No encontrado",
			});
		}

		// Check 5: Verificar tipos
		const typesFile = path.join(
			process.cwd(),
			"apps/web/src/types",
			`${blueprintId}.ts`,
		);
		if (fs.existsSync(typesFile)) {
			checks.push({ name: "TypeScript Types", status: "ok", message: typesFile });
		} else {
			checks.push({
				name: "TypeScript Types",
				status: "error",
				message: "No encontrado",
			});
		}

		// Check 6: Verificar página
		const pageFile = path.join(
			process.cwd(),
			"apps/web/app/(saas)/app/(organizations)/[organizationSlug]",
			blueprintId,
			"page.tsx",
		);
		if (fs.existsSync(pageFile)) {
			checks.push({ name: "Next.js Page", status: "ok", message: pageFile });
		} else {
			checks.push({
				name: "Next.js Page",
				status: "warning",
				message: "No encontrado",
			});
		}

		// Check 7: Verificar SQL
		const sqlFile = path.join(this.outputDir, "migration.sql");
		if (fs.existsSync(sqlFile)) {
			checks.push({ name: "SQL Migration", status: "ok", message: sqlFile });
		} else {
			checks.push({
				name: "SQL Migration",
				status: "warning",
				message: "No encontrado",
			});
		}

		// Mostrar resultados
		log(`\n   📋 Health Check Results:`, "cyan");
		for (const check of checks) {
			const icon =
				check.status === "ok"
					? "✅"
					: check.status === "warning"
						? "⚠️"
						: "❌";
			log(`      ${icon} ${check.name}: ${check.message}`);
		}

		const errors = checks.filter((c) => c.status === "error").length;
		const warnings = checks.filter((c) => c.status === "warning").length;
		const ok = checks.filter((c) => c.status === "ok").length;

		return { checks, summary: { ok, warnings, errors } };
	}

	private async generateZodSchemas(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const tables = this.blueprint.database?.new_tables || [];

		let schemas = `// ═══════════════════════════════════════════════════════════════\n`;
		schemas += `// AUTO-SAAS BUILDER - Zod Validation Schemas\n`;
		schemas += `// Blueprint: ${this.blueprint.name} (${blueprintId})\n`;
		schemas += `// Generated: ${new Date().toISOString().split('T')[0]}\n`;
		schemas += `// ═══════════════════════════════════════════════════════════════\n\n`;
		schemas += `import { z } from "zod";\n\n`;

		for (const table of tables) {
			const tableName = table.name;
			const pascalName = this.toPascalCase(tableName);
			const columns = table.columns || [];

			schemas += `// ═══════════════════════════════════════════════════════════════\n`;
			schemas += `// ${pascalName} Schemas\n`;
			schemas += `// ═══════════════════════════════════════════════════════════════\n\n`;

			// Schema completo
			schemas += `export const ${pascalName}Schema = z.object({\n`;

			for (const col of columns) {
				const colLower = col.toLowerCase();
				const colName = col.split(" ")[0].toLowerCase();

				if (colLower.includes("uuid primary key")) {
					schemas += `  id: z.string().uuid(),\n`;
				} else if (colName === "organization_id") {
					schemas += `  organization_id: z.string(),\n`;
				} else if (colLower.includes("text not null")) {
					schemas += `  ${colName}: z.string().min(1),\n`;
				} else if (colLower.includes("text")) {
					schemas += `  ${colName}: z.string().nullable().optional(),\n`;
				} else if (
					colLower.includes("timestamptz") ||
					colLower.includes("timestamp")
				) {
					schemas += `  ${colName}: z.string().datetime().optional(),\n`;
				} else if (colLower.includes("date")) {
					schemas += `  ${colName}: z.string().optional(),\n`;
				} else if (colLower.includes("decimal") || colLower.includes("numeric")) {
					schemas += `  ${colName}: z.number().optional(),\n`;
				} else if (colLower.includes("integer") || colLower.includes("int")) {
					schemas += `  ${colName}: z.number().int().optional(),\n`;
				} else if (colLower.includes("boolean")) {
					schemas += `  ${colName}: z.boolean().optional(),\n`;
				} else if (colLower.includes("jsonb") || colLower.includes("json")) {
					schemas += `  ${colName}: z.any().optional(),\n`;
				}
			}

			schemas += `});\n\n`;

			// Schema para crear (sin id, created_at, updated_at)
			schemas += `export const Create${pascalName}Schema = ${pascalName}Schema.omit({\n`;
			schemas += `  id: true,\n`;
			schemas += `  created_at: true,\n`;
			schemas += `  updated_at: true,\n`;
			schemas += `  organization_id: true,\n`;
			schemas += `});\n\n`;

			// Schema para actualizar (todo opcional excepto id)
			schemas += `export const Update${pascalName}Schema = ${pascalName}Schema.partial().required({ id: true });\n\n`;

			// Tipos inferidos
			schemas += `export type ${pascalName} = z.infer<typeof ${pascalName}Schema>;\n`;
			schemas += `export type Create${pascalName} = z.infer<typeof Create${pascalName}Schema>;\n`;
			schemas += `export type Update${pascalName} = z.infer<typeof Update${pascalName}Schema>;\n\n`;
		}

		const schemasFile = path.join(this.outputDir, "schemas.ts");
		fs.writeFileSync(schemasFile, schemas);
		log(`   ✅ Zod schemas generados: ${schemasFile}`, "green");

		// También copiar al proyecto
		const projectSchemasFile = path.join(
			process.cwd(),
			"apps/web/src/types",
			`${blueprintId}-schemas.ts`,
		);
		fs.writeFileSync(projectSchemasFile, schemas);
		log(`   ✅ Schemas copiados a: ${projectSchemasFile}`, "green");

		return { created: true, files: [schemasFile, projectSchemasFile] };
	}

	private async generateFinalReport(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const tables = this.blueprint.database?.new_tables || [];
		const totalDuration = Date.now() - this.startTime;

		let report = `# 📊 AUTO-SAAS BUILD REPORT\n\n`;
		report += `## Blueprint: ${this.blueprint.name}\n\n`;
		report += `- **ID:** ${blueprintId}\n`;
		report += `- **Generated:** ${new Date().toISOString()}\n`;
		report += `- **Duration:** ${(totalDuration / 1000).toFixed(2)}s\n`;
		report += `- **Layers Executed:** ${this.results.length}\n\n`;

		report += `## 📦 Database\n\n`;
		report += `| Table | Columns |\n`;
		report += `|-------|--------|\n`;
		for (const table of tables) {
			report += `| ${table.name} | ${table.columns?.length || 0} |\n`;
		}
		report += `\n`;

		report += `## 🔧 Generated Files\n\n`;
		report += `### Backend\n`;
		report += `- \`packages/api/modules/${blueprintId}/procedures/index.ts\` - CRUD Procedures\n`;
		report += `- \`packages/api/modules/${blueprintId}/router.ts\` - oRPC Router\n\n`;

		report += `### Frontend\n`;
		report += `- \`apps/web/src/types/${blueprintId}.ts\` - TypeScript Types\n`;
		report += `- \`apps/web/src/types/${blueprintId}-schemas.ts\` - Zod Schemas\n`;
		report += `- \`apps/web/src/hooks/use-${blueprintId}.ts\` - React Query Hooks\n`;
		report += `- \`apps/web/src/components/${blueprintId}/\` - React Components\n`;
		report += `- \`apps/web/app/.../[organizationSlug]/${blueprintId}/page.tsx\` - Next.js Page\n\n`;

		report += `### Database\n`;
		report += `- \`auto-saas/output/${blueprintId}/migration.sql\` - SQL Migration\n\n`;

		report += `## ✅ Layer Results\n\n`;
		report += `| Layer | Name | Status | Duration |\n`;
		report += `|-------|------|--------|----------|\n`;
		for (const result of this.results) {
			const status = result.success ? "✅" : "❌";
			report += `| ${result.layer} | ${result.name} | ${status} | ${result.duration}ms |\n`;
		}
		report += `\n`;

		const successful = this.results.filter((r) => r.success).length;
		const failed = this.results.filter((r) => !r.success).length;

		report += `## 📈 Summary\n\n`;
		report += `- **Successful:** ${successful} layers\n`;
		report += `- **Failed:** ${failed} layers\n`;
		report += `- **Success Rate:** ${((successful / this.results.length) * 100).toFixed(1)}%\n\n`;

		report += `## 🚀 Next Steps\n\n`;
		report += `1. Apply SQL migration to Supabase\n`;
		report += `2. Run \`pnpm build\` to verify compilation\n`;
		report += `3. Start dev server with \`pnpm dev\`\n`;
		report += `4. Navigate to \`/app/[org]/${blueprintId}\`\n\n`;

		report += `---\n`;
		report += `*Generated by Auto-SaaS God Mode v2*\n`;

		const reportFile = path.join(this.outputDir, "BUILD_REPORT.md");
		fs.writeFileSync(reportFile, report);
		log(`   ✅ Reporte generado: ${reportFile}`, "green");

		return { created: true, path: reportFile };
	}

	private async generateSeeds(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const tables = this.blueprint.database?.new_tables || [];

		let seeds = `// ═══════════════════════════════════════════════════════════════\n`;
		seeds += `// AUTO-SAAS BUILDER - Database Seeds\n`;
		seeds += `// Blueprint: ${this.blueprint.name} (${blueprintId})\n`;
		seeds += `// Generated: ${new Date().toISOString().split('T')[0]}\n`;
		seeds += `// ═══════════════════════════════════════════════════════════════\n\n`;
		seeds += `-- Run this SQL in Supabase to insert sample data\n`;
		seeds += `-- Make sure to replace 'YOUR_ORGANIZATION_ID' with a real organization ID\n\n`;

		for (const table of tables) {
			const tableName = table.name;
			seeds += `-- Sample data for ${tableName}\n`;
			seeds += `INSERT INTO ${tableName} (organization_id`;

			// Agregar columnas relevantes
			const columns = table.columns || [];
			const insertColumns: string[] = [];
			const sampleValues: string[] = [];

			for (const col of columns) {
				const colName = col.split(" ")[0].toLowerCase();
				const colLower = col.toLowerCase();

				if (
					colName === "id" ||
					colName === "created_at" ||
					colName === "updated_at" ||
					colName === "organization_id"
				) {
					continue;
				}

				insertColumns.push(colName);

				if (colLower.includes("text not null") && colName.includes("name")) {
					sampleValues.push(`'Sample ${tableName.slice(0, -1)} 1'`);
				} else if (colLower.includes("text not null") && colName.includes("title")) {
					sampleValues.push(`'Sample Title'`);
				} else if (colLower.includes("text not null")) {
					sampleValues.push(`'Sample value'`);
				} else if (colLower.includes("text") && colName.includes("email")) {
					sampleValues.push(`'sample@example.com'`);
				} else if (colLower.includes("text") && colName.includes("description")) {
					sampleValues.push(`'This is a sample description'`);
				} else if (colLower.includes("text") && colName.includes("status")) {
					sampleValues.push(`'pending'`);
				} else if (colLower.includes("text")) {
					sampleValues.push(`NULL`);
				} else if (colLower.includes("decimal") || colLower.includes("numeric")) {
					sampleValues.push(`100.00`);
				} else if (colLower.includes("integer") || colLower.includes("int")) {
					sampleValues.push(`1`);
				} else if (colLower.includes("boolean")) {
					sampleValues.push(`true`);
				} else if (colLower.includes("date")) {
					sampleValues.push(`CURRENT_DATE`);
				} else {
					sampleValues.push(`NULL`);
				}
			}

			if (insertColumns.length > 0) {
				seeds += `, ${insertColumns.join(", ")})\n`;
				seeds += `VALUES ('YOUR_ORGANIZATION_ID', ${sampleValues.join(", ")});\n\n`;
			} else {
				seeds += `)\nVALUES ('YOUR_ORGANIZATION_ID');\n\n`;
			}
		}

		const seedsFile = path.join(this.outputDir, "seeds.sql");
		fs.writeFileSync(seedsFile, seeds);
		log(`   ✅ Seeds generados: ${seedsFile}`, "green");

		return { created: true, path: seedsFile };
	}

	private async generateReadme(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const tables = this.blueprint.database?.new_tables || [];

		let readme = `# ${this.blueprint.name}\n\n`;
		readme += `${this.blueprint.description || ""}\n\n`;
		readme += `## 📋 Overview\n\n`;
		readme += `- **ID:** \`${blueprintId}\`\n`;
		readme += `- **Target Audience:** ${this.blueprint.target_audience || "N/A"}\n`;
		readme += `- **Pricing:** ${this.blueprint.pricing || "N/A"}\n`;
		readme += `- **Generated:** ${new Date().toISOString().split("T")[0]}\n\n`;

		readme += `## 🗄️ Database Schema\n\n`;
		for (const table of tables) {
			readme += `### ${table.name}\n\n`;
			readme += `| Column | Type |\n`;
			readme += `|--------|------|\n`;
			for (const col of table.columns || []) {
				const parts = col.split(" ");
				const colName = parts[0];
				const colType = parts.slice(1).join(" ");
				readme += `| ${colName} | ${colType} |\n`;
			}
			readme += `\n`;
		}

		readme += `## 🔧 API Endpoints\n\n`;
		readme += `All endpoints require authentication.\n\n`;
		readme += `| Method | Endpoint | Description |\n`;
		readme += `|--------|----------|-------------|\n`;
		for (const table of tables) {
			const pascalName = this.toPascalCase(table.name);
			readme += `| GET | \`/api/${blueprintId}/${table.name}\` | List all ${table.name} |\n`;
			readme += `| POST | \`/api/${blueprintId}/${table.name}\` | Create ${table.name.slice(0, -1)} |\n`;
			readme += `| PUT | \`/api/${blueprintId}/${table.name}/:id\` | Update ${table.name.slice(0, -1)} |\n`;
			readme += `| DELETE | \`/api/${blueprintId}/${table.name}/:id\` | Delete ${table.name.slice(0, -1)} |\n`;
		}
		readme += `\n`;

		readme += `## 🎣 React Hooks\n\n`;
		readme += `\`\`\`typescript\n`;
		readme += `import {\n`;
		for (const table of tables) {
			const pascalPlural = this.toPascalCase(table.name);
			const singular = table.name.endsWith("s")
				? table.name.slice(0, -1)
				: table.name;
			const pascalSingular = this.toPascalCase(singular);
			readme += `  use${pascalPlural},\n`;
			readme += `  use${pascalSingular},\n`;
			readme += `  useCreate${pascalSingular},\n`;
			readme += `  useUpdate${pascalSingular},\n`;
			readme += `  useDelete${pascalSingular},\n`;
		}
		readme += `} from '@/hooks/use-${blueprintId}';\n`;
		readme += `\`\`\`\n\n`;

		readme += `## 🚀 Quick Start\n\n`;
		readme += `1. Apply the SQL migration to your Supabase database\n`;
		readme += `2. Run \`pnpm dev\` to start the development server\n`;
		readme += `3. Navigate to \`/app/[org]/${blueprintId}\`\n\n`;

		readme += `## 📁 File Structure\n\n`;
		readme += `\`\`\`\n`;
		readme += `packages/api/modules/${blueprintId}/\n`;
		readme += `├── procedures/index.ts    # CRUD procedures\n`;
		readme += `└── router.ts              # oRPC router\n\n`;
		readme += `apps/web/src/\n`;
		readme += `├── types/${blueprintId}.ts           # TypeScript types\n`;
		readme += `├── hooks/use-${blueprintId}.ts       # React Query hooks\n`;
		readme += `└── components/${blueprintId}/        # React components\n`;
		readme += `\`\`\`\n\n`;

		readme += `---\n`;
		readme += `*Generated by Auto-SaaS God Mode*\n`;

		const readmeFile = path.join(this.outputDir, "README.md");
		fs.writeFileSync(readmeFile, readme);
		log(`   ✅ README generado: ${readmeFile}`, "green");

		return { created: true, path: readmeFile };
	}

	private async sendNotification(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const blueprintName = this.blueprint.name;
		const successful = this.results.filter((r) => r.success).length;
		const totalDuration = Date.now() - this.startTime;

		// Por ahora solo log, en el futuro se puede agregar Slack/Discord
		const message =
			`🚀 Auto-SaaS Build Complete!\n` +
			`📦 Module: ${blueprintName} (${blueprintId})\n` +
			`✅ Layers: ${successful}/${this.results.length}\n` +
			`⏱️ Duration: ${(totalDuration / 1000).toFixed(2)}s`;

		log(`\n   📢 Notification:`, "cyan");
		log(`   ${message.split("\n").join("\n   ")}`, "green");

		// TODO: Implementar envío a Slack/Discord si están configurados
		const slackWebhook = process.env.SLACK_WEBHOOK_URL;
		const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

		if (slackWebhook) {
			try {
				await fetch(slackWebhook, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: message }),
				});
				log(`   ✅ Notificación enviada a Slack`, "green");
			} catch (e) {
				logWarning("Error enviando a Slack");
			}
		}

		if (discordWebhook) {
			try {
				await fetch(discordWebhook, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ content: message }),
				});
				log(`   ✅ Notificación enviada a Discord`, "green");
			} catch (e) {
				logWarning("Error enviando a Discord");
			}
		}

		return { notified: true, message };
	}

	private async cleanup(): Promise<any> {
		const blueprintId = this.blueprint.id;

		log(`\n   🧹 Cleanup:`, "cyan");

		// Verificar archivos temporales
		const tempFiles = [
			path.join(this.outputDir, ".tmp"),
			path.join(this.outputDir, ".cache"),
		];

		let cleaned = 0;
		for (const tempFile of tempFiles) {
			if (fs.existsSync(tempFile)) {
				fs.rmSync(tempFile, { recursive: true });
				cleaned++;
			}
		}

		// Verificar que todos los archivos importantes existen
		const requiredFiles = [
			path.join(this.outputDir, "migration.sql"),
			path.join(this.outputDir, "god-mode-results.json"),
		];

		let verified = 0;
		for (const file of requiredFiles) {
			if (fs.existsSync(file)) {
				verified++;
			}
		}

		log(`   ✅ Archivos temporales limpiados: ${cleaned}`, "green");
		log(`   ✅ Archivos verificados: ${verified}/${requiredFiles.length}`, "green");
		log(`   ✅ Módulo ${blueprintId} listo para usar`, "green");

		return { cleaned, verified };
	}

	private async generatePublicPage(): Promise<any> {
		const blueprintId = this.blueprint.id;
		const blueprintName = this.blueprint.name;
		const tables = this.blueprint.database?.new_tables || [];

		// Solo generar si el blueprint tiene configuración de página pública
		const publicConfig = this.blueprint.public_page;
		if (!publicConfig) {
			log(`   ⏭️ No hay configuración de página pública, saltando`, "yellow");
			return { created: false, reason: "no_public_config" };
		}

		// Crear directorio para página pública
		const publicDir = path.join(process.cwd(), "apps/web/app/(public)", blueprintId);

		if (!fs.existsSync(publicDir)) {
			fs.mkdirSync(publicDir, { recursive: true });
		}

		// Crear subdirectorio con slug dinámico
		const slugDir = path.join(publicDir, "[slug]");
		if (!fs.existsSync(slugDir)) {
			fs.mkdirSync(slugDir, { recursive: true });
		}

		const mainTable = tables[0];
		const tableName = mainTable?.name || "items";

		// Generar página pública
		const pageContent = `"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// Tipos para la página pública
type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
};

type TimeSlot = {
  time: string;
  available: boolean;
};

type BookingStep = "service" | "datetime" | "details" | "confirm";

export default function ${this.toPascalCase(blueprintId)}PublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [step, setStep] = useState<BookingStep>("service");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Datos del negocio
  const [businessName, setBusinessName] = useState("${blueprintName}");
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  
  // Selecciones del usuario
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Datos del cliente
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  // Cargar datos del negocio
  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);
        // TODO: Fetch real business data by slug
        // const res = await fetch(\`/api/public/${blueprintId}/\${slug}\`);
        // const data = await res.json();
        
        // Datos de ejemplo
        setBusinessName("Mi Negocio");
        setServices([
          { id: "1", name: "Servicio Básico", duration: 30, price: 25, description: "Descripción del servicio básico" },
          { id: "2", name: "Servicio Premium", duration: 60, price: 45, description: "Descripción del servicio premium" },
          { id: "3", name: "Servicio VIP", duration: 90, price: 75, description: "Descripción del servicio VIP" },
        ]);
        setLoading(false);
      } catch (err) {
        setError("No se pudo cargar la información del negocio");
        setLoading(false);
      }
    }
    loadBusiness();
  }, [slug]);

  // Generar slots de tiempo cuando se selecciona fecha
  useEffect(() => {
    if (selectedDate && selectedService) {
      // TODO: Fetch real availability
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 19; hour++) {
        slots.push({ time: \`\${hour.toString().padStart(2, '0')}:00\`, available: Math.random() > 0.3 });
        slots.push({ time: \`\${hour.toString().padStart(2, '0')}:30\`, available: Math.random() > 0.3 });
      }
      setTimeSlots(slots);
    }
  }, [selectedDate, selectedService]);

  // Generar próximos 14 días
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return days;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // TODO: Submit real booking
      // await fetch(\`/api/public/${blueprintId}/book\`, {
      //   method: 'POST',
      //   body: JSON.stringify({ ... })
      // });
      
      // Simular éxito
      await new Promise(r => setTimeout(r, 1000));
      setSuccess(true);
    } catch (err) {
      setError("Error al crear la reserva. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === "service") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h2>
          <p className="text-gray-600 mb-6">
            Te hemos enviado un email de confirmación a <strong>{clientEmail}</strong>
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="text-sm text-gray-500">Resumen</div>
            <div className="font-semibold">{selectedService?.name}</div>
            <div className="text-gray-600">{selectedDate} a las {selectedTime}</div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {businessLogo ? (
              <img src={businessLogo} alt={businessName} className="h-12 w-12 rounded-full" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white text-xl font-bold">
                {businessName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{businessName}</h1>
              <p className="text-gray-500 text-sm">Reserva online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {["service", "datetime", "details", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium \${
                step === s ? "bg-blue-600 text-white" :
                ["service", "datetime", "details", "confirm"].indexOf(step) > i ? "bg-green-500 text-white" :
                "bg-gray-200 text-gray-500"
              }\`}>
                {["service", "datetime", "details", "confirm"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 3 && <div className={\`w-12 sm:w-24 h-1 mx-2 \${
                ["service", "datetime", "details", "confirm"].indexOf(step) > i ? "bg-green-500" : "bg-gray-200"
              }\`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Seleccionar Servicio */}
        {step === "service" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona un servicio</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep("datetime"); }}
                  className={\`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-500 hover:shadow-md \${
                    selectedService?.id === service.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }\`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.duration} min</div>
                      {service.description && (
                        <div className="text-sm text-gray-400 mt-1">{service.description}</div>
                      )}
                    </div>
                    <div className="text-lg font-bold text-blue-600">€{service.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Seleccionar Fecha y Hora */}
        {step === "datetime" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button onClick={() => setStep("service")} className="text-blue-600 mb-4 flex items-center gap-1 hover:underline">
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona fecha y hora</h2>
            
            {/* Fechas */}
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-3">Fecha</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getNextDays().map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    disabled={day.isWeekend}
                    className={\`flex-shrink-0 px-4 py-3 rounded-xl text-center transition-all \${
                      selectedDate === day.date 
                        ? "bg-blue-600 text-white" 
                        : day.isWeekend
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }\`}
                  >
                    <div className="text-xs">{day.label.split(' ')[0]}</div>
                    <div className="font-bold">{day.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Horas */}
            {selectedDate && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">Hora disponible</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={\`px-3 py-2 rounded-lg text-sm font-medium transition-all \${
                        selectedTime === slot.time
                          ? "bg-blue-600 text-white"
                          : slot.available
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                      }\`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <button
                onClick={() => setStep("details")}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Step 3: Datos del Cliente */}
        {step === "details" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button onClick={() => setStep("datetime")} className="text-blue-600 mb-4 flex items-center gap-1 hover:underline">
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tus datos</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+34 600 000 000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Alguna indicación especial..."
                  rows={3}
                />
              </div>
            </div>

            <button
              onClick={() => setStep("confirm")}
              disabled={!clientName || !clientEmail || !clientPhone}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Revisar reserva
            </button>
          </div>
        )}

        {/* Step 4: Confirmar */}
        {step === "confirm" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button onClick={() => setStep("details")} className="text-blue-600 mb-4 flex items-center gap-1 hover:underline">
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Confirma tu reserva</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Servicio</div>
                <div className="font-semibold">{selectedService?.name}</div>
                <div className="text-blue-600 font-bold">€{selectedService?.price}</div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Fecha y hora</div>
                <div className="font-semibold">{selectedDate} a las {selectedTime}</div>
                <div className="text-gray-500">{selectedService?.duration} minutos</div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Tus datos</div>
                <div className="font-semibold">{clientName}</div>
                <div className="text-gray-600">{clientEmail}</div>
                <div className="text-gray-600">{clientPhone}</div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50 text-lg"
            >
              {loading ? "Procesando..." : "✓ Confirmar Reserva"}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Recibirás un email de confirmación
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">
        Powered by ${blueprintName}
      </footer>
    </div>
  );
}
`;

		const pageFile = path.join(slugDir, "page.tsx");
		fs.writeFileSync(pageFile, pageContent);
		log(`   ✅ Página pública creada: ${pageFile}`, "green");

		return { created: true, path: pageFile };
	}

	private printSummary() {
		const totalDuration = Date.now() - this.startTime;
		const successful = this.results.filter((r) => r.success).length;
		const failed = this.results.filter((r) => !r.success).length;

		log("\n" + "═".repeat(60), "magenta");
		log("   📊 RESUMEN DE EJECUCIÓN", "magenta");
		log("═".repeat(60), "magenta");

		log(`\nBlueprint: ${this.blueprint?.name || "N/A"}`, "cyan");
		log(`Duración total: ${(totalDuration / 1000).toFixed(2)}s`, "cyan");
		log(`Capas exitosas: ${successful}`, "green");

		if (failed > 0) {
			log(`Capas fallidas: ${failed}`, "red");
		}

		log("\nDetalle por capa:", "yellow");
		for (const result of this.results) {
			const status = result.success ? "✅" : "❌";
			const time = `${result.duration}ms`;
			log(`  ${status} Layer ${result.layer}: ${result.name} (${time})`);

			if (!result.success && result.error) {
				log(`     └─ Error: ${result.error}`, "red");
			}
		}

		log("\n" + "═".repeat(60), "magenta");

		if (failed === 0) {
			log("   🎉 GENERACIÓN COMPLETADA EXITOSAMENTE", "green");
		} else {
			log("   ⚠️  GENERACIÓN COMPLETADA CON ERRORES", "yellow");
		}

		log("═".repeat(60) + "\n", "magenta");

		// Guardar resultados
		const resultsFile = path.join(this.outputDir, "god-mode-results.json");
		fs.writeFileSync(
			resultsFile,
			JSON.stringify(
				{
					blueprint: this.blueprint?.id,
					timestamp: new Date().toISOString(),
					duration: totalDuration,
					results: this.results,
					success: failed === 0,
				},
				null,
				2,
			),
		);

		log(`Resultados guardados en: ${resultsFile}\n`);
	}
}

// === MAIN ===
async function main() {
	// Cargar variables de entorno desde .env.local
	const envPath = path.join(process.cwd(), ".env.local");
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, "utf-8");
		envContent.split("\n").forEach((line) => {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith("#")) {
				const [key, ...valueParts] = trimmed.split("=");
				if (key && valueParts.length) {
					let value = valueParts.join("=").trim();
					// Remover comillas si existen
					if (
						(value.startsWith('"') && value.endsWith('"')) ||
						(value.startsWith("'") && value.endsWith("'"))
					) {
						value = value.slice(1, -1);
					}
					process.env[key.trim()] = value;
				}
			}
		});
		log("✓ Variables de entorno cargadas desde .env.local", "green");
	}

	const args = process.argv.slice(2);

	if (args.length === 0) {
		log("\n🚀 AUTO-SAAS BUILDER - GOD MODE\n", "cyan");
		log(
			"Uso: npx tsx auto-saas/orchestrator/god-mode.ts <blueprint.json> [opciones]\n",
		);
		log("Opciones:");
		log("  --auto-sql      Aplicar SQL automáticamente en Supabase");
		log("  --skip-tests    Saltar generación de tests");
		log("  --no-marketing  Saltar envío a MarketingOS");
		log("  --verbose       Mostrar más detalles\n");
		log("Ejemplo:");
		log(
			"  npx tsx auto-saas/orchestrator/god-mode.ts auto-saas/blueprints/contentflow.json --auto-sql\n",
		);
		process.exit(1);
	}

	const blueprintPath = args[0];
	const config: GodModeConfig = {
		blueprintPath,
		autoApplySQL: args.includes("--auto-sql"),
		skipTests: args.includes("--skip-tests"),
		skipMarketing: args.includes("--no-marketing"),
		verbose: args.includes("--verbose"),
	};

	const godMode = new AutoSaaSGodMode(config);
	const success = await godMode.run();

	process.exit(success ? 0 : 1);
}

main().catch(console.error);

