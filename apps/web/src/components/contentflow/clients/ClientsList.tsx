'use client';

import { useState } from 'react';
import { useAgencyClients } from '@/hooks/contentflow';
import { LoadingState } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { ClientCard } from './ClientCard';
import { ClientForm } from './ClientForm';
import type { AgencyClient } from '@/types/contentflow-ai';

interface ClientsListProps {
  agencyId: string;
  agencyName?: string;
  organizationSlug: string;
}

export function ClientsList({ agencyId, agencyName, organizationSlug }: ClientsListProps) {
  const { clients, isLoading, isError, error, remove, isDeleting } = useAgencyClients({ agencyId });
  const [editingClient, setEditingClient] = useState<AgencyClient | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) return <LoadingState message="Cargando clientes..." />;

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error: {error?.message || 'No se pudieron cargar los clientes'}
      </div>
    );
  }

  if (clients.length === 0 && !showCreateForm) {
    return (
      <EmptyState
        icon="👥"
        title="No hay clientes"
        description={`Agrega clientes a ${agencyName || 'esta agencia'} para gestionar su contenido`}
        action={
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Agregar Cliente
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Clientes ({clients.length})</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Cliente
        </button>
      </div>

      {(showCreateForm || editingClient) && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <ClientForm
            agencyId={agencyId}
            client={editingClient || undefined}
            onSuccess={() => {
              setShowCreateForm(false);
              setEditingClient(null);
            }}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingClient(null);
            }}
          />
        </div>
      )}

      <div className="space-y-2">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={() => setEditingClient(client)}
            onDelete={() => {
              if (confirm('¿Eliminar este cliente?')) {
                remove(client.id);
              }
            }}
            isDeleting={isDeleting}
            organizationSlug={organizationSlug}
            agencyId={agencyId}
          />
        ))}
      </div>
    </div>
  );
}

