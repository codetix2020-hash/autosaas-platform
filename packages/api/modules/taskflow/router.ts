// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Module Router
// Blueprint: TaskFlow (taskflow)
// Generated: 2025-12-08T11:41:58.029Z
// ═══════════════════════════════════════════════════════════════

// Import procedures from ./procedures
import * as procedures from "./procedures";

export const taskflowRouter = {
	tasks: {
		list: procedures.listTasks,
		get: procedures.getTasks,
		create: procedures.createTasks,
		update: procedures.updateTasks,
		delete: procedures.deleteTasks,
	},
};
