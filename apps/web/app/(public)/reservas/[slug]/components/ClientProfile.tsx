"use client";

type ClientProfileProps = {
  client: any;
  levelInfo: any;
  rewards: any[];
  primaryColor: string;
  onLogout: () => void;
};

export default function ClientProfile({
  client,
  levelInfo,
  rewards,
  primaryColor,
  onLogout,
}: ClientProfileProps) {
  const xpProgress = levelInfo?.next 
    ? ((client.total_xp - (levelInfo.current?.min_xp || 0)) / 
       ((levelInfo.next?.min_xp || 1) - (levelInfo.current?.min_xp || 0))) * 100
    : 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
      {/* Header con nivel */}
      <div 
        className="p-4 text-white"
        style={{ backgroundColor: levelInfo?.current?.color || primaryColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
              {levelInfo?.current?.icon || "⭐"}
            </div>
            <div>
              <div className="font-bold">{client.name}</div>
              <div className="text-sm opacity-90">
                {levelInfo?.current?.name || "Nivel 1"} • {client.total_xp.toLocaleString()} XP
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-white text-opacity-80 hover:text-opacity-100 text-sm"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      {levelInfo?.next && (
        <div className="p-4 border-b">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso al siguiente nivel</span>
            <span className="font-medium" style={{ color: primaryColor }}>
              {levelInfo.xpToNextLevel} XP restantes
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(xpProgress, 100)}%`,
                backgroundColor: primaryColor,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{levelInfo.current?.name}</span>
            <span>{levelInfo.next?.name} ({levelInfo.next?.min_xp} XP)</span>
          </div>
        </div>
      )}

      {/* Recompensas disponibles */}
      {rewards && rewards.length > 0 && (
        <div className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">🎁 Recompensas disponibles</h4>
          <div className="space-y-2">
            {rewards.map((reward: any) => (
              <div 
                key={reward.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div>
                  <div className="font-medium text-green-700">{reward.reward_description}</div>
                  <div className="text-xs text-green-600">
                    {reward.reward_type === "discount_percent" && `${reward.reward_value}% de descuento`}
                    {reward.reward_type === "discount_fixed" && `€${reward.reward_value} de descuento`}
                    {reward.reward_type === "free_service" && "Servicio gratis"}
                    {reward.reward_type === "gift" && "Regalo especial"}
                  </div>
                </div>
                <span className="text-green-500 text-xl">🎁</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 divide-x border-t">
        <div className="p-3 text-center">
          <div className="text-lg font-bold" style={{ color: primaryColor }}>
            {client.total_visits || 0}
          </div>
          <div className="text-xs text-gray-500">Visitas</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold" style={{ color: primaryColor }}>
            €{client.total_spent || 0}
          </div>
          <div className="text-xs text-gray-500">Gastado</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-lg font-bold" style={{ color: primaryColor }}>
            {client.current_level}
          </div>
          <div className="text-xs text-gray-500">Nivel</div>
        </div>
      </div>
    </div>
  );
}



