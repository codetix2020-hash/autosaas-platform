'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClass = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size];

  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClass, className)} />
  );
}

export function LoadingState({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

