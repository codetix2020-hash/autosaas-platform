'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAgencyClient } from '@/hooks/contentflow';
import { CalendarView } from '@/components/contentflow/calendar/CalendarView';
import { LoadingSpinner } from '@/components/contentflow/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ organizationSlug: string; clientId: string }>;
}

export default function ClientCalendarPage({ params }: PageProps) {
  const { organizationSlug, clientId } = use(params);
  const { client, isLoading } = useAgencyClient(clientId);
  const basePath = `/app/${organizationSlug}/contentflow`;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={basePath} className="hover:text-blue-600">
          ContentFlow
        </Link>
        <span>/</span>
        {client?.agency_id && (
          <>
            <Link
              href={`${basePath}/clients/${client.agency_id}`}
              className="hover:text-blue-600"
            >
              Clientes
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{client?.name || 'Calendario'}</span>
      </nav>

      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Calendario de {client?.name || 'Contenido'}
            </h1>
            {client?.industry && (
              <p className="text-gray-500 mt-1">Industria: {client.industry}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`${basePath}/clients/${client?.agency_id || ''}`}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            >
              ← Clientes
            </Link>
            <Link
              href={`${basePath}/generate`}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              🤖 Generar con IA
            </Link>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <CalendarView clientId={clientId} clientName={client?.name} />

      {/* Help Card */}
      <div className="bg-purple-50 rounded-lg border border-purple-100 p-4 mt-6">
        <h3 className="font-medium text-purple-900 mb-2">🚀 Generación con IA</h3>
        <p className="text-purple-700 text-sm">
          Usa el botón "Generar con IA" para crear automáticamente 30 días de contenido
          personalizado para todas las plataformas de {client?.name || 'este cliente'}.
        </p>
      </div>
    </div>
  );
}


