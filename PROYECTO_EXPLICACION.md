# 📋 Documentación del Proyecto - Supastarter con Gestor de Reservas

## 🎯 ¿Qué es este proyecto?

Este proyecto está basado en **Supastarter**, un starter kit para aplicaciones SaaS escalables construido con Next.js. Sobre esta base, se ha implementado un **Sistema de Gestión de Reservas para Peluquerías y Salones de Belleza** llamado **ReservasPro**.

### Características principales:

- **Multi-tenant SaaS**: Permite gestionar múltiples organizaciones (peluquerías) desde una sola aplicación
- **Sistema de autenticación completo**: Usa Better Auth con soporte para email/password, OAuth, passkeys, etc.
- **Gestión de organizaciones**: Cada usuario puede pertenecer a múltiples organizaciones con diferentes roles
- **Módulo de reservas**: Sistema completo para gestionar citas, servicios, profesionales y clientes
- **Programa de fidelización**: Sistema de niveles y puntos XP para recompensar a los clientes
- **Página pública de reservas**: Los clientes pueden reservar citas sin necesidad de registro inicial

---

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

- **Frontend**: Next.js 16 (App Router) + React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Better Auth
- **Base de datos**: PostgreSQL (via Prisma ORM + Supabase)
- **Email**: Resend
- **Pagos**: Integración con sistema de pagos (opcional)
- **Monorepo**: pnpm workspaces + Turborepo

### Estructura del Proyecto

```
supastarter-nextjs/
├── apps/web/                    # Aplicación principal Next.js
│   ├── app/                     # Rutas de Next.js App Router
│   │   ├── (public)/            # Rutas públicas
│   │   │   └── reservas/[slug]/ # Página pública de reservas por peluquería
│   │   ├── (saas)/              # Rutas del área SaaS
│   │   │   └── app/
│   │   │       ├── peluquerias/ # Gestión de peluquerías (nuevo)
│   │   │       └── (organizations)/
│   │   │           └── [organizationSlug]/
│   │   │               └── reservas/ # Panel de administración de reservas
│   │   └── api/                 # API Routes
│   │       ├── peluquerias/     # API para gestionar peluquerías
│   │       └── public/reservas/ # API pública para reservas
│   ├── modules/                 # Módulos compartidos
│   └── src/                     # Componentes y lógica compartida
├── packages/                    # Paquetes compartidos del monorepo
│   ├── auth/                    # Configuración de Better Auth
│   ├── database/                # Schema de Prisma
│   ├── api/                     # API compartida
│   └── ...
└── auto-saas/                   # Sistema de generación automática de módulos
    └── blueprints/
        └── reservas-peluqueria.json # Blueprint del módulo de reservas
```

---

## 🎨 Funcionalidades del Sistema de Reservas

### 1. **Gestión de Peluquerías (Multi-tenant)**

**Ruta**: `/app/peluquerias`

- ✅ Listado de todas las peluquerías (organizaciones) del sistema
- ✅ Creación de nuevas peluquerías con:
  - Nombre del negocio
  - Slug personalizado (URL única)
  - Generación automática de datos por defecto:
    - Niveles de fidelización (Bronce, Plata, Oro, Platino, VIP)
    - Servicio por defecto ("Corte de cabello")

**API**: `/api/peluquerias`
- `GET`: Lista todas las peluquerías
- `POST`: Crea una nueva peluquería

### 2. **Panel de Administración de Reservas**

**Ruta**: `/app/[organizationSlug]/reservas`

#### Dashboard Principal (`/reservas`)
- Vista de todas las reservas con filtros por estado
- Búsqueda de reservas
- Acciones rápidas: completar, cancelar, confirmar

#### Gestión de Servicios (`/reservas/servicios`)
- CRUD completo de servicios
- Configuración de precio, duración, color, XP otorgado
- Activación/desactivación de servicios

#### Gestión de Profesionales (`/reservas/profesionales`)
- CRUD de profesionales
- Asignación de especialidades
- Avatar y datos de contacto
- Gestión de horarios de trabajo

#### Gestión de Clientes (`/reservas/clientes`)
- Base de datos de clientes
- Historial de visitas
- Puntos XP y nivel de fidelización
- Notas y preferencias

#### Configuración (`/reservas/configuracion`)
- Configuración general del negocio
- Horarios de trabajo
- Información de contacto
- Redes sociales
- Personalización de colores

#### Programa de Fidelización (`/reservas/fidelizacion`)
- Gestión de niveles de fidelización
- Configuración de recompensas por nivel
- Visualización de clientes por nivel

### 3. **Página Pública de Reservas**

**Ruta**: `/reservas/[slug]`

Los clientes pueden:
- ✅ Ver información del negocio
- ✅ Seleccionar un servicio
- ✅ Elegir un profesional
- ✅ Seleccionar fecha y hora disponible
- ✅ Completar sus datos (nombre, email, teléfono)
- ✅ Confirmar la reserva
- ✅ Recibir email de confirmación

**Características**:
- Diseño responsive y moderno
- Disponibilidad en tiempo real
- Validación de horarios disponibles
- Autenticación opcional (pueden reservar sin cuenta)
- Sistema de temas personalizable por peluquería

### 4. **Sistema de Fidelización**

