// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - React Components
// Blueprint: ReservasPro (reservas)
// Generated: 2025-12-08T12:08:05.236Z
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// ReservasDashboard - Main Dashboard
// ═══════════════════════════════════════════════════════════════

export function ReservasDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">ReservasPro</h1>
        <p className="text-gray-500">Sistema de gestión de reservas para peluquerías y salones de belleza</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold">Bookings</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Total registros</p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold">Services</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Total registros</p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold">Professionals</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Total registros</p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold">WorkingHours</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Total registros</p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="font-semibold">Clients</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Total registros</p>
        </div>
      </div>
    </div>
  );
}
