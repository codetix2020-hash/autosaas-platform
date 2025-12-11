"use client";

type ServiceCardProps = {
  name: string;
  duration: number;
  price: number;
  description?: string;
  xpValue?: number;
  accentColor: string;
  onClick?: () => void;
};

const serviceIcons: Record<string, string> = {
  corte: "✂️",
  tinte: "🎨",
  barba: "🪒",
  peinado: "💇",
  tratamiento: "✨",
  default: "💈",
};

function getServiceIcon(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("corte")) return serviceIcons.corte;
  if (lowerName.includes("tinte") || lowerName.includes("color")) return serviceIcons.tinte;
  if (lowerName.includes("barba")) return serviceIcons.barba;
  if (lowerName.includes("peinado")) return serviceIcons.peinado;
  if (lowerName.includes("tratamiento")) return serviceIcons.tratamiento;
  return serviceIcons.default;
}

export default function ServiceCard({ 
  name, 
  duration, 
  price, 
  description,
  xpValue,
  accentColor, 
  onClick 
}: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:scale-[1.01] group text-left"
      style={{ 
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-110"
        style={{ 
          backgroundColor: `${accentColor}20`,
        }}
      >
        {getServiceIcon(name)}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{duration} min</span>
          {xpValue && (
            <>
              <span className="text-gray-600">•</span>
              <span className="text-xs" style={{ color: accentColor }}>+{xpValue} XP</span>
            </>
          )}
        </div>
      </div>
      
      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="text-lg font-bold" style={{ color: accentColor }}>
          {price}€
        </p>
      </div>
    </button>
  );
}


