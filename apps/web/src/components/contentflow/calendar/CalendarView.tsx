'use client';

import { useState, useMemo } from 'react';
import { useContentCalendar } from '@/hooks/contentflow';
import { LoadingState } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { ContentCard } from './ContentCard';
import type { ContentPlatform, ContentStatus } from '@/types/contentflow-ai';

interface CalendarViewProps {
  clientId: string;
  clientName?: string;
}

const platforms: ContentPlatform[] = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'blog'];
const statuses: ContentStatus[] = ['draft', 'pending_approval', 'approved', 'scheduled', 'published'];

export function CalendarView({ clientId, clientName }: CalendarViewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<ContentPlatform | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus | undefined>();

  const { content, isLoading, isError, error, updateStatus, remove } = useContentCalendar({
    clientId,
  });

  // Agrupar por fecha
  const groupedContent = useMemo(() => {
    const groups: Record<string, typeof content> = {};
    content.forEach((item) => {
      const date = new Date(item.scheduled_date).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [content]);

  if (isLoading) return <LoadingState message="Cargando calendario..." />;

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error: {error?.message || 'No se pudo cargar el calendario'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h3 className="font-semibold">Calendario de {clientName || 'contenido'}</h3>
        
        <div className="flex gap-2">
          {/* Filtro de plataforma */}
          <select
            value={selectedPlatform || ''}
            onChange={(e) => setSelectedPlatform(e.target.value as ContentPlatform || undefined)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="">Todas las plataformas</option>
            {platforms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Filtro de estado */}
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value as ContentStatus || undefined)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="">Todos los estados</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {content.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Sin contenido programado"
          description="Genera contenido con IA o crea entradas manualmente"
        />
      ) : (
        <div className="space-y-6">
          {groupedContent.map(([date, items]) => (
            <div key={date}>
              <h4 className="text-sm font-medium text-gray-500 mb-2 sticky top-0 bg-white py-1">
                {new Date(date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <ContentCard
                    key={item.id}
                    content={item}
                    onStatusChange={(status) => updateStatus({ id: item.id, status })}
                    onDelete={() => {
                      if (confirm('¿Eliminar este contenido?')) {
                        remove(item.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

