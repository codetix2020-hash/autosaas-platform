'use client';

import { useState } from 'react';
import { useAgencies } from '@/hooks/contentflow';
import { NewAgencySchema } from '@/types/contentflow-ai';
import type { Agency, BrandVoice } from '@/types/contentflow-ai';

interface AgencyFormProps {
  agency?: Agency;
  onSuccess: () => void;
  onCancel: () => void;
}

const toneOptions = ['professional', 'casual', 'friendly', 'formal', 'playful'] as const;

export function AgencyForm({ agency, onSuccess, onCancel }: AgencyFormProps) {
  const { create, update, isCreating, isUpdating } = useAgencies();
  const isEditing = !!agency;
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState(agency?.name || '');
  const [tone, setTone] = useState<BrandVoice['tone']>(agency?.brand_voice?.tone || 'professional');
  const [keywords, setKeywords] = useState(agency?.brand_voice?.keywords?.join(', ') || '');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const brandVoice: BrandVoice = {
      tone,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      avoid_words: [],
      language: 'es',
    };

    try {
      if (isEditing) {
        await update({ id: agency.id, name, brand_voice: brandVoice });
      } else {
        // No validamos en el frontend - el backend maneja user_id
        await create({ name, brand_voice: brandVoice });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold">{isEditing ? 'Editar Agencia' : 'Nueva Agencia'}</h3>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Mi Agencia Digital"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tono de voz</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as BrandVoice['tone'])}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {toneOptions.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Palabras clave (separadas por coma)</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="innovación, creatividad, resultados"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

