"use client";

type TrendCardProps = {
  name: string;
  category: string;
  image: string;
  accentColor: string;
  onClick?: () => void;
};

export default function TrendCard({ name, category, image, accentColor, onClick }: TrendCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 w-36 h-48 rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      style={{ backgroundColor: "#0f0f12" }}
    >
      {/* Image */}
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 100%)" 
        }}
      />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span 
          className="text-[10px] font-medium uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          {category}
        </span>
        <p className="text-sm font-semibold text-white leading-tight mt-0.5">
          {name}
        </p>
      </div>
      
      {/* Hover border effect */}
      <div 
        className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-opacity-50 transition-all duration-300"
        style={{ borderColor: accentColor }}
      />
    </button>
  );
}


