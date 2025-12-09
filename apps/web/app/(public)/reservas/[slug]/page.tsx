"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// Tipos para la página pública
type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
};

type Professional = {
  id: string;
  name: string;
  specialties?: string;
  avatar_url?: string;
};

type TimeSlot = {
  time: string;
  available: boolean;
};

type BookingStep = "service" | "professional" | "datetime" | "details" | "confirm";

export default function ReservasPublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [step, setStep] = useState<BookingStep>("service");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Datos del negocio
  const [businessName, setBusinessName] = useState("ReservasPro");
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  
  // Selecciones del usuario
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Datos del cliente
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  // Cargar datos del negocio
  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/reservas/${slug}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Error loading business");
        }
        
        setBusinessName(data.business?.name || "Mi Salón");
        setBusinessLogo(data.business?.logo);
        setPrimaryColor(data.business?.primaryColor || "#3B82F6");
        setServices(data.services || []);
        setProfessionals(data.professionals || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "No se pudo cargar la información del negocio");
        setLoading(false);
      }
    }
    loadBusiness();
  }, [slug]);

  // Generar slots de tiempo cuando se selecciona fecha
  useEffect(() => {
    if (selectedDate && selectedService) {
      // TODO: Fetch real availability
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 19; hour++) {
        slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: Math.random() > 0.3 });
        slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: Math.random() > 0.3 });
      }
      setTimeSlots(slots);
    }
  }, [selectedDate, selectedService]);

  // Generar próximos 14 días
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return days;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/public/reservas/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService?.id,
          professional_id: selectedProfessional?.id || null,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          date: selectedDate,
          start_time: selectedTime,
          notes: clientNotes,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la reserva");
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al crear la reserva. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === "service") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h2>
          <p className="text-gray-600 mb-6">
            Te hemos enviado un email de confirmación a <strong>{clientEmail}</strong>
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="text-sm text-gray-500">Resumen</div>
            <div className="font-semibold">{selectedService?.name}</div>
            <div className="text-gray-600">{selectedDate} a las {selectedTime}</div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {businessLogo ? (
              <img src={businessLogo} alt={businessName} className="h-12 w-12 rounded-full" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white text-xl font-bold">
                {businessName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{businessName}</h1>
              <p className="text-gray-500 text-sm">Reserva online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {["service", "professional", "datetime", "details", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? "bg-blue-600 text-white" :
                ["service", "professional", "datetime", "details", "confirm"].indexOf(step) > i ? "bg-green-500 text-white" :
                "bg-gray-200 text-gray-500"
              }`}>
                {["service", "professional", "datetime", "details", "confirm"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 4 && <div className={`w-12 sm:w-24 h-1 mx-2 ${
                ["service", "professional", "datetime", "details", "confirm"].indexOf(step) > i ? "bg-green-500" : "bg-gray-200"
              }`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Seleccionar Servicio */}
        {step === "service" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona un servicio</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep("professional"); }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-500 hover:shadow-md ${
                    selectedService?.id === service.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.duration} min</div>
                      {service.description && (
                        <div className="text-sm text-gray-400 mt-1">{service.description}</div>
                      )}
                    </div>
                    <div className="text-lg font-bold text-blue-600">€{service.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Seleccionar Profesional */}
        {step === "professional" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button onClick={() => setStep("service")} className="text-blue-600 mb-4 flex items-center gap-1 hover:underline">
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona un profesional</h2>
            
            {professionals.length > 0 ? (
              <div className="space-y-3">
                <button
                  onClick={() => { setSelectedProfessional(null); setStep("datetime"); }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedProfessional === null ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900">Cualquier profesional disponible</div>
                  <div className="text-sm text-gray-500">Te asignaremos el mejor disponible</div>
                </button>
                
                {professionals.map((professional) => (
                  <button
                    key={professional.id}
                    onClick={() => { setSelectedProfessional(professional); setStep("datetime"); }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedProfessional?.id === professional.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {professional.avatar_url ? (
                        <img src={professional.avatar_url} alt={professional.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {professional.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{professional.name}</div>
                        {professional.specialties && (
                          <div className="text-sm text-gray-500">{professional.specialties}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No hay profesionales disponibles</p>
                <button
                  onClick={() => setStep("datetime")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continuar sin seleccionar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Seleccionar Fecha y Hora */}
        {step === "datetime" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button onClick={() => setStep("professional")} className="text-blue-600 mb-4 flex items-center gap-1 hover:underline">
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona fecha y hora</h2>
            
            {/* Fechas */}
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-3">Fecha</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getNextDays().map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    disabled={day.isWeekend}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl text-center transition-all ${
                      selectedDate === day.date 
                        ? "bg-blue-600 text-white" 
                        : day.isWeekend
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <div className="text-xs">{day.label.split(' ')[0]}</div>
                    <div className="font-bold">{day.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Horas */}
            {selectedDate && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">Hora disponible</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? "bg-blue-600 text-white"
                          : slot.available
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <button
                onClick={() => setStep("details")}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                Continuar
              </button>
            )}
          </div>
        )}

                   {/* Step 4: Datos del Cliente */}
                   {step === "details" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button onClick={() => setStep("datetime")} className="text-blue-600 mb-4 flex items-center gap-1 hover:underline">
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tus datos</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+34 600 000 000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Alguna indicación especial..."
                  rows={3}
                />
              </div>
            </div>

            <button
              onClick={() => setStep("confirm")}
              disabled={!clientName || !clientEmail || !clientPhone}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Revisar reserva
            </button>
          </div>
        )}

                   {/* Step 5: Confirmar */}
                   {step === "confirm" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button onClick={() => setStep("details")} className="text-blue-600 mb-4 flex items-center gap-1 hover:underline">
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Confirma tu reserva</h2>
            
            <div className="space-y-4 mb-6">
                         <div className="bg-gray-50 rounded-xl p-4">
                           <div className="text-sm text-gray-500 mb-1">Servicio</div>
                           <div className="font-semibold">{selectedService?.name}</div>
                           <div className="text-blue-600 font-bold">€{selectedService?.price}</div>
                         </div>
                         
                         {selectedProfessional && (
                           <div className="bg-gray-50 rounded-xl p-4">
                             <div className="text-sm text-gray-500 mb-1">Profesional</div>
                             <div className="font-semibold">{selectedProfessional.name}</div>
                           </div>
                         )}
                         
                         <div className="bg-gray-50 rounded-xl p-4">
                           <div className="text-sm text-gray-500 mb-1">Fecha y hora</div>
                           <div className="font-semibold">{selectedDate} a las {selectedTime}</div>
                           <div className="text-gray-500">{selectedService?.duration} minutos</div>
                         </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Tus datos</div>
                <div className="font-semibold">{clientName}</div>
                <div className="text-gray-600">{clientEmail}</div>
                <div className="text-gray-600">{clientPhone}</div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50 text-lg"
            >
              {loading ? "Procesando..." : "✓ Confirmar Reserva"}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Recibirás un email de confirmación
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">
        Powered by ReservasPro
      </footer>
    </div>
  );
}
