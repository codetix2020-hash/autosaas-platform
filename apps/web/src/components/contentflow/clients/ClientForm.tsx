'use client';

import { useState } from 'react';
import { useAgencyClients } from '@/hooks/contentflow';
import type { AgencyClient } from '@/types/contentflow-ai';

interface ClientFormProps {
  agencyId: string;
  client?: AgencyClient;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClientForm({ agencyId, client, onSuccess, onCancel }: ClientFormProps) {
  const { create, update, isCreating, isUpdating } = useAgencyClients({ agencyId });
  const isEditing = !!client;
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState(client?.name || '');
  const [industry, setIndustry] = useState(client?.industry || '');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      if (isEditing) {
        await update({ id: client.id, name, industry: industry || null });
      } else {
        await create({ agency_id: agencyId, name, industry: industry || null });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="font-medium text-sm">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h4>

      {error && <div className="p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500"
            placeholder="Nombre del cliente"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Industria</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: Tecnología, Salud..."
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

