'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAgencies } from '@/hooks/contentflow';
import { AgenciesList } from '@/components/contentflow/agencies/AgenciesList';
import { LoadingSpinner } from '@/components/contentflow/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ organizationSlug: string }>;
}

export default function ContentFlowDashboard({ params }: PageProps) {
  const { organizationSlug } = use(params);
  const { agencies, isLoading } = useAgencies();
  const basePath = `/app/${organizationSlug}/contentflow`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">ContentFlow AI</h1>
        <p className="text-gray-500 mt-1">
          Gestiona el contenido de redes sociales de tus clientes
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Agencies Section */}
        <div className="lg:col-span-2">
          <AgenciesList organizationSlug={organizationSlug} />
        </div>

        {/* Quick Stats / Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Resumen</h3>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Agencias</span>
                  <span className="font-medium">{agencies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado</span>
                  <span className="text-green-600 font-medium">Activo</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tip</h3>
            <p className="text-blue-700 text-sm">
              Selecciona una agencia para ver sus clientes y gestionar el calendario de contenido.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              <Link
                href={`${basePath}/generate`}
                className="block w-full px-3 py-2 text-sm text-center bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                🤖 Generar Contenido con IA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

