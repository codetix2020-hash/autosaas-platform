'use client';

import type { ContentPlatform } from '@/types/contentflow-ai';

const platformConfig: Record<ContentPlatform, { label: string; color: string; icon: string }> = {
  instagram: { label: 'Instagram', color: '#E4405F', icon: '📷' },
  facebook: { label: 'Facebook', color: '#1877F2', icon: '📘' },
  twitter: { label: 'Twitter/X', color: '#000000', icon: '🐦' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', icon: '💼' },
  tiktok: { label: 'TikTok', color: '#000000', icon: '🎵' },
  blog: { label: 'Blog', color: '#FF5722', icon: '📝' },
};

interface PlatformIconProps {
  platform: ContentPlatform;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlatformIcon({ platform, showLabel = false, size = 'md' }: PlatformIconProps) {
  const config = platformConfig[platform];
  const sizeClass = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }[size];

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClass}`}>
      <span>{config.icon}</span>
      {showLabel && <span className="text-gray-700">{config.label}</span>}
    </span>
  );
}

