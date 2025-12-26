'use client';

import { use, useState, useEffect } from 'react';
import { orpcClient } from '@shared/lib/orpc-client';
import type { ClientBrief } from '@/types/contentflow-ai';

interface PageProps {
  params: Promise<{ token: string }>;
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

export default function PublicBriefPage({ params }: PageProps) {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientName, setClientName] = useState('');
  
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
    async function loadBrief() {
      try {
        const result = await orpcClient.contentflow.public.getBrief({ token });
        setClientName(result.data.name);
        if (result.data.brief) {
          setBrief({ ...brief, ...result.data.brief });
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Brief no encontrado');
        setLoading(false);
      }
    }
    loadBrief();
  }, [token]);

  // Tag input states
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
    setSaving(true);
    setError(null);
    try {
      await orpcClient.contentflow.public.updateBrief({
        token,
        brief: brief as any,
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Brief No Encontrado</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            El link puede ser inválido o haber expirado. Por favor contacta con tu agencia.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias!</h1>
          <p className="text-gray-600 mb-4">
            Tu información fue guardada correctamente.
          </p>
          <p className="text-sm text-gray-500">
            Tu agencia usará esta información para crear contenido personalizado para tu negocio.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Editar Brief
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-b-4 border-blue-600">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Brief de {clientName}
          </h1>
          <p className="text-gray-600">
            Completa esta información para que podamos crear el mejor contenido para tu negocio
          </p>
        </div>

        {/* Form - Same sections as internal brief */}
        <div className="space-y-6">
          {/* 1. INFORMACIÓN DEL NEGOCIO */}
          <section className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📋</span> Información del Negocio
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Negocio *</label>
                <input
                  type="text"
                  value={brief.business_name || ''}
                  onChange={(e) => setBrief({ ...brief, business_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Restaurante La Familia"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <textarea
                  value={brief.business_description || ''}
                  onChange={(e) => setBrief({ ...brief, business_description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe tu negocio, qué lo hace único, tu historia..."
                  required
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
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Delivery, Catering... (Enter para agregar)"
                  />
                  <button
                    type="button"
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
                        type="button"
                        onClick={() => removeFromArray('services', service)}
                        className="hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rango de Precios</label>
                  <select
                    value={brief.price_range || ''}
                    onChange={(e) => setBrief({ ...brief, price_range: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Centro, Madrid"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Horarios</label>
                  <input
                    type="text"
                    value={brief.schedule || ''}
                    onChange={(e) => setBrief({ ...brief, schedule: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Lun-Dom 12:00-23:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={brief.phone || ''}
                    onChange={(e) => setBrief({ ...brief, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          {/* 2. AUDIENCIA TARGET */}
          <section className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🎯</span> Audiencia Target
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rango de Edad</label>
                  <input
                    type="text"
                    value={brief.target_age || ''}
                    onChange={(e) => setBrief({ ...brief, target_age: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 25-45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Género</label>
                  <select
                    value={brief.target_gender || 'todos'}
                    onChange={(e) => setBrief({ ...brief, target_gender: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: gastronomía, deportes... (Enter para agregar)"
                  />
                  <button
                    type="button"
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
                        type="button"
                        onClick={() => removeFromArray('target_interests', interest)}
                        className="hover:text-red-600 font-bold"
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
          <section className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🎨</span> Estilo de Contenido
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tono de Voz *</label>
                <select
                  value={brief.content_tone || 'profesional'}
                  onChange={(e) => setBrief({ ...brief, content_tone: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {TONES.map(tone => (
                    <option key={tone.value} value={tone.value}>{tone.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Objetivos del Contenido</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GOALS.map(goal => (
                    <label key={goal.value} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={(brief.content_goals || []).includes(goal.value)}
                        onChange={() => toggleGoal(goal.value)}
                        className="w-4 h-4 text-blue-600"
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
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: #gastronomia... (Enter para agregar)"
                  />
                  <button
                    type="button"
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
                        type="button"
                        onClick={() => removeFromArray('hashtags_preferred', tag)}
                        className="hover:text-red-600 font-bold"
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
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: política, religión... (Enter para agregar)"
                  />
                  <button
                    type="button"
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
                        type="button"
                        onClick={() => removeFromArray('topics_to_avoid', topic)}
                        className="hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <button
              onClick={handleSave}
              disabled={saving || !brief.business_name || !brief.business_description}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {saving ? '💾 Guardando...' : '💾 Guardar Brief'}
            </button>
            {error && (
              <p className="mt-2 text-red-600 text-sm text-center">{error}</p>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-medium text-blue-900 mb-2">💡 ¿Para qué es esto?</h3>
            <p className="text-blue-700 text-sm">
              Tu agencia usará esta información para crear contenido personalizado y relevante para tu negocio en redes sociales.
              Cuanto más completo, mejor será el resultado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



