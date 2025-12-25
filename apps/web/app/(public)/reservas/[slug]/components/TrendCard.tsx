"use client";

type TrendCardProps = {
  name: string;
  category: string;
  image: string;
  accentColor: string;
  price?: number;
  onClick?: () => void;
};

export default function TrendCard({ name, category, image, accentColor, price, onClick }: TrendCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 w-[280px] h-[350px] rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-[1.02]"
      style={{ 
        backgroundColor: "#0f0f12",
        border: `1px solid ${accentColor}30`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 50px ${accentColor}50, 0 0 30px ${accentColor}30`;
        e.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
        e.currentTarget.style.borderColor = `${accentColor}30`;
      }}
    >
      {/* Image */}
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      
      {/* Gradient overlay - más elegante */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, transparent 100%)" 
        }}
      />
      
      {/* Category badge - más premium */}
      <div className="absolute top-4 left-4 z-10">
        <span 
          className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          style={{ 
            backgroundColor: `${accentColor}25`,
            color: accentColor,
            border: `1px solid ${accentColor}60`,
          }}
        >
          {category}
        </span>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <p className="text-xl font-bold text-white leading-tight mb-3 drop-shadow-lg">
          {name}
        </p>
        {price !== undefined && price > 0 && (
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold drop-shadow-lg" style={{ color: accentColor }}>
              {price}€
            </span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">desde</span>
          </div>
        )}
        
        {/* Botón "Ver estilo" que aparece al hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-black"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: `0 4px 15px ${accentColor}60`,
            }}
          >
            <span>Ver estilo</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </button>
  );
}


