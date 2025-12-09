// AUTO-SAAS BUILDER - Tipos compartidos
// Este archivo define todas las interfaces del sistema

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  vpu: string;
  target_audience: string;
  pricing: string;
  database: {
    new_tables: TableSpec[];
  };
  routes?: RouteSpec[];
  components?: ComponentSpec[];
  api_routes?: ApiRouteSpec[];
  external_apis?: ExternalApiSpec[];
}

export interface TableSpec {
  name: string;
  columns: string[];
  rls?: string[];
  indexes?: string[];
}

export interface RouteSpec {
  path: string;
  component: string;
  description: string;
  public?: boolean;
}

export interface ComponentSpec {
  name: string;
  path: string;
  type: 'client' | 'server';
  description: string;
  dependencies?: string[];
}

export interface ApiRouteSpec {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  auth_required: boolean;
}

export interface ExternalApiSpec {
  name: string;
  purpose: string;
  env_var: string;
}

export interface LayerResult {
  layer: number;
  name: string;
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
  timestamp: string;
  needsHumanReview?: boolean;
}

export interface SupastarterContext {
  fileTree: string[];
  components: string[];
  layouts: string[];
  authPattern: string;
  availableLibraries: string[];
  sqlTables: string[];
}

export interface ExecutionPlan {
  blueprintId: string;
  totalSteps: number;
  steps: ExecutionStep[];
  estimatedDuration: number;
  generatedAt: string;
}

export interface ExecutionStep {
  order: number;
  type: 'sql' | 'types' | 'api' | 'component' | 'hook' | 'test' | 'config';
  name: string;
  path: string;
  dependencies: string[];
  description: string;
}

export interface Checkpoint {
  blueprintId: string;
  layer: number;
  timestamp: string;
  state: 'pending' | 'in_progress' | 'completed' | 'failed';
  filesCreated: string[];
  filesModified: string[];
  canRollback: boolean;
  snapshot?: string;
}

export interface ConflictReport {
  hasConflicts: boolean;
  conflicts: Conflict[];
  warnings: Warning[];
}

export interface Conflict {
  type: 'table_name' | 'route_path' | 'component_name' | 'file_path';
  existing: string;
  new: string;
  severity: 'error' | 'warning';
  suggestion: string;
}

export interface Warning {
  type: string;
  message: string;
  suggestion: string;
}

export interface FeasibilityReport {
  feasible: boolean;
  score: number;
  checks: FeasibilityCheck[];
  blockers: string[];
  recommendations: string[];
}

export interface FeasibilityCheck {
  name: string;
  passed: boolean;
  details: string;
}

