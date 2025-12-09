# Cómo obtener el organization_id

## Método 1: Desde la consola del navegador

1. Abre la página de servicios: `/app/[organizationSlug]/reservas/servicios`
2. Abre la consola del navegador (F12)
3. Ejecuta este código:

```javascript
// Obtener el organization_id desde la sesión
const session = await fetch('/api/auth/session').then(r => r.json());
console.log('Organization ID:', session?.session?.activeOrganizationId);

// O desde el contexto de React (si estás en la página)
// Abre React DevTools y busca ActiveOrganizationContext
```

## Método 2: Desde la URL

El `organizationSlug` en la URL es el slug de la organización. Para obtener el ID:

1. Ve a: `/app/[organizationSlug]/reservas/servicios`
2. El `organizationSlug` es el valor en la URL
3. Usa ese slug en la página pública: `/reservas/[organizationSlug]`

**Nota:** Actualmente la API pública usa el slug directamente como organization_id. Si necesitas el ID real, puedes:

- Modificar la API para buscar por slug primero
- O usar el slug directamente (que es lo que hace ahora)

## Método 3: Consultar Supabase directamente

Si tienes acceso a Supabase:

```sql
-- Ver organization_ids en services
SELECT DISTINCT organization_id 
FROM services 
LIMIT 10;

-- Ver todas las organizaciones
SELECT id, name, slug 
FROM organization 
ORDER BY created_at DESC;
```

## Método 4: Desde el código (temporal)

Agrega esto temporalmente en cualquier página de reservas:

```tsx
"use client";

import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";

export default function DebugPage() {
  const { activeOrganization } = useActiveOrganization();
  
  return (
    <div className="p-8">
      <h1>Organization Info</h1>
      <pre>{JSON.stringify(activeOrganization, null, 2)}</pre>
      <p>Organization ID: {activeOrganization?.id}</p>
      <p>Organization Slug: {activeOrganization?.slug}</p>
    </div>
  );
}
```

