// Sistema de tema para la página pública de reservas - BARBERÍA MASCULINA

export type Theme = {
  background: string;
  backgroundSecondary: string;
  primary: string;
  primaryHover: string;
  text: string;
  textMuted: string;
  border: string;
};

export const defaultTheme: Theme = {
  background: "#050507",
  backgroundSecondary: "#0f0f12",
  primary: "#D4AF37",
  primaryHover: "#E5C158",
  text: "#ffffff",
  textMuted: "#9ca3af",
  border: "rgba(255, 255, 255, 0.1)",
};

// Tendencias masculinas - Barbería moderna
export type TrendStyle = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  basePrice: number;
  image: string;
  shortDescription: string;
  fullDescription: string;
  recommendedFor: string;
};

export const maleTrends: TrendStyle[] = [
  {
    id: "fade-moderno",
    name: "Fade Moderno",
    category: "POPULAR",
    durationMinutes: 40,
    basePrice: 18,
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&h=600&fit=crop",
    shortDescription: "Degradado limpio en los laterales con más volumen arriba.",
    fullDescription: "El fade moderno es el corte más solicitado en barberías. Presenta un degradado perfectamente ejecutado en los laterales que transiciona suavemente hacia la parte superior, donde se mantiene más largo para permitir diferentes estilos de peinado.",
    recommendedFor: "Todo tipo de rostro. Ideal para quienes buscan un look pulido y moderno.",
  },
  {
    id: "buzz-cut",
    name: "Buzz Cut",
    category: "CLÁSICO",
    durationMinutes: 25,
    basePrice: 14,
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&h=600&fit=crop",
    shortDescription: "Corte al ras, muy corto y parejo. Fácil de mantener.",
    fullDescription: "El buzz cut es la opción perfecta para quienes prefieren un estilo minimalista y de bajo mantenimiento. Todo el cabello se corta a la misma longitud muy corta, creando un look limpio y masculino.",
    recommendedFor: "Rostros ovalados y angulares. Perfecto para el verano o deportistas.",
  },
  {
    id: "crop-frances",
    name: "Crop Francés",
    category: "TENDENCIA",
    durationMinutes: 40,
    basePrice: 20,
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&h=600&fit=crop",
    shortDescription: "Laterales cortos y parte superior texturizada con flequillo corto.",
    fullDescription: "El crop francés combina laterales muy cortos con una parte superior texturizada y un flequillo corto hacia adelante. Es un corte moderno que funciona bien con todo tipo de cabello y requiere poco mantenimiento.",
    recommendedFor: "Ideal para rostros alargados. Funciona muy bien con cabello liso o ligeramente ondulado.",
  },
  {
    id: "taper-fade",
    name: "Taper Fade",
    category: "VERSÁTIL",
    durationMinutes: 45,
    basePrice: 20,
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&h=600&fit=crop",
    shortDescription: "Degradado suave en nuca y patillas, más largo arriba.",
    fullDescription: "El taper fade ofrece una transición más sutil que el fade tradicional. El cabello disminuye gradualmente en longitud hacia la nuca y las patillas, manteniendo más largo en los laterales y la parte superior.",
    recommendedFor: "Todos los tipos de rostro. Excelente para entornos profesionales.",
  },
  {
    id: "pompadour-moderno",
    name: "Pompadour Moderno",
    category: "ELEGANTE",
    durationMinutes: 50,
    basePrice: 22,
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&h=600&fit=crop",
    shortDescription: "Volumen marcado hacia atrás con laterales más cortos.",
    fullDescription: "Una actualización del clásico pompadour de los años 50. Los laterales se mantienen cortos o con fade, mientras la parte superior se peina hacia atrás con volumen. Look sofisticado y atemporal.",
    recommendedFor: "Rostros ovalados y redondos. Requiere producto para mantener el estilo.",
  },
  {
    id: "skin-fade-barba",
    name: "Skin Fade + Barba",
    category: "PREMIUM",
    durationMinutes: 55,
    basePrice: 28,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=600&fit=crop",
    shortDescription: "Degradado al cero con barba perfectamente perfilada.",
    fullDescription: "La combinación definitiva: un skin fade que llega hasta la piel en los laterales, conectado perfectamente con una barba bien trabajada y perfilada. El servicio incluye corte y arreglo completo de barba.",
    recommendedFor: "Quienes buscan el look completo de barbería. Ideal para barba densa.",
  },
];

// Hero images para barbería
export const heroImages = {
  main: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=800&fit=crop",
  alt: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=800&fit=crop",
};
