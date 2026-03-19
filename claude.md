@AGENTS.md
# SIGPAC USS — Sistema de Gestión de Pacientes Clínicos

Sistema web para la facultad de odontología de la Universidad San Sebastián (Chile).
Permite a estudiantes encontrar y gestionar pacientes para cumplir requisitos clínicos.

## Stack

- **Framework:** Next.js 16.2 App Router + TypeScript
- **Base de datos:** PostgreSQL en Neon (serverless) via Prisma ORM
- **Auth:** NextAuth.js v5 — Microsoft OAuth (Azure AD, tenant: `common`)
- **Estilos:** Tailwind CSS
- **Emails:** Resend
- **Deploy:** Vercel + Vercel Cron

## Estructura del proyecto

```
/app
  /(public)/registro     → formulario de registro para pacientes (sin auth)
  /(auth)/pacientes      → lista filtrable de pacientes disponibles (estudiante)
  /(auth)/mi-paciente    → paciente actual asignado + timer + acciones (estudiante)
  /(auth)/admin          → panel de gestión y estadísticas (docente/dirección)
  /api/auth/[...nextauth]
  /api/cron/check-expirations  → libera asignaciones vencidas
  /api/pacientes/
  /api/asignaciones/
/prisma
  schema.prisma
/lib
  auth.ts        → config NextAuth
  db.ts          → cliente Prisma
  mail.ts        → funciones Resend
/docs
  arquitectura.md
  requisitos.md
```

## Roles y acceso

| Rol | Auth | Acceso |
|---|---|---|
| Paciente | Sin login | Solo formulario público `/registro` |
| Estudiante | Microsoft OAuth | `/pacientes`, `/mi-paciente` |
| Docente | Microsoft OAuth | Todo lo anterior + `/admin` |

## Autenticación — reglas críticas

En vez de Microsoft OAuth usaremos magic links via NextAuth Email 
provider + Resend. El flujo es:
1. Alumno ingresa email en /login
2. Validar que termine en @correo.uss.cl, si no → error
3. Cruzar con tabla Alumno → si no existe → error claro
4. Si pasa ambas validaciones → enviar magic link con Resend
5. Alumno hace clic → sesión activa con rol y sede desde tabla Alumno

## Modelo de datos

```prisma
model Paciente {
  id               String         @id @default(cuid())
  nombre           String
  rut              String         @unique
  telefono         String
  email            String?
  edad             Int
  comuna           String
  motivoConsulta   String
  disponibilidad   Json           // { lunes: ["am","pm"], martes: ["am"], ... }
  sedePreferencia  Sede
  estado           EstadoPaciente @default(DISPONIBLE)
  asignaciones     Asignacion[]
  creadoEn         DateTime       @default(now())
  actualizadoEn    DateTime       @updatedAt
}

model Alumno {
  id           String       @id @default(cuid())
  email        String       @unique
  nombre       String
  sede         Sede
  año          Int
  rol          Rol          @default(ESTUDIANTE)
  requisitos   Json         // ["protesis_removible", "endodoncia", ...]
  asignaciones Asignacion[]
}

model Asignacion {
  id            String           @id @default(cuid())
  pacienteId    String
  alumnoId      String
  paciente      Paciente         @relation(fields: [pacienteId], references: [id])
  alumno        Alumno           @relation(fields: [alumnoId], references: [id])
  asignadoEn    DateTime         @default(now())
  expiraEn      DateTime         // asignadoEn + 24h
  estado        EstadoAsignacion @default(PENDIENTE)
  actualizadoEn DateTime         @updatedAt
}

enum EstadoPaciente {
  DISPONIBLE
  ASIGNADO
  EN_CONTACTO
  CITA_AGENDADA
  NO_RESPONDE
  ATENDIDO
}

enum EstadoAsignacion {
  PENDIENTE
  CONTACTADO
  CITA_AGENDADA
  NO_RESPONDE
}

enum Sede {
  SANTIAGO
  CONCEPCION
  VALDIVIA
  PATAGONIA
}

enum Rol {
  ESTUDIANTE
  DOCENTE
}
```

## Lógica de estados — crítica

1. Alumno se asigna paciente → `Paciente.estado = ASIGNADO`, `Asignacion.expiraEn = now + 24h`
2. Alumno no registra acción en 24h → cron libera: `Paciente.estado = DISPONIBLE`
3. Alumno marca NO_RESPONDE → esperar 48h → cron libera: `Paciente.estado = DISPONIBLE`
4. El cron corre en `/api/cron/check-expirations` cada hora via Vercel Cron

## Convenciones de código

- Server Components por defecto; Client Components solo con `"use client"` cuando hay interactividad
- Toda mutación de datos via Server Actions (no API routes para mutaciones)
- Validación con Zod en todos los formularios y server actions
- Errores siempre explícitos, nunca silenciosos
- Nunca hardcodear secrets — siempre `process.env.VARIABLE`
- Nombres en español para variables de dominio (paciente, alumno, sede), inglés para infraestructura

## Variables de entorno requeridas

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=common
RESEND_API_KEY=
CRON_SECRET=
```

## Comandos frecuentes

```bash
npm run dev                              # desarrollo local
npx prisma studio                        # explorar DB visualmente
npx prisma db push                       # aplicar cambios de schema sin migración
npx prisma migrate dev --name <nombre>   # migración con nombre
npx prisma db seed                       # cargar datos de prueba
```

## Archivos de referencia en /docs

- `@docs/arquitectura.md` — decisiones de diseño y justificaciones
- `@docs/requisitos.md`   — lista completa de requisitos clínicos válidos
- `@docs/seed-alumnos.md` — estructura del CSV de alumnos que provee dirección

## Workflow de desarrollo

1. Avanza un módulo a la vez y espera confirmación antes de continuar
2. Commitea cuando un módulo funciona end-to-end
3. Usa /clear al cambiar de módulo para no contaminar contexto
4. Ante errores: pega el error exacto, no lo describas
5. Para el cron: prueba localmente con expiración de 2 minutos antes de poner 24h