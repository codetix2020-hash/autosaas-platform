"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";

type ClientProfile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  total_xp: number;
  current_level: number;
  level_name: string;
  total_visits: number;
  total_spent: number;
  last_visit: string | null;
  created_at: string;
};

export default function ClientesPage() {
  const params = useParams();
  const orgSlug = params.organizationSlug as string;
  const { activeOrganization } = useActiveOrganization();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalXp: 0, avgVisits: 0 });

  useEffect(() => {
    if (activeOrganization?.id) {
      loadClients();
    }
  }, [activeOrganization?.id]);

  const loadClients = async () => {
    try {
      const res = await fetch(`/api/clients/${activeOrganization?.id}`);
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
        setStats(data.stats || { total: 0, totalXp: 0, avgVisits: 0 });
      }
    } catch (err) {
      console.error("Error loading clients:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👥 Clientes Registrados</h1>

      {/* Navigation */}
      <div className="flex gap-2 border-b pb-4 mb-6 overflow-x-auto">
        <Link href={`/app/${orgSlug}/reservas`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors whitespace-nowrap">
          📅 Reservas
        </Link>
        <Link href={`/app/${orgSlug}/reservas/servicios`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors whitespace-nowrap">
          💇 Servicios
        </Link>
        <Link href={`/app/${orgSlug}/reservas/profesionales`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors whitespace-nowrap">
          👨‍💼 Profesionales
        </Link>
        <Link href={`/app/${orgSlug}/reservas/clientes`} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium whitespace-nowrap">
          👥 Clientes
        </Link>
        <Link href={`/app/${orgSlug}/reservas/fidelizacion`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors whitespace-nowrap">
          🏆 Fidelización
        </Link>
        <Link href={`/app/${orgSlug}/reservas/configuracion`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors whitespace-nowrap">
          ⚙️ Configuración
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Clientes registrados</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-600">{stats.totalXp.toLocaleString()}</div>
          <div className="text-sm text-gray-600">XP total otorgado</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-600">{stats.avgVisits.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Visitas promedio</div>
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-medium text-gray-700">No hay clientes registrados</h3>
          <p className="text-sm text-gray-500 mt-1">Los clientes aparecerán aquí cuando se registren en tu página de reservas</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Cliente</th>
                <th className="text-left p-4 font-medium text-gray-600">Nivel</th>
                <th className="text-left p-4 font-medium text-gray-600">XP</th>
                <th className="text-left p-4 font-medium text-gray-600">Visitas</th>
                <th className="text-left p-4 font-medium text-gray-600">Gastado</th>
                <th className="text-left p-4 font-medium text-gray-600">Última visita</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                    {client.phone && <div className="text-sm text-gray-400">{client.phone}</div>}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      {client.level_name || `Nivel ${client.current_level}`}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-yellow-600">{client.total_xp} XP</td>
                  <td className="p-4">{client.total_visits}</td>
                  <td className="p-4">€{client.total_spent}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {client.last_visit 
                      ? new Date(client.last_visit).toLocaleDateString('es-ES')
                      : 'Nunca'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

