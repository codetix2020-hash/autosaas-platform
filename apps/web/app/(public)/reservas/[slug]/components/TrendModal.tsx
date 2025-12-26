"use client";

import { TrendStyle } from "../theme";

type TrendModalProps = {
  trend: TrendStyle | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (trend: TrendStyle) => void;
  accentColor: string;
};

export default function TrendModal({ trend, isOpen, onClose, onBook, accentColor }: TrendModalProps) {
  if (!isOpen || !trend) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#0a0a0c] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-64 sm:h-72">
          <img 
            src={trend.image} 
            alt={trend.name}
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(10,10,12,1) 0%, rgba(10,10,12,0.3) 50%, transparent 100%)" }}
          />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
          
          {/* Category badge */}
          <div 
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: accentColor, color: "#000" }}
          >
            {trend.category}
          </div>
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {trend.name}
            </h2>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
          {/* Quick stats */}
          <div className="flex gap-4">
            <div className="flex-1 rounded-xl p-3 bg-white/5">
              <div className="text-xs text-gray-400 mb-1">Duración</div>
              <div className="font-semibold text-white">{trend.durationMinutes} min</div>
            </div>
            <div className="flex-1 rounded-xl p-3 bg-white/5">
              <div className="text-xs text-gray-400 mb-1">Precio desde</div>
              <div className="font-semibold" style={{ color: accentColor }}>{trend.basePrice}€</div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Sobre este corte</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {trend.fullDescription}
            </p>
          </div>
          
          {/* Recommended for */}
          <div className="rounded-xl p-4 bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Recomendado para</h4>
                <p className="text-xs text-gray-400">{trend.recommendedFor}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="p-6 pt-0">
          <button
            onClick={() => onBook(trend)}
            className="w-full py-4 rounded-2xl font-semibold text-black transition-all hover:brightness-110 hover:scale-[1.01]"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: `0 4px 20px ${accentColor}40`,
            }}
          >
            Reservar este corte →
          </button>
        </div>
      </div>
    </div>
  );
}



