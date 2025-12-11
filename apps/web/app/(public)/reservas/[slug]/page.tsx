"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthModal from "./components/AuthModal";
import TrendCard from "./components/TrendCard";
import ServiceCard from "./components/ServiceCard";
import TrendModal from "./components/TrendModal";
import { defaultTheme, maleTrends, heroImages, TrendStyle } from "./theme";

type BusinessConfig = {
  name: string;
  description: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
};

type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  xp_value?: number;
};

type Professional = {
  id: string;
  name: string;
  specialties: string;
  avatar_url?: string;
};

// Usar tendencias masculinas
const trendingStyles = maleTrends;

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Navigation
  const [activeTab, setActiveTab] = useState<"home" | "booking" | "profile">("home");

  // Business data
  const [business, setBusiness] = useState<BusinessConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);

  // Booking wizard
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Trend modal
  const [selectedTrend, setSelectedTrend] = useState<TrendStyle | null>(null);
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);

  // Colors
  const primaryColor = business?.primaryColor || "#1a1a1a";
  const accentColor = "#D4AF37"; // Gold accent

  // Load business data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/public/reservas/${slug}`);
        if (!res.ok) throw new Error("Negocio no encontrado");
        const data = await res.json();
        setBusiness(data.business);
        setServices(data.services || []);
        setProfessionals(data.professionals || []);
        setOrganizationId(data.organizationId || slug);

        // Load saved session
        const saved = localStorage.getItem(`client_${data.organizationId || slug}`);
        if (saved) {
          const { client: c, levelInfo: l, rewards: r } = JSON.parse(saved);
          setClient(c);
          setLevelInfo(l);
          setRewards(r || []);
          setClientName(c.name);
          setClientEmail(c.email);
          setClientPhone(c.phone || "");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const handleAuthSuccess = (clientData: any, levelData: any, rewardsData: any[]) => {
    setClient(clientData);
    setLevelInfo(levelData);
    setRewards(rewardsData);
    setClientName(clientData.name);
    setClientEmail(clientData.email);
    setClientPhone(clientData.phone || "");
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(`client_${organizationId}`);
    setClient(null);
    setLevelInfo(null);
    setRewards([]);
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/reservas/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService.id,
          professional_id: selectedProfessional?.id || null,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          date: selectedDate,
          start_time: selectedTime,
          notes,
          client_profile_id: client?.id || null,
        }),
      });

      if (!res.ok) throw new Error("Error al crear reserva");
      setBookingSuccess(true);
    } catch (err) {
      alert("Error al crear la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookFromTrend = (trend: TrendStyle) => {
    setIsTrendModalOpen(false);
    setSelectedTrend(null);
    // Buscar servicio similar o ir directo a reserva
    const matchingService = services.find(s => 
      s.name.toLowerCase().includes('corte') || 
      s.duration >= trend.durationMinutes
    );
    if (matchingService) {
      setSelectedService(matchingService);
    }
    setNotes(`Estilo solicitado: ${trend.name}`);
    setActiveTab("booking");
    setStep(matchingService ? 2 : 1);
  };

  // Generate time slots
  const timeSlots = [];
  for (let h = 9; h < 20; h++) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${h.toString().padStart(2, "0")}:30`);
  }

  // Generate dates
  const dates = [];
  for (let i = 1; i <= 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">💈</div>
          <h1 className="text-2xl font-bold mb-2">Negocio no encontrado</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Elegant Header */}
      <header className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-transparent h-32" />
        <div className="relative px-6 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {business?.logo ? (
                <img src={business.logo} alt={business?.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})` }}
                >
                  {business?.name?.charAt(0) || "S"}
              </div>
            )}
            <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {business?.name || "Salón"}
                </h1>
                <p className="text-xs text-gray-400 tracking-wider uppercase">Beauty & Style</p>
              </div>
            </div>
            
            {client ? (
              <div className="flex items-center gap-2">
                <div 
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor: levelInfo?.current?.color || accentColor }}
                >
                  <span>{levelInfo?.current?.icon || "⭐"}</span>
                  <span>{client.total_xp} XP</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-full text-sm font-medium border border-white/20 hover:bg-white/10 transition-all"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative h-72 overflow-hidden">
              {/* Background with overlay for consistency */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url('${heroImages.main}')`,
                  filter: "brightness(0.7) saturate(0.9)",
                }}
              />
              <div 
                className="absolute inset-0"
                style={{ 
                  background: "linear-gradient(to top, rgba(5,5,7,1) 0%, rgba(5,5,7,0.6) 50%, rgba(5,5,7,0.4) 100%)" 
                }}
              />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 
                  className="text-3xl font-bold mb-2 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Tu estilo,<br />nuestra pasión
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Reserva tu cita y transforma tu look
                </p>
                <button
                  onClick={() => setActiveTab("booking")}
                  className="px-6 py-3 rounded-full font-semibold text-black transition-all hover:brightness-110 hover:scale-[1.02] shadow-lg"
                  style={{ 
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 20px ${accentColor}40`,
                  }}
                >
                  Reservar Ahora
                </button>
              </div>
            </div>

            {/* Quick Stats for logged in users */}
            {client && (
              <div className="px-6">
                <div 
                  className="rounded-2xl p-4 backdrop-blur-lg"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: levelInfo?.current?.color || accentColor }}
                      >
                        {levelInfo?.current?.icon || "⭐"}
                      </div>
                    <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-gray-400">{levelInfo?.current?.name || "Nivel 1"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: accentColor }}>{client.total_xp}</div>
                      <div className="text-xs text-gray-400">XP Total</div>
                    </div>
                  </div>
                  {levelInfo?.next && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Próximo nivel: {levelInfo.next.name}</span>
                        <span>{levelInfo.xpToNextLevel} XP restantes</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(((client.total_xp - (levelInfo.current?.min_xp || 0)) / ((levelInfo.next?.min_xp || 1) - (levelInfo.current?.min_xp || 0))) * 100, 100)}%`,
                            backgroundColor: accentColor 
                          }}
                        />
                      </div>
                    </div>
                  )}
            </div>
          </div>
        )}

            {/* Trending Styles */}
            <div className="px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Cortes en Tendencia
                </h3>
                <span 
                  className="text-xs uppercase tracking-wider cursor-pointer hover:opacity-80"
                  style={{ color: accentColor }}
                >
                  Ver todo →
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {trendingStyles.map((trend) => (
                  <TrendCard
                    key={trend.id}
                    name={trend.name}
                    category={trend.category}
                    image={trend.image}
                    accentColor={accentColor}
                    onClick={() => {
                      setSelectedTrend(trend);
                      setIsTrendModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Services Preview */}
            <div className="px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Nuestros Servicios
                </h3>
              </div>
              <div className="space-y-3">
                {services.slice(0, 4).map((service) => (
                  <ServiceCard
                    key={service.id}
                    name={service.name}
                    duration={service.duration}
                    price={service.price}
                    description={service.description}
                    xpValue={service.xp_value}
                    accentColor={accentColor}
                    onClick={() => {
                      setSelectedService(service);
                      setActiveTab("booking");
                      setStep(2);
                    }}
                  />
                ))}
              </div>
              {services.length > 4 && (
                <button
                  onClick={() => setActiveTab("booking")}
                  className="w-full mt-4 py-3 rounded-xl font-medium transition-all hover:bg-white/5"
                  style={{ 
                    border: `1px solid ${accentColor}40`,
                    color: accentColor,
                  }}
                >
                  Ver todos los servicios ({services.length})
                </button>
              )}
            </div>

            {/* Contact Info */}
            {(business?.address || business?.phone) && (
              <div className="px-6">
                <div 
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-400">Contacto</h3>
                  {business?.address && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="text-gray-400">📍</span>
                      <span>{business.address}, {business.city}</span>
                    </div>
                  )}
                  {business?.phone && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="text-gray-400">📞</span>
                      <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                    </div>
                  )}
                  {business?.instagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">📸</span>
                      <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: accentColor }}>
                        Síguenos en Instagram
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOOKING TAB */}
        {activeTab === "booking" && (
          <div className="px-6 py-4">
            {bookingSuccess ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ¡Reserva Confirmada!
                </h2>
                <p className="text-gray-400 mb-6">Te esperamos en tu cita</p>
                {client && selectedService?.xp_value && (
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span>+{selectedService.xp_value} XP</span>
                    <span>al completar</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setBookingSuccess(false);
                    setStep(1);
                    setSelectedService(null);
                    setSelectedProfessional(null);
                    setSelectedDate("");
                    setSelectedTime("");
                    setActiveTab("home");
                  }}
                  className="px-6 py-3 rounded-full font-medium"
                  style={{ backgroundColor: accentColor, color: "black" }}
                >
                  Volver al inicio
                </button>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          step >= s ? "text-black" : "text-gray-500 bg-white/10"
                        }`}
                        style={step >= s ? { backgroundColor: accentColor } : {}}
                      >
                        {step > s ? "✓" : s}
                      </div>
                      {s < 4 && (
                        <div className={`w-8 h-0.5 ${step > s ? "bg-[#D4AF37]" : "bg-white/10"}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Service */}
                {step === 1 && (
                  <div>
                    <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Elige un servicio
                    </h2>
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service);
                            setStep(2);
                          }}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            selectedService?.id === service.id 
                              ? "ring-2" 
                              : "hover:bg-white/10"
                          }`}
                          style={{ 
                            backgroundColor: "rgba(255,255,255,0.05)",
                            ...(selectedService?.id === service.id ? { borderColor: accentColor } : {}),
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-gray-400">{service.duration} min • {service.description}</div>
                              {service.xp_value && (
                                <div className="text-xs mt-1" style={{ color: accentColor }}>
                                  +{service.xp_value} XP
                                </div>
                              )}
                            </div>
                            <div className="text-xl font-bold" style={{ color: accentColor }}>
                              €{service.price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Professional */}
                {step === 2 && (
                  <div>
                    <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Elige profesional
                    </h2>
                    <div className="space-y-3">
                      <div
                        onClick={() => {
                          setSelectedProfessional(null);
                          setStep(3);
                        }}
                        className="p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                        style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            ✨
                          </div>
                          <div>
                            <div className="font-medium">Sin preferencia</div>
                            <div className="text-sm text-gray-400">Cualquier profesional disponible</div>
                          </div>
                        </div>
                      </div>
                      {professionals.map((pro) => (
                        <div
                          key={pro.id}
                          onClick={() => {
                            setSelectedProfessional(pro);
                            setStep(3);
                          }}
                          className="p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                              style={{ backgroundColor: accentColor }}
                            >
                              {pro.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{pro.name}</div>
                              <div className="text-sm text-gray-400">{pro.specialties}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="w-full mt-4 py-3 rounded-xl font-medium border border-white/20"
                    >
                      ← Volver
                    </button>
                  </div>
                )}

                {/* Step 3: Date & Time */}
                {step === 3 && (
                  <div>
                    <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Fecha y hora
                    </h2>
                    
                    <div className="mb-6">
                      <label className="text-sm text-gray-400 mb-2 block">Fecha</label>
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
                        {dates.map((date) => {
                          const d = new Date(date);
                          const isSelected = selectedDate === date;
                          return (
                            <button
                              key={date}
                              onClick={() => setSelectedDate(date)}
                              className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
                                isSelected ? "text-black" : "bg-white/5 hover:bg-white/10"
                              }`}
                              style={isSelected ? { backgroundColor: accentColor } : {}}
                            >
                              <div className="text-xs uppercase">{d.toLocaleDateString("es", { weekday: "short" })}</div>
                              <div className="text-lg font-bold">{d.getDate()}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-sm text-gray-400 mb-2 block">Hora</label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => {
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 rounded-lg text-sm transition-all ${
                                isSelected ? "text-black" : "bg-white/5 hover:bg-white/10"
                              }`}
                              style={isSelected ? { backgroundColor: accentColor } : {}}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 py-3 rounded-xl font-medium border border-white/20"
                      >
              ← Volver
            </button>
                      <button
                        onClick={() => setStep(4)}
                        disabled={!selectedDate || !selectedTime}
                        className="flex-1 py-3 rounded-xl font-medium disabled:opacity-50 text-black"
                        style={{ backgroundColor: accentColor }}
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirm */}
                {step === 4 && (
                  <div>
                    <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Confirmar reserva
                    </h2>

                    {/* Summary */}
                    <div 
                      className="rounded-xl p-4 mb-6"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
              <div>
                          <div className="font-medium">{selectedService?.name}</div>
                          <div className="text-sm text-gray-400">{selectedService?.duration} min</div>
                        </div>
                        <div className="text-xl font-bold" style={{ color: accentColor }}>
                          €{selectedService?.price}
                        </div>
                      </div>
                      <div className="text-sm space-y-1 text-gray-300">
                        <div>📅 {new Date(selectedDate).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</div>
                        <div>🕐 {selectedTime}</div>
                        <div>👤 {selectedProfessional?.name || "Cualquier profesional"}</div>
                      </div>
                    </div>

                    {/* Client info */}
                    {!client && (
                      <div className="space-y-4 mb-6">
                <input
                  type="text"
                          placeholder="Tu nombre"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none"
                />
                <input
                  type="email"
                          placeholder="Tu email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none"
                />
                <input
                  type="tel"
                          placeholder="Tu teléfono"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
                    )}
              
                <textarea
                      placeholder="Notas adicionales (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:outline-none mb-6"
                      rows={2}
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 py-3 rounded-xl font-medium border border-white/20"
                      >
                        ← Volver
                      </button>
            <button
                        onClick={handleBooking}
                        disabled={submitting || !clientName || !clientEmail}
                        className="flex-1 py-3 rounded-xl font-medium disabled:opacity-50 text-black"
                        style={{ backgroundColor: accentColor }}
                      >
                        {submitting ? "Reservando..." : "Confirmar"}
            </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="px-6 py-4">
            {client ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div 
                  className="rounded-2xl p-6 text-center"
                  style={{ background: `linear-gradient(135deg, ${levelInfo?.current?.color || accentColor}40, transparent)` }}
                >
                  <div 
                    className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
                    style={{ backgroundColor: levelInfo?.current?.color || accentColor }}
                  >
                    {levelInfo?.current?.icon || "⭐"}
                  </div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {client.name}
                  </h2>
                  <p className="text-gray-400">{levelInfo?.current?.name || "Nivel 1"}</p>
                  <div className="text-3xl font-bold mt-2" style={{ color: accentColor }}>
                    {client.total_xp} XP
                  </div>
              </div>
              
                {/* Progress to next level */}
                {levelInfo?.next && (
                  <div 
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Próximo nivel</span>
                      <span style={{ color: accentColor }}>{levelInfo.next.name}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(((client.total_xp - (levelInfo.current?.min_xp || 0)) / ((levelInfo.next?.min_xp || 1) - (levelInfo.current?.min_xp || 0))) * 100, 100)}%`,
                          backgroundColor: accentColor 
                        }}
                      />
                    </div>
                    <div className="text-center text-sm text-gray-400 mt-2">
                      {levelInfo.xpToNextLevel} XP para {levelInfo.next.name}
                    </div>
                    {levelInfo.next.reward_description && (
                      <div className="text-center text-sm mt-2" style={{ color: accentColor }}>
                        🎁 {levelInfo.next.reward_description}
                      </div>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div 
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="text-2xl font-bold" style={{ color: accentColor }}>{client.total_visits || 0}</div>
                    <div className="text-xs text-gray-400">Visitas</div>
                  </div>
                  <div 
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="text-2xl font-bold" style={{ color: accentColor }}>€{client.total_spent || 0}</div>
                    <div className="text-xs text-gray-400">Gastado</div>
                  </div>
                  <div 
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="text-2xl font-bold" style={{ color: accentColor }}>{client.current_level}</div>
                    <div className="text-xs text-gray-400">Nivel</div>
                  </div>
              </div>
              
                {/* Rewards */}
                {rewards && rewards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Mis Recompensas
                    </h3>
                    <div className="space-y-2">
                      {rewards.map((reward: any) => (
                        <div 
                          key={reward.id}
                          className="rounded-xl p-4 flex items-center justify-between"
                          style={{ backgroundColor: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.3)" }}
                        >
                          <div>
                            <div className="font-medium">{reward.reward_description}</div>
                            <div className="text-xs text-gray-400">Disponible</div>
                          </div>
                          <span className="text-2xl">🎁</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Levels */}
                <div>
                  <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Niveles
                  </h3>
                  <div className="space-y-2">
                    {levelInfo?.allLevels?.map((level: any) => (
                      <div 
                        key={level.level_number}
                        className={`rounded-xl p-3 flex items-center gap-3 ${
                          client.current_level >= level.level_number ? "opacity-100" : "opacity-40"
                        }`}
                        style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: level.color }}
                        >
                          {level.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{level.name}</div>
                          <div className="text-xs text-gray-400">{level.min_xp} XP</div>
                        </div>
                        {client.current_level >= level.level_number && (
                          <span className="text-green-500">✓</span>
                        )}
                      </div>
                    ))}
              </div>
            </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl font-medium border border-white/20 text-gray-400"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👤</div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Inicia sesión
                </h2>
                <p className="text-gray-400 mb-6">Accede a tu perfil, acumula XP y desbloquea recompensas</p>
            <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 rounded-full font-medium text-black"
                  style={{ backgroundColor: accentColor }}
                >
                  Iniciar Sesión
            </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 safe-area-bottom">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all ${
              activeTab === "home" ? "text-[#D4AF37]" : "text-gray-500"
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab("booking")}
            className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all ${
              activeTab === "booking" ? "text-[#D4AF37]" : "text-gray-500"
            }`}
          >
            <span className="text-xl">📅</span>
            <span className="text-xs mt-1">Reservar</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all ${
              activeTab === "profile" ? "text-[#D4AF37]" : "text-gray-500"
            }`}
          >
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1">Perfil</span>
          </button>
      </div>
      </nav>

      {/* Auth Modal */}
      {organizationId && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          organizationId={organizationId}
          businessName={business?.name || "Salón"}
          primaryColor={primaryColor}
        />
      )}

      {/* Trend Modal */}
      <TrendModal
        trend={selectedTrend}
        isOpen={isTrendModalOpen}
        onClose={() => {
          setIsTrendModalOpen(false);
          setSelectedTrend(null);
        }}
        onBook={handleBookFromTrend}
        accentColor={accentColor}
      />
    </div>
  );
}
