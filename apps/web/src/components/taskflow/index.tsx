// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - React Components
// Blueprint: TaskFlow (taskflow)
// Generated: 2025-12-08T11:41:55.600Z
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// TaskflowDashboard - Main Dashboard
// ═══════════════════════════════════════════════════════════════

export function TaskflowDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">TaskFlow</h1>
        <p className="text-gray-500">Gestión de tareas simple para equipos</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold">Tasks</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Total registros</p>
        </div>
      </div>
    </div>
  );
}
