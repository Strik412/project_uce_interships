# @shared/types

Librería compartida de tipos e interfaces TypeScript para toda la plataforma de prácticas profesionales.

## Descripción

Esta librería contiene todas las definiciones de tipos, interfaces, enumeraciones y clases de excepción que se utilizan en toda la plataforma. Proporciona un contrato común entre todos los microservicios.

## Módulos

### Enumeraciones (`enum.types.ts`)
- `UserRole` - Roles de usuarios (admin, coordinator, supervisor, student, company)
- `PracticeStatus` - Estados de prácticas profesionales
- `ValidationStatus` - Estados de validación de documentos
- `CommunicationType` - Tipos de comunicación
- `NotificationChannel` - Canales de notificación
- `Priority` - Niveles de prioridad

### Tipos de Usuario (`user.types.ts`)
- `JwtPayload` - Payload para JWT tokens
- `LoginCredentials` - Credenciales de login
- `AuthResponse` - Respuesta de autenticación
- `UserProfile` - Perfil de usuario
- `RegisterData` - Datos de registro
- `TwoFactorSetup` / `TwoFactorVerify` - Autenticación de 2 factores

### Tipos de Prácticas (`practice.types.ts`)
- `Practice` - Entidad de práctica profesional
- `PracticeDocument` - Documentos de prácticas
- `PracticeEvaluation` - Evaluaciones de prácticas
- `PracticeProgress` - Progreso de prácticas
- `PracticeReport` - Reportes de prácticas

### Tipos de API (`api.types.ts`)
- `ApiResponse<T>` - Respuesta genérica de API
- `PaginatedResponse<T>` - Respuestas paginadas
- `HttpException` - Excepciones HTTP base
- Excepciones específicas: `ValidationException`, `AuthenticationException`, `NotFoundException`, etc.

## Uso

```typescript
import {
  UserRole,
  PracticeStatus,
  UserProfile,
  Practice,
  ApiResponse,
  NotFoundException
} from '@shared/types';

// Usar enumeraciones
const role: UserRole = UserRole.STUDENT;

// Usar interfaces
const user: UserProfile = {
  id: '123',
  email: 'user@example.com',
  firstName: 'Juan',
  lastName: 'Perez',
  roles: [UserRole.STUDENT],
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

// Usar excepciones
throw new NotFoundException('Practice', 'prc-123');
```

## Instalación

Esta librería está configurada como parte del monorepo. Usa el path alias en `tsconfig.base.json`:

```json
"@shared/types": ["libs/shared/types/src/index.ts"]
```

## Desarrollo

```bash
# Compilar
pnpm nx build shared-types

# Ejecutar tests
pnpm nx test shared-types

# Lint
pnpm nx lint shared-types
```

## Versionamiento

Sigue [Conventional Commits](https://www.conventionalcommits.org/) para cambios.

## Notas

- Todos los tipos deben ser inmutables cuando sea posible
- Use interfaces en lugar de tipos para definiciones de clases
- Mantenga los tipos lo más simple y específico posible
- Documente todos los tipos con JSDoc comentarios
