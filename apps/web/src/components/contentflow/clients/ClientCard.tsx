'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AgencyClient } from '@/types/contentflow-ai';

interface ClientCardProps {
  client: AgencyClient;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  organizationSlug: string;
  agencyId: string;
}

export function ClientCard({ client, onEdit, onDelete, isDeleting, organizationSlug, agencyId }: ClientCardProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const copyBriefLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!client.approval_token) {
      alert('Este cliente no tiene token. Fue creado antes del sistema de brief público.');
      return;
    }

    const url = `${window.location.origin}/brief/${client.approval_token}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
      {/* Contenido clickeable */}
      <Link 
        href={`/app/${organizationSlug}/contentflow/calendar/${client.id}`}
        className="flex-1 hover:text-blue-600 transition-colors"
      >
        <div>
          <p className="font-medium">{client.name}</p>
          {client.industry && (
            <p className="text-sm text-gray-500">{client.industry}</p>
          )}
        </div>
      </Link>

      {/* Botones de acción */}
      <div className="flex gap-1 ml-3">
        {/* Botón Copiar Link de Brief Público */}
        <button
          onClick={copyBriefLink}
          className={`p-1.5 transition-colors ${
            linkCopied 
              ? 'text-green-600' 
              : 'text-gray-500 hover:text-green-600'
          }`}
          title={linkCopied ? '¡Link copiado!' : 'Copiar Link de Brief Público'}
        >
          {linkCopied ? '✅' : '🔗'}
        </button>

        {/* Botón Editar Brief (interno) */}
        <Link
          href={`/app/${organizationSlug}/contentflow/clients/${agencyId}/brief/${client.id}`}
          className="p-1.5 text-gray-500 hover:text-purple-600 inline-flex items-center"
          title="Editar Brief (interno)"
          onClick={(e) => e.stopPropagation()}
        >
          📋
        </Link>

        {/* Botón Editar Cliente */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 text-gray-500 hover:text-blue-600"
          title="Editar Cliente"
        >
          ✏️
        </button>

        {/* Botón Eliminar */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          className="p-1.5 text-gray-500 hover:text-red-600 disabled:opacity-50"
          title="Eliminar Cliente"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

