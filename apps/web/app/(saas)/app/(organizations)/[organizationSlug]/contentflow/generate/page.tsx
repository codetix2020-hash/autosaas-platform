'use client';

import { use } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useAgencies, useAgencyClients, useContentCalendar } from '@/hooks/contentflow';
import { LoadingSpinner } from '@/components/contentflow/ui/LoadingSpinner';
import { EmptyState } from '@/components/contentflow/ui/EmptyState';
import type { ContentPlatform } from '@/types/contentflow-ai';

interface PageProps {
  params: Promise<{ organizationSlug: string }>;
}

const platforms: { id: ContentPlatform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'blog', label: 'Blog', icon: '📝' },
];

export default function GenerateContentPage({ params }: PageProps) {
  const { organizationSlug } = use(params);
  const { agencies, isLoading: loadingAgencies } = useAgencies();
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<ContentPlatform[]>([]);
  const [days, setDays] = useState(30);
  const [generateImages, setGenerateImages] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const basePath = `/app/${organizationSlug}/contentflow`;

  const { clients, isLoading: loadingClients } = useAgencyClients({
    agencyId: selectedAgencyId || undefined,
  });

  const { bulkCreate } = useContentCalendar({ clientId: selectedClientId });

  function togglePlatform(platform: ContentPlatform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  async function handleGenerate() {
    if (!selectedClientId || selectedPlatforms.length === 0 || !selectedAgencyId) return;

    // Get agency and client data
    const selectedAgency = agencies.find((a: { id: string }) => a.id === selectedAgencyId);
    const selectedClient = clients.find((c: { id: string }) => c.id === selectedClientId);

    if (!selectedAgency || !selectedClient) {
      alert('Error: No se encontró la agencia o el cliente');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('[ContentFlow] Iniciando generación con IA...');
      
      // Get orpcClient from shared lib
      const { orpcClient } = await import('@shared/lib/orpc-client');
      
      // Call AI generation procedure
      const result = await orpcClient.contentflow.ai.generate({
        client_id: selectedClientId,
        agency_id: selectedAgencyId,
        platforms: selectedPlatforms,
        days,
        brand_voice: selectedAgency.brand_voice || {
          tone: 'professional',
          keywords: [],
          language: 'es',
        },
        client_industry: selectedClient.industry || 'General',
        generate_images: generateImages,
      });

      console.log('[ContentFlow] Generación completada:', result);

      if (result.success) {
        alert(
          `✅ Generación completada!\n\n` +
          `• Generados: ${result.generated} posts\n` +
          `• Errores: ${result.errors}\n` +
          `• Total: ${result.total}\n\n` +
          `Ve al calendario del cliente para revisar el contenido.`
        );
        
        // Redirect to calendar
        window.location.href = `${basePath}/calendar/${selectedClientId}`;
      } else {
        alert('Error: La generación falló');
      }
    } catch (error: any) {
      console.error('[ContentFlow] Error en generación:', error);
      alert(`Error: ${error.message || 'No se pudo generar el contenido'}`);
    } finally {
      setIsGenerating(false);
    }
  }

  if (loadingAgencies) {
    return <LoadingSpinner size="lg" />;
  }

  if (agencies.length === 0) {
    return (
      <EmptyState
        icon="🏢"
        title="No hay agencias"
        description="Primero crea una agencia para poder generar contenido"
        action={
          <Link
            href={basePath}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Ir a Agencias
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href={basePath} className="hover:text-blue-600">
            ContentFlow
          </Link>
          <span>/</span>
          <span className="text-gray-900">Generar Contenido</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">🤖 Generador de Contenido IA</h1>
        <p className="text-gray-500 mt-1">
          Crea automáticamente contenido para múltiples plataformas
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Agency Select */}
        <div>
          <label className="block text-sm font-medium mb-2">1. Selecciona Agencia</label>
          <select
            value={selectedAgencyId}
            onChange={(e) => {
              setSelectedAgencyId(e.target.value);
              setSelectedClientId('');
            }}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">-- Seleccionar --</option>
            {agencies.map((a: { id: string; name: string }) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Client Select */}
        {selectedAgencyId && (
          <div>
            <label className="block text-sm font-medium mb-2">2. Selecciona Cliente</label>
            {loadingClients ? (
              <LoadingSpinner size="sm" />
            ) : clients.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay clientes en esta agencia</p>
            ) : (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Seleccionar --</option>
                {clients.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Platforms */}
        {selectedClientId && (
          <div>
            <label className="block text-sm font-medium mb-2">3. Plataformas</label>
            <div className="grid grid-cols-3 gap-2">
              {platforms.map((p: { id: ContentPlatform; label: string; icon: string }) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedPlatforms.includes(p.id)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <p className="text-xs mt-1">{p.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Days */}
        {selectedPlatforms.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">4. Días a generar</label>
            <input
              type="number"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total: {days * selectedPlatforms.length} publicaciones
            </p>
          </div>
        )}

        {/* Generate Images Checkbox */}
        {selectedPlatforms.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={generateImages}
                onChange={(e) => setGenerateImages(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <div>
                <span className="font-medium text-gray-900">🖼️ Generar imágenes automáticamente</span>
                <p className="text-sm text-gray-600 mt-1">
                  Se generarán imágenes para <strong>Instagram</strong>, <strong>Facebook</strong> y <strong>TikTok</strong>.
                  <br />
                  <span className="text-xs text-gray-500">
                    (Las imágenes son gratuitas usando Pollinations.ai)
                  </span>
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Generate Button */}
        {selectedClientId && selectedPlatforms.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                Generando...
              </span>
            ) : (
              `🚀 Generar ${days * selectedPlatforms.length} Publicaciones`
            )}
          </button>
        )}
      </div>
    </div>
  );
}