- **Puntos XP**: Los clientes ganan XP al completar servicios
- **Niveles**: 5 niveles predefinidos (Bronce → Plata → Oro → Platino → VIP)
- **Recompensas**: Descuentos, servicios gratis, regalos según el nivel
- **Progreso visual**: Los clientes pueden ver su progreso y próximas recompensas

### 5. **Notificaciones por Email**

- ✅ Email de confirmación cuando se crea una reserva
- ✅ Email al completar una reserva (con XP ganado)
- ✅ Personalizable con la información del negocio

---

## 💾 Base de Datos

### Tablas principales del sistema de reservas:

1. **business_config**: Configuración de cada peluquería
   - `organization_id`, `business_name`, `slug`, `logo_url`
   - Colores personalizados, horarios, contacto

2. **services**: Servicios ofrecidos
   - Nombre, descripción, duración, precio, color, XP otorgado

3. **professionals**: Profesionales de la peluquería
   - Nombre, contacto, especialidades, avatar

4. **clients**: Base de datos de clientes
   - Datos de contacto, historial de visitas, XP total

5. **bookings**: Reservas/Citas
   - Cliente, profesional, servicio, fecha/hora, estado, precio

6. **loyalty_levels**: Niveles de fidelización
   - Nombre, XP mínimo, recompensa, color, icono

7. **loyalty_points**: Puntos XP de cada cliente
   - Cliente, XP total, nivel actual

---

## 🔄 Flujo de Trabajo

### Para el Administrador:

1. **Crear Peluquería**: `/app/peluquerias` → Crear nueva
2. **Configurar Negocio**: `/app/[slug]/reservas/configuracion`
3. **Agregar Servicios**: `/app/[slug]/reservas/servicios`
4. **Agregar Profesionales**: `/app/[slug]/reservas/profesionales`
5. **Gestionar Reservas**: `/app/[slug]/reservas`
6. **Ver Clientes y Fidelización**: `/app/[slug]/reservas/clientes`

### Para el Cliente:

1. Visita: `/reservas/[slug]` (página pública)
2. Selecciona servicio y profesional
3. Elige fecha/hora disponible
4. Completa datos
5. Confirma reserva
6. Recibe email de confirmación
7. Acude a la cita
8. Admin marca como "completada" → Cliente gana XP
9. Cliente sube de nivel según XP acumulado

---

## 🚀 Estado Actual del Proyecto

### ✅ Implementado y Funcionando:

- ✅ Sistema multi-tenant de peluquerías
- ✅ Creación y gestión de peluquerías
- ✅ Panel de administración completo de reservas
- ✅ Página pública de reservas
- ✅ Sistema de fidelización con XP y niveles
- ✅ Gestión de servicios, profesionales y clientes
- ✅ Notificaciones por email
- ✅ Búsqueda por slug o organization_id (retrocompatibilidad)

### ⚠️ Pendiente de Mejoras:

1. **Integración con Organization de Better Auth**:
   - Actualmente las peluquerías se crean solo en `business_config`
   - Deberían también crearse en la tabla `organization` de Better Auth
   - Esto permitiría usar `getActiveOrganization()` correctamente

2. **Autenticación de clientes**:
   - Sistema de login/registro para clientes implementado pero puede mejorarse
   - Perfil del cliente para ver su historial y puntos

3. **Calendario visual**:
   - Vista de calendario para administradores
   - Disponibilidad visual de horarios

4. **Reportes y estadísticas**:
   - Dashboard con métricas
   - Estadísticas de servicios más solicitados
   - Análisis de clientes frecuentes

5. **Recordatorios automáticos**:
   - Email de recordatorio 24h antes de la cita
   - SMS de confirmación (opcional)

---

## 🔧 Configuración y Variables de Entorno

### Variables necesarias:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Database
DATABASE_URL=...

# Email (Resend)
RESEND_API_KEY=...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=...
```

---

## 📝 Próximos Pasos Recomendados

1. **Corregir creación de organizaciones**: Modificar `/api/peluquerias` para crear también la entrada en `organization` de Better Auth

2. **Sincronización de slugs**: Asegurar que el `slug` esté sincronizado entre `organization.slug` y `business_config.slug`

3. **Migración de datos existentes**: Actualizar peluquerías antiguas para que tengan slug correcto (ej: Codetix → "codetix")

4. **Testing**: Agregar tests unitarios e integración

5. **Documentación API**: Documentar todas las API endpoints

6. **Optimizaciones**: 
   - Cache de consultas frecuentes
   - Optimización de imágenes
   - Lazy loading de componentes

---

## 🎓 Conceptos Clave para Entender el Proyecto

### Multi-tenant:
Cada peluquería es una "organización" independiente con su propia configuración, servicios, profesionales y clientes. Todo está aislado por `organization_id`.

### Slug:
Identificador único en la URL. Ejemplo: `/reservas/barberia-el-corte` donde "barberia-el-corte" es el slug.

### XP (Puntos de Experiencia):
Sistema de gamificación donde los clientes ganan puntos al completar servicios. Estos puntos determinan su nivel de fidelización.

### Better Auth:
Sistema de autenticación completo que maneja usuarios, sesiones, organizaciones, invitaciones, etc.

---

## 📞 Contacto y Soporte

Para más información sobre Supastarter:
- 📘 [Documentación](https://supastarter.dev/docs/nextjs)
- 🚀 [Demo](https://demo.supastarter.dev)

---

**Última actualización**: Diciembre 2024
**Versión del proyecto**: Supastarter Next.js + ReservasPro

