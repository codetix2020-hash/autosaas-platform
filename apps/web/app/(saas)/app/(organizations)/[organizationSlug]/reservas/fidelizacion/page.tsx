"use client";

import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type LoyaltyLevel = {
  id?: string;
  level_number: number;
  name: string;
  min_xp: number;
  color: string;
  icon: string;
  reward_type: string;
  reward_value: number;
  reward_description: string;
};

const defaultLevels: LoyaltyLevel[] = [
  { level_number: 1, name: "Bronce", min_xp: 0, color: "#CD7F32", icon: "🥉", reward_type: "none", reward_value: 0, reward_description: "" },
  { level_number: 2, name: "Plata", min_xp: 500, color: "#C0C0C0", icon: "🥈", reward_type: "discount_percent", reward_value: 10, reward_description: "10% de descuento en tu próxima visita" },
  { level_number: 3, name: "Oro", min_xp: 1500, color: "#FFD700", icon: "🥇", reward_type: "discount_percent", reward_value: 15, reward_description: "15% de descuento en tu próxima visita" },
  { level_number: 4, name: "Platino", min_xp: 3000, color: "#E5E4E2", icon: "💎", reward_type: "free_service", reward_value: 0, reward_description: "Corte gratis" },
  { level_number: 5, name: "VIP", min_xp: 5000, color: "#8B008B", icon: "👑", reward_type: "free_service", reward_value: 0, reward_description: "Tratamiento completo gratis" },
];

const rewardTypes = [
  { value: "none", label: "Sin recompensa" },
  { value: "discount_percent", label: "Descuento %" },
  { value: "discount_fixed", label: "Descuento €" },
  { value: "free_service", label: "Servicio gratis" },
  { value: "gift", label: "Regalo" },
];

export default function FidelizacionPage() {
  const params = useParams();
  const orgSlug = params.organizationSlug as string;
  const { activeOrganization } = useActiveOrganization();
  const [levels, setLevels] = useState<LoyaltyLevel[]>(defaultLevels);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [stats, setStats] = useState({ totalClients: 0, totalXpGiven: 0, rewardsUsed: 0 });

  useEffect(() => {
    async function loadData() {
      if (!activeOrganization?.id) return;
      
      try {
        const res = await fetch(`/api/loyalty/levels/${activeOrganization.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.levels && data.levels.length > 0) {
            setLevels(data.levels);
          }
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Error loading levels:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeOrganization]);

  const handleSave = async () => {
    if (!activeOrganization?.id) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch(`/api/loyalty/levels/${activeOrganization.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levels }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }
      
      setMessage({ type: "success", text: "¡Niveles guardados correctamente!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const updateLevel = (index: number, field: keyof LoyaltyLevel, value: any) => {
    const newLevels = [...levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setLevels(newLevels);
  };

  const addLevel = () => {
    const lastLevel = levels[levels.length - 1];
    setLevels([...levels, {
      level_number: lastLevel.level_number + 1,
      name: `Nivel ${lastLevel.level_number + 1}`,
      min_xp: lastLevel.min_xp + 1000,
      color: "#3B82F6",
      icon: "⭐",
      reward_type: "discount_percent",
      reward_value: 10,
      reward_description: "",
    }]);
  };

  const removeLevel = (index: number) => {
    if (levels.length <= 1) return;
    setLevels(levels.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🏆 Sistema de Fidelización</h1>
          <p className="text-gray-500">Configura los niveles y recompensas para tus clientes</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all font-medium"
        >
          {saving ? "Guardando..." : "💾 Guardar cambios"}
        </button>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 border-b pb-4">
        <Link href={`/app/${orgSlug}/reservas`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
          📅 Reservas
        </Link>
        <Link href={`/app/${orgSlug}/reservas/servicios`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
          💇 Servicios
        </Link>
        <Link href={`/app/${orgSlug}/reservas/profesionales`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
          👩‍💼 Profesionales
        </Link>
        <Link href={`/app/${orgSlug}/reservas/clientes`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors whitespace-nowrap">
          👥 Clientes
        </Link>
        <Link href={`/app/${orgSlug}/reservas/fidelizacion`} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">
          🏆 Fidelización
        </Link>
        <Link href={`/app/${orgSlug}/reservas/configuracion`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
          ⚙️ Configuración
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Clientes Registrados</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalClients}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-gray-500">XP Total Otorgado</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalXpGiven.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Recompensas Canjeadas</div>
          <div className="text-3xl font-bold text-green-600">{stats.rewardsUsed}</div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <h3 className="font-semibold text-purple-800 mb-2">💡 ¿Cómo funciona?</h3>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Los clientes ganan <strong>XP</strong> con cada servicio completado</li>
          <li>• Al acumular suficiente XP, suben de <strong>nivel</strong></li>
          <li>• Cada nivel puede tener una <strong>recompensa</strong> (descuento, servicio gratis, etc.)</li>
          <li>• Las recompensas se aplican automáticamente en la próxima reserva</li>
        </ul>
      </div>

      {/* Levels Configuration */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold">Niveles de Fidelización</h2>
        </div>
        <div className="p-4 space-y-4">
          {levels.map((level, index) => (
            <div key={index} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: level.color + "20", color: level.color }}
                >
                  {level.icon}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={level.name}
                    onChange={(e) => updateLevel(index, "name", e.target.value)}
                    className="text-lg font-bold border-none p-0 focus:ring-0 w-full"
                    placeholder="Nombre del nivel"
                  />
                  <div className="text-sm text-gray-500">Nivel {level.level_number}</div>
                </div>
                {index > 0 && (
                  <button
                    onClick={() => removeLevel(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">XP Mínimo</label>
                  <input
                    type="number"
                    value={level.min_xp}
                    onChange={(e) => updateLevel(index, "min_xp", Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    disabled={index === 0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                  <input
                    type="color"
                    value={level.color}
                    onChange={(e) => updateLevel(index, "color", e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Icono</label>
                  <input
                    type="text"
                    value={level.icon}
                    onChange={(e) => updateLevel(index, "icon", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-center"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Recompensa</label>
                  <select
                    value={level.reward_type}
                    onChange={(e) => updateLevel(index, "reward_type", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {rewardTypes.map((rt) => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {level.reward_type !== "none" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {(level.reward_type === "discount_percent" || level.reward_type === "discount_fixed") && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Valor del descuento {level.reward_type === "discount_percent" ? "(%)" : "(€)"}
                      </label>
                      <input
                        type="number"
                        value={level.reward_value}
                        onChange={(e) => updateLevel(index, "reward_value", Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  )}
                  <div className={level.reward_type === "discount_percent" || level.reward_type === "discount_fixed" ? "" : "md:col-span-2"}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Descripción de la recompensa</label>
                    <input
                      type="text"
                      value={level.reward_description}
                      onChange={(e) => updateLevel(index, "reward_description", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Ej: 10% de descuento en tu próxima visita"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addLevel}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors"
          >
            + Agregar nivel
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold">Vista previa de niveles</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {levels.map((level, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-4 py-3 rounded-xl text-center min-w-[120px]"
                style={{ backgroundColor: level.color + "15", borderColor: level.color, borderWidth: 2 }}
              >
                <div className="text-2xl mb-1">{level.icon}</div>
                <div className="font-bold text-sm" style={{ color: level.color }}>{level.name}</div>
                <div className="text-xs text-gray-500">{level.min_xp.toLocaleString()} XP</div>
                {level.reward_type !== "none" && (
                  <div className="text-xs mt-1 text-green-600">🎁 Recompensa</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

