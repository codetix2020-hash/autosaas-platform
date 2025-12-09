'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAgencyClient, useAgencyClients } from '@/hooks/contentflow';
import { LoadingSpinner } from '@/components/contentflow/ui/LoadingSpinner';
import type { ClientBrief } from '@/types/contentflow-ai';

interface PageProps {
  params: Promise<{ organizationSlug: string; agencyId: string; clientId: string }>;
}

const PRICE_RANGES = [
  { value: 'economico', label: 'Económico (€-€€)' },
  { value: 'medio', label: 'Medio (€€€)' },
  { value: 'premium', label: 'Premium (€€€€)' },
];

const TONES = [
  { value: 'profesional', label: 'Profesional' },
  { value: 'casual', label: 'Casual' },
  { value: 'divertido', label: 'Divertido' },
  { value: 'elegante', label: 'Elegante' },
  { value: 'inspirador', label: 'Inspirador' },
];

const GOALS = [
  { value: 'ventas', label: 'Ventas / Conversiones' },
  { value: 'awareness', label: 'Conocimiento de Marca' },
  { value: 'engagement', label: 'Engagement / Interacción' },
  { value: 'educacion', label: 'Educación' },
  { value: 'fidelizacion', label: 'Fidelización' },
];

export default function ClientBriefPage({ params }: PageProps) {
  const { organizationSlug, agencyId, clientId } = use(params);
  const { client, isLoading: loadingClient } = useAgencyClient(clientId);
  const { update: updateClient, isUpdating } = useAgencyClients({ agencyId });
  
  const basePath = `/app/${organizationSlug}/contentflow`;
  
  const [brief, setBrief] = useState<ClientBrief>({
    business_name: '',
    business_description: '',
    services: [],
    price_range: undefined,
    location: '',
    schedule: '',
    website: '',
    phone: '',
    target_age: '',
    target_gender: 'todos',
    target_interests: [],
    content_tone: 'profesional',
    content_goals: [],
    hashtags_preferred: [],
    topics_to_avoid: [],
    competitors: [],
    liked_posts_examples: [],
    logo_url: '',
    photos_urls: [],
  });

  // Load existing brief
  useEffect(() => {
    if (client?.brief) {
      setBrief({ ...brief, ...client.brief });
    }
  }, [client]);

  // Tag input handlers
  const [serviceInput, setServiceInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [avoidInput, setAvoidInput] = useState('');
  const [competitorInput, setCompetitorInput] = useState('');
  const [exampleInput, setExampleInput] = useState('');

  const addToArray = (field: keyof ClientBrief, value: string) => {
    if (!value.trim()) return;
    const currentArray = (brief[field] as string[]) || [];
    if (!currentArray.includes(value.trim())) {
      setBrief({ ...brief, [field]: [...currentArray, value.trim()] });
    }
  };

  const removeFromArray = (field: keyof ClientBrief, value: string) => {
    const currentArray = (brief[field] as string[]) || [];
    setBrief({ ...brief, [field]: currentArray.filter(v => v !== value) });
  };

  const toggleGoal = (goal: string) => {
    const currentGoals = brief.content_goals || [];
    if (currentGoals.includes(goal)) {
      setBrief({ ...brief, content_goals: currentGoals.filter(g => g !== goal) });
    } else {
      setBrief({ ...brief, content_goals: [...currentGoals, goal] });
    }
  };

  const handleSave = async () => {
    try {
      await updateClient({
        id: clientId,
        brief: brief,
      });
      alert('✅ Brief guardado exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loadingClient) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={basePath} className="hover:text-blue-600">ContentFlow</Link>
        <span>/</span>
        <Link href={`${basePath}/clients/${agencyId}`} className="hover:text-blue-600">Clientes</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{client?.name || 'Cliente'}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">Brief</span>
      </nav>

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Brief de {client?.name}</h1>
        <p className="text-gray-500 mt-1">
          Información detallada para generar mejor contenido con IA
        </p>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* 1. INFORMACIÓN DEL NEGOCIO */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">📋 Información del Negocio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Negocio</label>
              <input
                type="text"
                value={brief.business_name || ''}
                onChange={(e) => setBrief({ ...brief, business_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ej: Restaurante La Familia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={brief.business_description || ''}
                onChange={(e) => setBrief({ ...brief, business_description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Describe el negocio, qué lo hace único, historia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Servicios / Productos</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('services', serviceInput);
                      setServiceInput('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Ej: Delivery, Catering... (Enter para agregar)"
                />
                <button
                  onClick={() => {
                    addToArray('services', serviceInput);
                    setServiceInput('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(brief.services || []).map((service, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {service}
                    <button
                      onClick={() => removeFromArray('services', service)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rango de Precios</label>
                <select
                  value={brief.price_range || ''}
                  onChange={(e) => setBrief({ ...brief, price_range: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccionar...</option>
                  {PRICE_RANGES.map(pr => (
                    <option key={pr.value} value={pr.value}>{pr.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input
                  type="text"
                  value={brief.location || ''}
                  onChange={(e) => setBrief({ ...brief, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Centro, Madrid"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Horarios</label>
                <input
                  type="text"
                  value={brief.schedule || ''}
                  onChange={(e) => setBrief({ ...brief, schedule: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Lun-Dom 12:00-23:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={brief.phone || ''}
                  onChange={(e) => setBrief({ ...brief, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: +34 123 456 789"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={brief.website || ''}
                onChange={(e) => setBrief({ ...brief, website: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        {/* 2. AUDIENCIA TARGET */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">🎯 Audiencia Target</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rango de Edad</label>
                <input
                  type="text"
                  value={brief.target_age || ''}
                  onChange={(e) => setBrief({ ...brief, target_age: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: 25-45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Género</label>
                <select
                  value={brief.target_gender || 'todos'}
                  onChange={(e) => setBrief({ ...brief, target_gender: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="todos">Todos</option>
                  <option value="mujeres">Mujeres</option>
                  <option value="hombres">Hombres</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Intereses de la Audiencia</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('target_interests', interestInput);
                      setInterestInput('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Ej: gastronomía, deportes, tecnología... (Enter para agregar)"
                />
                <button
                  onClick={() => {
                    addToArray('target_interests', interestInput);
                    setInterestInput('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(brief.target_interests || []).map((interest, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {interest}
                    <button
                      onClick={() => removeFromArray('target_interests', interest)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. ESTILO DE CONTENIDO */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">🎨 Estilo de Contenido</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tono de Voz</label>
              <select
                value={brief.content_tone || 'profesional'}
                onChange={(e) => setBrief({ ...brief, content_tone: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {TONES.map(tone => (
                  <option key={tone.value} value={tone.value}>{tone.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Objetivos del Contenido</label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(goal => (
                  <label key={goal.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(brief.content_goals || []).includes(goal.value)}
                      onChange={() => toggleGoal(goal.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{goal.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hashtags Preferidos</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = hashtagInput.startsWith('#') ? hashtagInput : `#${hashtagInput}`;
                      addToArray('hashtags_preferred', value);
                      setHashtagInput('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Ej: #gastronomia #foodlover... (Enter para agregar)"
                />
                <button
                  onClick={() => {
                    const value = hashtagInput.startsWith('#') ? hashtagInput : `#${hashtagInput}`;
                    addToArray('hashtags_preferred', value);
                    setHashtagInput('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(brief.hashtags_preferred || []).map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeFromArray('hashtags_preferred', tag)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Temas a Evitar</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={avoidInput}
                  onChange={(e) => setAvoidInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('topics_to_avoid', avoidInput);
                      setAvoidInput('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Ej: política, religión... (Enter para agregar)"
                />
                <button
                  onClick={() => {
                    addToArray('topics_to_avoid', avoidInput);
                    setAvoidInput('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(brief.topics_to_avoid || []).map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {topic}
                    <button
                      onClick={() => removeFromArray('topics_to_avoid', topic)}
                      className="hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. COMPETENCIA */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">🏆 Competencia</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Competidores (URLs o nombres)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('competitors', competitorInput);
                    setCompetitorInput('');
                  }
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Ej: https://instagram.com/competidor... (Enter para agregar)"
              />
              <button
                onClick={() => {
                  addToArray('competitors', competitorInput);
                  setCompetitorInput('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
            <div className="space-y-2">
              {(brief.competitors || []).map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <span className="text-sm">{comp}</span>
                  <button
                    onClick={() => removeFromArray('competitors', comp)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. EJEMPLOS */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">⭐ Ejemplos de Posts que Gustan</h2>
          <div>
            <label className="block text-sm font-medium mb-1">URLs de posts de referencia</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={exampleInput}
                onChange={(e) => setExampleInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('liked_posts_examples', exampleInput);
                    setExampleInput('');
                  }
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Ej: https://instagram.com/p/... (Enter para agregar)"
              />
              <button
                onClick={() => {
                  addToArray('liked_posts_examples', exampleInput);
                  setExampleInput('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
            <div className="space-y-2">
              {(brief.liked_posts_examples || []).map((example, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <a
                    href={example}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {example}
                  </a>
                  <button
                    onClick={() => removeFromArray('liked_posts_examples', example)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link
            href={`${basePath}/clients/${agencyId}`}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            ← Cancelar
          </Link>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {isUpdating ? 'Guardando...' : '💾 Guardar Brief'}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 ¿Para qué sirve el Brief?</h3>
          <p className="text-blue-700 text-sm">
            Esta información se usa para generar contenido MÁS PERSONALIZADO y RELEVANTE con IA.
            Cuanto más completo sea el brief, mejor será el contenido generado automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}

