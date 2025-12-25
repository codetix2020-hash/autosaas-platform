import { Document } from "@shared/components/Document";
import type { PropsWithChildren } from "react";

export default async function PublicLayout({
  children,
}: PropsWithChildren) {
  return (
    <Document locale="es">
      {children}
    </Document>
  );
}
