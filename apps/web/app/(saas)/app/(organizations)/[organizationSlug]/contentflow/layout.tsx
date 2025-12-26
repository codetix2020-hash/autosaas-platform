import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ContentFlow AI',
  description: 'Gestiona el contenido de tus clientes con IA',
};

export default function ContentFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



