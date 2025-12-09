'use client';

import { useState } from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { PlatformIcon } from '../ui/PlatformIcon';
import type { ContentCalendar, ContentStatus } from '@/types/contentflow-ai';

interface ContentCardProps {
  content: ContentCalendar;
  onEdit?: () => void;
  onStatusChange?: (status: ContentStatus) => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function ContentCard({ content, onEdit, onStatusChange, onDelete, compact = false }: ContentCardProps) {
  const [showModal, setShowModal] = useState(false);

  if (compact) {
    return (
      <>
        <div 
          className="p-2 bg-white border rounded text-sm hover:shadow-sm transition-shadow cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          {/* Imagen miniatura si existe */}
          {content.image_url && (
            <div className="mb-2">
              <img 
                src={content.image_url} 
                alt="Contenido generado"
                className="w-full h-16 object-cover rounded"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex items-center justify-between mb-1">
            <PlatformIcon platform={content.platform} size="sm" />
            <StatusBadge status={content.status} />
          </div>
          <p className="text-gray-700 line-clamp-2 text-xs">{content.content_text}</p>
        </div>

        {/* Modal */}
        {showModal && (
          <ContentDetailModal 
            content={content}
            onClose={() => setShowModal(false)}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div 
        className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {/* Imagen si existe */}
        {content.image_url && (
          <div className="mb-3">
            <img 
              src={content.image_url} 
              alt="Contenido generado"
              className="w-full h-32 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={content.platform} showLabel size="md" />
            <span className="text-sm text-gray-500">
              {new Date(content.scheduled_date).toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
          <StatusBadge status={content.status} />
        </div>

        <p className="text-gray-700 mb-3 line-clamp-3">{content.content_text}</p>

        <div className="flex justify-between items-center pt-3 border-t" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-1">
            {onEdit && (
              <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-blue-600 text-sm">
                ✏️ Editar
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-600 text-sm">
                🗑️
              </button>
            )}
          </div>
          {onStatusChange && content.status === 'draft' && (
            <button
              onClick={() => onStatusChange('pending_approval')}
              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
            >
              Enviar a revisión
            </button>
          )}
          {onStatusChange && content.status === 'pending_approval' && (
            <div className="flex gap-1">
              <button
                onClick={() => onStatusChange('approved')}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                ✓ Aprobar
              </button>
              <button
                onClick={() => onStatusChange('rejected')}
                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                ✗ Rechazar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ContentDetailModal 
          content={content}
          onClose={() => setShowModal(false)}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

// ============================================================================
// MODAL DE DETALLE
// ============================================================================

interface ContentDetailModalProps {
  content: ContentCalendar;
  onClose: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: ContentStatus) => void;
  onDelete?: () => void;
}

function ContentDetailModal({ content, onClose, onEdit, onStatusChange, onDelete }: ContentDetailModalProps) {
  const [copying, setCopying] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content.content_text);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Error copying:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <PlatformIcon platform={content.platform} showLabel size="lg" />
            <div>
              <p className="text-sm text-gray-500">
                {new Date(content.scheduled_date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={content.status} />
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Imagen grande si existe */}
          {content.image_url && (
            <div className="mb-4">
              <img 
                src={content.image_url} 
                alt="Contenido generado"
                className="w-full rounded-lg border shadow-sm"
                loading="lazy"
              />
              <p className="text-xs text-gray-400 mt-1 text-center">
                Click derecho para guardar imagen
              </p>
            </div>
          )}

          {/* Texto del post */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Contenido del Post</span>
              <button
                onClick={copyToClipboard}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  copying 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {copying ? '✓ Copiado!' : '📋 Copiar'}
              </button>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {content.content_text}
            </p>
          </div>

          {/* Metadata */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded p-3">
              <span className="text-gray-500">Caracteres:</span>
              <span className="ml-2 font-medium">{content.content_text.length}</span>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <span className="text-gray-500">ID:</span>
              <span className="ml-2 font-mono text-xs">{content.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="flex gap-2">
            {onEdit && (
              <button 
                onClick={() => { onEdit(); onClose(); }}
                className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                ✏️ Editar
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => { 
                  if (confirm('¿Eliminar este contenido?')) {
                    onDelete(); 
                    onClose(); 
                  }
                }}
                className="px-4 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {onStatusChange && content.status === 'draft' && (
              <button
                onClick={() => { onStatusChange('pending_approval'); onClose(); }}
                className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                📤 Enviar a Revisión
              </button>
            )}
            {onStatusChange && content.status === 'pending_approval' && (
              <>
                <button
                  onClick={() => { onStatusChange('rejected'); onClose(); }}
                  className="px-4 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  ✗ Rechazar
                </button>
                <button
                  onClick={() => { onStatusChange('approved'); onClose(); }}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  ✓ Aprobar
                </button>
              </>
            )}
            {onStatusChange && content.status === 'approved' && (
              <button
                onClick={() => { onStatusChange('scheduled'); onClose(); }}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                📅 Programar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
