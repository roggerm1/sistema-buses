# SistemaBuses

> Sistema de reservas de autobuses — proyecto universitario 

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Modelos de Base de Datos](#modelos-de-base-de-datos)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Datos de Prueba](#datos-de-prueba)
- [Comandos Útiles](#comandos-útiles)
- [Roadmap de Fases](#roadmap-de-fases)

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21 (standalone components, signals) |
| UI Library | PrimeNG con tema Aura |
| Backend | Node.js + Express + TypeScript |
| Base de Datos | MongoDB 7.x + Mongoose |
| Autenticación | JWT (httpOnly cookie + Authorization header) |


## Arquitectura

Monorepo con dos aplicaciones independientes:

```
SistemaBuses/
├── backend/    → API REST (Express + TypeScript)
└── frontend/   → SPA (Angular 21)
```

**Backend:** Routes → Controllers → Services → Models (Mongoose)

**Frontend:** Standalone components, signals, lazy loading, OnPush change detection, PrimeNG


## Estructura del Proyecto

```
SistemaBuses/
├── backend/
│   └── src/
│       ├── config/          # Conexión DB, variables de entorno
│       ├── controllers/     # Controladores (thin)
│       ├── middleware/       # Auth, validación, error handler
│       ├── models/          # Esquemas Mongoose
│       ├── routes/          # Definición de rutas Express
│       ├── seeds/           # Script de datos iniciales
│       ├── services/        # Lógica de negocio
│       ├── types/           # Interfaces TypeScript
│       └── app.ts           # Entry point
├── frontend/
│   └── src/
│       └── app/
│           ├── core/
│           │   ├── guards/       # Auth, Admin, Passenger guards
│           │   ├── interceptors/ # JWT interceptor
│           │   ├── models/       # Interfaces de dominio
│           │   └── services/     # Auth, Bus, Ruta, Viaje, Reserva
│           ├── features/
│           │   ├── admin/        # Buses, Rutas, Viajes (CRUD)
│           │   ├── auth/         # Login, Register, Access Denied
│           │   └── passenger/    # Home (búsqueda), My Trips
│           └── shared/
│               └── layout/       # Header, sidebar, layout

```

## API Endpoints

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Auth | Rol |
|--------|------|-------------|------|-----|
| POST | `/api/auth/register` | Registrar usuario | No | Público |
| POST | `/api/auth/login` | Iniciar sesión | No | Público |
| POST | `/api/auth/logout` | Cerrar sesión | No | Público |
| GET | `/api/auth/me` | Obtener usuario actual | Sí | Cualquiera |
| PATCH | `/api/auth/users/:id/role` | Cambiar rol de usuario | Sí | Admin |

### Buses (`/api/buses`)

| Método | Ruta | Descripción | Auth | Rol |
|--------|------|-------------|------|-----|
| GET | `/api/buses` | Listar todos los buses | Sí | Admin |
| POST | `/api/buses` | Crear bus (genera asientos) | Sí | Admin |
| GET | `/api/buses/:id` | Obtener bus por ID | Sí | Admin |
| PUT | `/api/buses/:id` | Actualizar bus | Sí | Admin |
| DELETE | `/api/buses/:id` | Eliminar bus | Sí | Admin |

### Rutas (`/api/rutas`)

| Método | Ruta | Descripción | Auth | Rol |
|--------|------|-------------|------|-----|
| GET | `/api/rutas` | Listar todas las rutas | Sí | Cualquiera |
| POST | `/api/rutas` | Crear ruta | Sí | Admin |
| GET | `/api/rutas/:id` | Obtener ruta por ID | Sí | Cualquiera |
| PUT | `/api/rutas/:id` | Actualizar ruta | Sí | Admin |
| DELETE | `/api/rutas/:id` | Eliminar ruta | Sí | Admin |

### Viajes (`/api/viajes`)

| Método | Ruta | Descripción | Auth | Rol |
|--------|------|-------------|------|-----|
| GET | `/api/viajes` | Listar todos los viajes | Sí | Admin |
| POST | `/api/viajes` | Crear viaje | Sí | Admin |
| GET | `/api/viajes/:id` | Obtener viaje por ID | Sí | Admin |
| PUT | `/api/viajes/:id` | Actualizar viaje | Sí | Admin |
| DELETE | `/api/viajes/:id` | Eliminar viaje | Sí | Admin |
| GET | `/api/viajes/buscar` | Buscar viajes (origen/destino/fecha) | Sí | Pasajero |
| GET | `/api/viajes/:id/asientos` | Mapa de asientos del viaje | Sí | Pasajero |
| GET | `/api/viajes/mis-viajes` | Historial de viajes del usuario | Sí | Pasajero |

### Reservas (`/api/reservas`)

| Método | Ruta | Descripción | Auth | Rol |
|--------|------|-------------|------|-----|
| POST | `/api/reservas` | Crear reserva (transaccional) | Sí | Pasajero |
| DELETE | `/api/reservas/:id` | Cancelar reserva | Sí | Pasajero |

### Reservas por Viaje (`/api/viajes/:id/reservas`)

| Método | Ruta | Descripción | Auth | Rol |
|--------|------|-------------|------|-----|
| GET | `/api/viajes/:id/reservas` | Ver reservas del viaje | Sí | Admin |

**Total: 26 endpoints**

## Modelos de Base de Datos

### `users`

| Campo | Tipo | Validación |
|-------|------|-----------|
| `nombres` | String | Requerido |
| `apellidos` | String | Requerido |
| `correo` | String | Requerido, único, email |
| `clave` | String | Requerido, hash bcrypt |
| `tipoUsuario` | String | `"Admin"` \| `"Pasajero"` (default) |

**Índice:** `correo` (unique)

### `buses`

| Campo | Tipo | Validación |
|-------|------|-----------|
| `numeroPlaca` | String | Requerido, único, uppercase |
| `nombre` | String | Requerido |
| `capacidad` | Number | Requerido, 1–15 |
| `disponible` | Boolean | Default: `true` |
| `asientos[]` | Embedded | `{ numeroAsiento: Number }` — auto-generados |

**Índice:** `numeroPlaca` (unique)

### `rutas`

| Campo | Tipo | Validación |
|-------|------|-----------|
| `origen` | String | Requerido |
| `destino` | String | Requerido |

**Índice:** `{ origen, destino }` (unique compound)

### `viajes`

| Campo | Tipo | Validación |
|-------|------|-----------|
| `idBus` | ObjectId | Ref: Bus |
| `idRuta` | ObjectId | Ref: Ruta |
| `busNombre` | String | Denormalizado |
| `busPlaca` | String | Denormalizado |
| `rutaOrigen` | String | Denormalizado |
| `rutaDestino` | String | Denormalizado |
| `fechaSalida` | Date | Requerido |
| `horaSalida` | String | Requerido (HH:MM) |
| `fechaLlegada` | Date | Requerido |
| `horaLlegada` | String | Requerido (HH:MM) |
| `precio` | Number | Requerido, min: 0 |
| `totalAsientos` | Number | Computado |
| `asientosReservados` | Number | Computado, default: 0 |
| `asientosDisponibles` | Number | Computado |
| `completo` | Boolean | Computado, default: `false` |

**Índices:** `{ idRuta, fechaSalida, horaSalida }` (unique), `{ rutaOrigen, rutaDestino, fechaSalida }` (búsqueda)

### `reservas`

| Campo | Tipo | Validación |
|-------|------|-----------|
| `idViaje` | ObjectId | Ref: Viaje |
| `idPasajero` | ObjectId | Ref: User |
| `asientosReservados` | Number | Requerido |
| `montoTotal` | Number | Requerido |
| `detalles[]` | Embedded | `{ numeroAsiento: Number }` |
| `rutaOrigen` | String | Denormalizado |
| `rutaDestino` | String | Denormalizado |
| `fechaSalida` | Date | Denormalizado |
| `horaSalida` | String | Denormalizado |
| `busNombre` | String | Denormalizado |
| `precioUnitario` | Number | Denormalizado |

**Índices:** `{ idViaje }`, `{ idPasajero }`

## Flujo de Autenticación

```
1. Login → Backend genera JWT → Set httpOnly cookie + token en response body
2. Frontend guarda token en localStorage (backup)
3. Interceptor HTTP:
   ├── withCredentials: true (envía cookie automáticamente)
   └── Header: Authorization: Bearer <token>
4. Backend middleware:
   ├── Extrae token del header Authorization (prioridad)
   └── Fallback: lee token de cookie
5. Token expirado → Interceptor atrapa 401 → Limpia sesión → Redirect /login
```


### Usuarios

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Admin | test@test.com | 123456 |
| Pasajero | bernardo@gmail.com | Decima93 |

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar backend + frontend simultáneamente |
| `npm run db:up` | Levantar MongoDB (replica set) |
| `npm run db:down` | Detener MongoDB |
| `npm run db:seed` | Cargar datos iniciales |
| `npm run build` | Build de producción (backend + frontend) |
| `cd backend && npm run dev` | Iniciar solo backend (puerto 3000) |
| `cd frontend && ng serve` | Iniciar solo frontend (puerto 4200) |

## Roadmap de Fases

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Environment Setup | Completada |
| 1 | Backend Foundation | Completada |
| 2 | Auth API | Completada |
| 3 | Buses CRUD | Completada |
| 4 | Rutas CRUD | Completada |
| 5 | Viajes CRUD | Completada |
| 6 | Reservas API | Completada |
| 7 | Seed Data | Completada |
| 8 | Angular Foundation | Completada |
| 9 | Auth UI | Completada |
| 10 | Buses UI | Completada |
| 11 | Rutas UI | Completada |
| 12 | Viajes UI | Completada |
| 13 | Trip Search UI | Completada |
| 14 | Seat Selection UI | Completada |
| 15 | My Trips UI | Completada |
| 16 | Polish | Completada |
| 17 | Integration Testing | Completada |
| 18 | Reservation Cancellation | Completada |
| 19 | Admin Reservation View | Completada |

