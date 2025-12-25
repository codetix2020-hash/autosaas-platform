"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Style = {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number | null;
  base_price: number | null;
  image_url: string;
  recommended_for: string[] | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type FormData = {
  name: string;
  category: string;
  description: string;
  duration_minutes: number | null;
  base_price: number | null;
  image_url: string;
  recommended_for: string;
  display_order: number | null;
};

const initialFormData: FormData = {
  name: "",
  category: "",
  description: "",
  duration_minutes: null,
  base_price: null,
  image_url: "",
  recommended_for: "",
  display_order: null,
};

const categories = [
  "Fade",
  "Clásico",
  "Moderno",
  "Barba",
  "Degradado",
  "Texturizado",
];

const accentColor = "#D4AF37";

export default function GaleriaPage() {
  const params = useParams();
  const orgSlug = params.organizationSlug as string;

  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar estilos
  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/styles");
      if (!res.ok) throw new Error("Error al cargar estilos");
      const data = await res.json();
      setStyles(data.styles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (style: Style) => {
    setEditingId(style.id);
    setFormData({
      name: style.name || "",
      category: style.category || "",
      description: style.description || "",
      duration_minutes: style.duration_minutes,
      base_price: style.base_price,
      image_url: style.image_url || "",
      recommended_for: style.recommended_for?.join(", ") || "",
      display_order: style.display_order,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este estilo?")) {
      return;
    }

    try {
      const res = await fetch(`/api/styles/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar estilo");
      await loadStyles();
    } catch (err: any) {
      alert("Error al eliminar estilo: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validar campos requeridos
    if (!formData.name || !formData.category || !formData.image_url) {
      setFormError("Nombre, categoría e imagen son requeridos");
      return;
    }

    setSubmitting(true);
    try {
      const recommendedForArray = formData.recommended_for
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description || null,
        duration_minutes: formData.duration_minutes || null,
        base_price: formData.base_price || null,
        image_url: formData.image_url,
        recommended_for: recommendedForArray,
        display_order: formData.display_order || null,
      };

      const url = editingId ? `/api/styles/${editingId}` : "/api/styles";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar estilo");
      }

      setIsModalOpen(false);
      await loadStyles();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar solo estilos activos para mostrar
  const activeStyles = styles.filter((s) => s.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Galería de Estilos
            </h1>
            <p className="text-gray-400">Gestiona los estilos de corte que se mostrarán en tu página pública</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-3 rounded-xl font-semibold text-black transition-all hover:brightness-110 hover:scale-[1.02] shadow-lg"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 4px 20px ${accentColor}40`,
            }}
          >
            + Agregar Estilo
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 border-b border-white/10 pb-4">
          <Link
            href={`/app/${orgSlug}/reservas`}
            className="px-4 py-2 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
          >
            📅 Reservas
          </Link>
          <Link
            href={`/app/${orgSlug}/reservas/servicios`}
            className="px-4 py-2 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
          >
            💇 Servicios
          </Link>
          <Link
            href={`/app/${orgSlug}/reservas/profesionales`}
            className="px-4 py-2 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
          >
            👩‍💼 Profesionales
          </Link>
          <Link
            href={`/app/${orgSlug}/reservas/clientes`}
            className="px-4 py-2 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
          >
            👥 Clientes
          </Link>
          <Link
            href={`/app/${orgSlug}/galeria`}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
            }}
          >
            ✂️ Galería
          </Link>
          <Link
            href={`/app/${orgSlug}/reservas/fidelizacion`}
            className="px-4 py-2 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
          >
            🏆 Fidelización
          </Link>
          <Link
            href={`/app/${orgSlug}/reservas/configuracion`}
            className="px-4 py-2 text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
          >
            ⚙️ Configuración
          </Link>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Styles Grid */}
        {activeStyles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✂️</div>
            <h2 className="text-xl font-bold mb-2">No hay estilos aún</h2>
            <p className="text-gray-400 mb-6">Comienza agregando tu primer estilo de corte</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 rounded-xl font-semibold text-black"
              style={{ backgroundColor: accentColor }}
            >
              Agregar Primer Estilo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeStyles.map((style) => (
              <div
                key={style.id}
                className="rounded-2xl overflow-hidden bg-[#1a1a1c] border border-white/10 hover:border-[#D4AF37]/50 transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={style.image_url}
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1c] via-transparent to-transparent" />
                  {/* Category badge */}
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: accentColor, color: "#000" }}
                  >
                    {style.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{style.name}</h3>
                    {style.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{style.description}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    {style.duration_minutes && (
                      <div className="text-gray-400">
                        ⏱ {style.duration_minutes} min
                      </div>
                    )}
                    {style.base_price !== null && (
                      <div style={{ color: accentColor }} className="font-semibold">
                        €{style.base_price}
                      </div>
                    )}
                  </div>

                  {/* Recommended for */}
                  {style.recommended_for && style.recommended_for.length > 0 && (
                    <div className="text-xs text-gray-500">
                      💡 {style.recommended_for.join(", ")}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleEdit(style)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                      style={{ border: `1px solid ${accentColor}40`, color: accentColor }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(style.id)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/30"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10"
            style={{ backgroundColor: "#1a1a1c" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1c]">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {editingId ? "Editar Estilo" : "Nuevo Estilo"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none text-white"
                  placeholder="Ej: Fade Clásico"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none text-white"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} style={{ backgroundColor: "#1a1a1c", color: "white" }}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none text-white resize-none"
                  placeholder="Describe el estilo de corte..."
                  rows={3}
                />
              </div>

              {/* Duration and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duración (min)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none text-white"
                    placeholder="30"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Precio base (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_price: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none text-white"
                    placeholder="25.00"
                    min="0"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium mb-2">URL de Imagen *</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none text-white"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required
                />
                {formData.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Recommended for */}
              <div>
                <label className="block text-sm font-medium mb-2">Recomendado para</label>
                <input
                  type="text"
                  value={formData.recommended_for}
                  onChange={(e) => setFormData({ ...formData, recommended_for: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none text-white"
                  placeholder="Ej: Cabello rizado, Estilo casual, Oficina (separado por comas)"
                />
                <p className="text-xs text-gray-500 mt-1">Separa los valores con comas</p>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium mb-2">Orden de visualización</label>
                <input
                  type="number"
                  value={formData.display_order || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none text-white"
                  placeholder="Dejar vacío para agregar al final"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Número menor = aparece primero</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: accentColor }}
                >
                  {submitting ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

