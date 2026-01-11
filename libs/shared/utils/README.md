# @shared/utils

Librería compartida de utilidades reutilizables para toda la plataforma.

## Descripción

Esta librería contiene funciones utilitarias generales que se usan en múltiples microservicios, incluyendo manipulación de strings, validación, manejo de fechas, criptografía, y más.

## Módulos

### Criptografía (`crypto.utils.ts`)
- `hashSha256(data)` - Hash SHA256
- `hashPassword(password)` - Hash bcrypt
- `comparePassword(password, hash)` - Comparar contraseña
- `generateRandomToken(length)` - Token aleatorio
- `generateNumericCode(length)` - Código numérico
- `encryptAes256(data, key)` - Encripción AES-256
- `decryptAes256(encrypted, key)` - Desencripción AES-256
- `generateUUID()` - Generar UUID v4

### Validación (`validation.utils.ts`)
- `isValidEmail(email)` - Valida email
- `isStrongPassword(password)` - Valida contraseña fuerte
- `isValidPhone(phone)` - Valida teléfono
- `isValidUrl(url)` - Valida URL
- `isValidUUID(uuid)` - Valida UUID
- `isValidNumber(value)` - Valida número
- `isNotEmpty(value)` - Valida string no vacío
- `hasRequiredFields(obj, fields)` - Valida campos requeridos
- `isInRange(value, min, max)` - Valida rango
- `isValidISODate(dateString)` - Valida ISO date
- `matchesPattern(value, pattern)` - Valida patrón regex

### Fechas (`date.utils.ts`)
- `getNowISO()` - Fecha actual ISO
- `toISOString(date)` - Convertir a ISO
- `addDays(date, days)` - Sumar días
- `addHours(date, hours)` - Sumar horas
- `addMinutes(date, minutes)` - Sumar minutos
- `daysBetween(date1, date2)` - Diferencia en días
- `hoursBetween(date1, date2)` - Diferencia en horas
- `minutesBetween(date1, date2)` - Diferencia en minutos
- `isPast(date)` - Está en el pasado
- `isFuture(date)` - Está en el futuro
- `isToday(date)` - Es hoy
- `startOfDay(date)` - Inicio del día
- `endOfDay(date)` - Final del día
- `formatDate(date, format)` - Formatear fecha

### Strings (`string.utils.ts`)
- `toUpperCase(str)` - A mayúsculas
- `toLowerCase(str)` - A minúsculas
- `capitalize(str)` - Capitalizar
- `titleCase(str)` - Title Case
- `slugify(str)` - Crear slug
- `truncate(str, maxLength)` - Truncar
- `repeat(str, times)` - Repetir
- `reverse(str)` - Invertir
- `trim(str)` - Remover espacios
- `removeWhitespace(str)` - Remover todos espacios
- `normalizeSpaces(str)` - Normalizar espacios
- `chunk(str, size)` - Dividir en chunks
- `includes(str, substring)` - Contiene substring
- `camelCase(str)` - camelCase
- `snakeCase(str)` - snake_case
- `kebabCase(str)` - kebab-case

### Objetos (`object.utils.ts`)
- `isObject(value)` - Valida si es objeto
- `getKeys(obj)` - Obtiene claves
- `getValues(obj)` - Obtiene valores
- `getEntries(obj)` - Obtiene key-value pairs
- `shallowClone(obj)` - Copia superficial
- `deepClone(obj)` - Copia profunda
- `merge(obj1, obj2)` - Fusionar objetos
- `deepMerge(objects)` - Fusionar profundamente
- `omit(obj, keys)` - Omitir propiedades
- `pick(obj, keys)` - Seleccionar propiedades
- `flatten(obj)` - Aplanar objeto anidado
- `deepEqual(obj1, obj2)` - Comparar objetos
- `isEmpty(obj)` - Verificar si está vacío

### Arrays (`array.utils.ts`)
- `isArray(value)` - Valida si es array
- `first(arr)` - Primer elemento
- `last(arr)` - Último elemento
- `unique(arr)` - Elementos únicos
- `uniqueBy(arr, key)` - Únicos por propiedad
- `flatten(arr)` - Aplanar array anidado
- `chunk(arr, size)` - Dividir en chunks
- `shuffle(arr)` - Barajar (Fisher-Yates)
- `reverse(arr)` - Invertir
- `intersection(arr1, arr2)` - Elementos en común
- `difference(arr1, arr2)` - Diferencia
- `groupBy(arr, key)` - Agrupar
- `sortBy(arr, key)` - Ordenar
- `find(arr, predicate)` - Buscar
- `some(arr, predicate)` - Alguno cumple
- `every(arr, predicate)` - Todos cumplen
- `sum(arr)` - Sumar
- `average(arr)` - Promedio
- `max(arr)` - Máximo
- `min(arr)` - Mínimo
- `isEmpty(arr)` - Verificar si está vacío

### Paginación (`pagination.utils.ts`)
- `calculatePagination(total, page, pageSize)` - Calcula parámetros
- `createPaginatedResponse(data, total)` - Crea respuesta paginada
- `paginateArray(arr, page, pageSize)` - Pagina un array

## Uso

```typescript
import {
  hashPassword,
  isValidEmail,
  slugify,
  unique,
  calculatePagination,
  deepClone,
} from '@shared/utils';

// Validar email
if (!isValidEmail(user.email)) {
  throw new Error('Invalid email');
}

// Hashear contraseña
const hash = await hashPassword(password);

// Crear slug
const slug = slugify('My Article Title');

// Array utilities
const uniqueIds = unique([1, 2, 2, 3, 3, 3]); // [1, 2, 3]

// Paginación
const { skip, take } = calculatePagination(100, 1, 10);

// Copiar objeto
const copy = deepClone(original);
```

## Instalación

Usa el path alias en `tsconfig.base.json`:

```json
"@shared/utils": ["libs/shared/utils/src/index.ts"]
```

## Desarrollo

```bash
# Compilar
pnpm nx build shared-utils

# Ejecutar tests
pnpm nx test shared-utils

# Lint
pnpm nx lint shared-utils
```

## Testing

La librería incluye tests unitarios para todas las funciones principales. Ejecuta:

```bash
pnpm nx test shared-utils
```

## Performance

Todas las funciones están optimizadas para máximo rendimiento:
- Arrays y objetos se copian solo cuando es necesario
- Algoritmos eficientes (ej: Fisher-Yates para shuffle)
- Evita recursión innecesaria en funciones críticas

## Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) para historial de cambios.
