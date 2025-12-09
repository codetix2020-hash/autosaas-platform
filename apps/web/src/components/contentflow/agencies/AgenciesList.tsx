'use client';

import { useState } from 'react';
import { useAgencies } from '@/hooks/contentflow';
import { LoadingState } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { AgencyCard } from './AgencyCard';
import { AgencyForm } from './AgencyForm';
import type { Agency } from '@/types/contentflow-ai';

interface AgenciesListProps {
  organizationSlug: string;
}

export function AgenciesList({ organizationSlug }: AgenciesListProps) {
  const { agencies, isLoading, isError, error, delete: deleteAgency, isDeleting } = useAgencies();
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) return <LoadingState message="Cargando agencias..." />;
  
  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error: {error?.message || 'No se pudieron cargar las agencias'}
      </div>
    );
  }

  if (agencies.length === 0 && !showCreateForm) {
    return (
      <EmptyState
        icon="🏢"
        title="No hay agencias"
        description="Crea tu primera agencia para empezar a gestionar contenido"
        action={
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Crear Agencia
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mis Agencias ({agencies.length})</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Nueva Agencia
        </button>
      </div>

      {(showCreateForm || editingAgency) && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <AgencyForm
            agency={editingAgency || undefined}
            onSuccess={() => {
              setShowCreateForm(false);
              setEditingAgency(null);
            }}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingAgency(null);
            }}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agencies.map((agency) => (
          <AgencyCard
            key={agency.id}
            agency={agency}
            onEdit={() => setEditingAgency(agency)}
            onDelete={() => {
              if (confirm('¿Eliminar esta agencia?')) {
                deleteAgency(agency.id);
              }
            }}
            isDeleting={isDeleting}
            organizationSlug={organizationSlug}
          />
        ))}
      </div>
    </div>
  );
}

