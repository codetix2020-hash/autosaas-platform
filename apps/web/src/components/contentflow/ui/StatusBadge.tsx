'use client';

import { cn } from '@/lib/utils';
import type { ContentStatus } from '@/types/contentflow-ai';

const statusConfig: Record<ContentStatus, { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
  pending_approval: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Aprobado', className: 'bg-green-100 text-green-800' },
  scheduled: { label: 'Programado', className: 'bg-blue-100 text-blue-800' },
  published: { label: 'Publicado', className: 'bg-purple-100 text-purple-800' },
  rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-800' },
};

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}

