'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAgency } from '@/hooks/contentflow';
import { ClientsList } from '@/components/contentflow/clients/ClientsList';
import { LoadingSpinner } from '@/components/contentflow/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ organizationSlug: string; agencyId: string }>;
}

export default function AgencyClientsPage({ params }: PageProps) {
  const { organizationSlug, agencyId } = use(params);
  const { agency, isLoading } = useAgency(agencyId);
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
        <span className="text-gray-900 font-medium">{agency?.name || 'Agencia'}</span>
      </nav>

      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {agency?.name || 'Clientes'}
            </h1>
            {agency?.brand_voice && (
              <p className="text-gray-500 mt-1">
                Tono: <span className="capitalize">{agency.brand_voice.tone}</span>
              </p>
            )}
          </div>
          <Link
            href={basePath}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            ← Volver
          </Link>
        </div>
      </div>

      {/* Clients List */}
      <ClientsList 
        agencyId={agencyId} 
        agencyName={agency?.name}
        organizationSlug={organizationSlug}
      />

      {/* Info Card */}
      <div className="bg-gray-50 rounded-lg border p-4 mt-6">
        <h3 className="font-medium text-gray-900 mb-2">📋 Gestión de Clientes</h3>
        <p className="text-gray-600 text-sm">
          Cada cliente tiene su propio calendario de contenido. Haz clic en un cliente
          para ver y gestionar sus publicaciones programadas.
        </p>
      </div>
    </div>
  );
}

