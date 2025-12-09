'use client';

import Link from 'next/link';
import type { Agency } from '@/types/contentflow-ai';

interface AgencyCardProps {
  agency: Agency;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  organizationSlug: string;
}

export function AgencyCard({ agency, onEdit, onDelete, isDeleting, organizationSlug }: AgencyCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <Link 
          href={`/app/${organizationSlug}/contentflow/clients/${agency.id}`}
          className="flex-1 hover:text-blue-600 transition-colors"
        >
          <h3 className="font-semibold text-lg">{agency.name}</h3>
        </Link>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-gray-500 hover:text-blue-600"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="p-1 text-gray-500 hover:text-red-600 disabled:opacity-50"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>

      <Link 
        href={`/app/${organizationSlug}/contentflow/clients/${agency.id}`}
        className="block"
      >
        {agency.brand_voice && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Tono:</span>{' '}
              <span className="capitalize">{agency.brand_voice.tone}</span>
            </p>
            {agency.brand_voice.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {agency.brand_voice.keywords.slice(0, 3).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                    {kw}
                  </span>
                ))}
                {agency.brand_voice.keywords.length > 3 && (
                  <span className="text-xs text-gray-400">+{agency.brand_voice.keywords.length - 3}</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t text-xs text-gray-400">
          Creada: {new Date(agency.created_at).toLocaleDateString('es-ES')}
        </div>
      </Link>
    </div>
  );
}

