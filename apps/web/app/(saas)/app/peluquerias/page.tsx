"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Peluqueria = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
};

export default function PeluqueriasPage() {
  const [peluquerias, setPeluquerias] = useState<Peluqueria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    loadPeluquerias();
  }, []);

  const loadPeluquerias = async () => {
    try {
      const res = await fetch("/api/peluquerias");
      const data = await res.json();
      setPeluquerias(data.peluquerias || []);
    } catch (err) {
      console.error("Error loading peluquerias:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug from name
    const generatedSlug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with -
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing -
    setSlug(generatedSlug);
  };

  const handleCreate = async () => {
    if (!name || !slug) {
      alert("Por favor completa todos los campos");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/peluquerias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al crear la peluquería");
        return;
      }

      // Reset form and reload
      setName("");
      setSlug("");
      setShowModal(false);
      loadPeluquerias();
      
      alert(`✅ Peluquería "${name}" creada!\n\nURL pública: /reservas/${slug}`);
    } catch (err) {
      alert("Error al crear la peluquería");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">💈 Mis Peluquerías</h1>
          <p className="text-gray-500 mt-1">Gestiona tus negocios de barbería</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Nueva Peluquería
        </button>
      </div>

      {/* Lista de peluquerías */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : peluquerias.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">💈</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No hay peluquerías</h3>
          <p className="text-gray-500 mb-6">Crea tu primera peluquería para empezar</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            + Crear Peluquería
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {peluquerias.map((pelu) => (
            <div
              key={pelu.id}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {pelu.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{pelu.name}</h3>
                    <p className="text-sm text-gray-500">/{pelu.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/reservas/${pelu.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    👁️ Ver pública
                  </Link>
                  <Link
                    href={`/app/${pelu.slug}/reservas`}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    ⚙️ Administrar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear peluquería */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-6">Nueva Peluquería</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Barbería El Corte"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (slug)
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-1">/reservas/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="barberia-el-corte"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Esta será la URL pública de reservas
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !name || !slug}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {creating ? "Creando..." : "Crear Peluquería"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

