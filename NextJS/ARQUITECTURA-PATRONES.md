# Arquitectura y Patrones de Diseño

## Gestión de Trabajadores - Sistema NextJS

---

## 1. Visión General de la Arquitectura

El proyecto implementa una **arquitectura híbrida** que combina:

- **Feature-Based Architecture**: Organización del código por módulos de negocio
- **Scream Architecture (aka Ports & Adapters)**: Separación clara en capas

El framework base es **Next.js 16** (App Router), con una separación clara entre componentes reutilizables, lógica de negocio y rutas protegidas.

### Stack Tecnológico Principal

- **Framework**: Next.js 16.1.3 con App Router
- **Autenticación**: NextAuth.js v5 (beta)
- **Base de Datos**: Prisma ORM
- **UI**: Radix UI + TailwindCSS 4
- **Estado**: SWR para data fetching
- **Validación**: Zod + React Hook Form
- **PDF**: @react-pdf/renderer
- **Comunicación API**: REST (Django API + Nest API)

---

## 2. Estructura de Carpetas

```
src/
├── actions/                    # Server Actions
├── app/                       # App Router (Next.js 14+)
│   ├── (auth)/               # Grupo de rutas de autenticación
│   ├── (protected)/          # Grupo de rutas protegidas
│   │   └── dashboard/       # Módulo principal
│   │       ├── gestion-pasivos/
│   │       ├── gestion-trabajadores/
│   │       └── seguridad/
│   ├── api/                  # API Routes
│   └── types/                # Tipos compartidos
├── components/               # Componentes reutilizables
│   ├── ui/                   # Componentes base (shadcn/ui)
│   └── layout/               # Componentes de layout
├── hooks/                    # Custom Hooks
└── lib/                      # Utilidades y configuración
    └── types/                # Tipos de dominio
```

---

## 3. Patrones de Diseño Identificados

### 3.1 Component Composition Pattern

Los componentes UI están compuestos de partes más pequeñas siguiendo el patrón de Radix UI:

```typescript
// src/components/ui/table.tsx
function Table({ className, ...props }) { ... }
function TableHeader({ className, ...props }) { ... }
function TableBody({ className, ...props }) { ... }
function TableRow({ className, ...props }) { ... }
function TableHead({ className, ...props }) { ... }
function TableCell({ className, ...props }) { ... }
```

**Beneficios**: Componentes pequeños, testeables y reutilizables.

---

### 3.2 Variant Props Pattern (CVA)

Patrón implementado con `class-variance-authority` para variantes de componentes:

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva("inline-flex items-center justify-center...", {
  variants: {
    variant: {
      default: "bg-primary...",
      destructive: "bg-destructive...",
      outline: "border bg-background...",
      secondary: "bg-secondary...",
      ghost: "hover:bg-accent...",
      link: "text-primary underline-offset-4...",
    },
    size: {
      default: "h-9 px-4 py-2...",
      sm: "h-8 rounded-md...",
      lg: "h-10 rounded-md...",
      icon: "size-9",
    },
  },
});
```

---

### 3.3 Data Table Pattern (TanStack Table)

Implementación de tablas con ordenamiento, filtrado y paginación:

```typescript
// src/app/(protected)/dashboard/gestion-pasivos/components/pasive/tablePasive/columns.tsx
export const columns: ColumnDef<EmployeeData>[] = [
  {
    accessorKey: "cedulaidentidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cédula" />
    ),
  },
  {
    accessorKey: "nombres",
    header: "Nombres",
  },
  // ...
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => <DropdownMenu>...</DropdownMenu>,
  },
];
```

---

### 3.4 Server Actions Pattern

Uso de Server Actions para mutaciones de datos en el servidor:

```typescript
// src/app/(protected)/dashboard/gestion-pasivos/personal-jubilado/registrar/actions/registerEmployeesActions.ts
"use server";

export async function registerEmployee(values: z.infer<typeof schemaRac>, user_id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}employees_register/`,
      { method: "POST", body: JSON.stringify({ ...payload, usuario_id: user_id }) }
    );
    // ...
  }
}
```

---

### 3.5 Multi-Step Form Pattern (Formity)

Formularios multi-paso usando la librería `@formity/react`:

```typescript
// src/app/(protected)/dashboard/gestion-pasivos/personal-jubilado/registrar/forms/form-multi-steps.tsx
const schema: SchemaFormity<Values> = [
  { form: { values: () => ({}), render: ({ values, onNext }) => <FormBasicInfo /> } },
  { form: { values: () => ({}), render: ({ values, onNext }) => <FormAcademyLevel /> } },
  { form: { values: () => ({}), render: ({ values, onNext }) => <FormHealth /> } },
  // ...
  { return: (data) => data },
];
```

**Estructura de cada paso**:

- `values()`: Define el estado inicial del paso
- `render()`: Renderiza el componente del paso
- `onNext/onBack`: Navegación entre pasos

---

### 3.6 Repository Pattern (Data Fetching)

Funciones de utilidad para consumir APIs:

```typescript
// src/lib/utils.ts
export const apiFetchGet = async <T>(url: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}${url}`,
  );
  const getResponse: ApiResponse<T> = await response.json();
  return getResponse;
};
```

```typescript
// src/app/(protected)/dashboard/seguridad/api/getInfo.ts
export const getUserListPasiveSearch = async ({
  searchParams,
}): Promise<ApiResponse<UserSystem[]>> => {
  return await apiFetchGet<UserSystem[]>(`accounts/usuarios/?${searchParams}`);
};
```

---

### 3.7 Schema Validation Pattern (Zod)

Validación de datos con esquemas Zod tipados:

```typescript
// src/lib/zod.ts
export const signInSchema = object({
  identification: string({ required_error: "Email is required" })
    .min(6, "Minimo 6 digitos")
    .max(8, "Maximo 7 Digitos"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters"),
});
```

```typescript
// src/app/(protected)/dashboard/gestion-pasivos/personal-jubilado/registrar/schemas/schemaRac.ts
export const schemaRac = z.object({
  cedulaidentidad: z.string(),
  nombres: z.string(),
  fecha_nacimiento: z.date(),
  file: z.instanceof(File).nullable(),
  // ...
});
```

---

### 3.8 Controlled Form Pattern (React Hook Form)

Formularios controlados con validación:

```typescript
// src/components/form-login.tsx
export default function FormRegister() {
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identification: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    startTransition(async () => {
      const response = await loginAction(values);
      // ...
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="identification" render={({ field }) => (
          <FormItem>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </form>
    </Form>
  );
}
```

---

### 3.9 Layout Composition Pattern

Layouts anidados usando el App Router:

```typescript
// src/app/layout.tsx (Root Layout)
export default function RootLayout({ children }) {
  return <html lang="es"><body>{children}</body></html>;
}

// src/app/(auth)/layout.tsx (Auth Layout)

// src/app/(protected)/dashboard/layout.tsx (Protected Layout con SessionProvider)
export default async function ProtectedLayout({ children }) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

// src/app/(protected)/dashboard/gestion-pasivos/layout.tsx (Feature Layout)
```

---

### 3.10 JWT Session Pattern (NextAuth)

Gestión de sesión con tokens JWT:

```typescript
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 0.5 * 60 }, // 30 minutos
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
```

---

### 3.11 SWR Hook Pattern

Data fetching con cache y revalidación:

```typescript
// En columnas de tabla
const { data: profileBlob } = useSWR(
  employee.cedulaidentidad ? ["profile", employee.cedulaidentidad] : null,
  () => imageProfileFn(employee.cedulaidentidad),
);
```

---

### 3.12 Custom Hook Pattern

Hooks personalizados para lógica reutilizable:

```typescript
// src/hooks/use-mobile.ts
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

---

### 3.13 Utility Function Pattern (clsx + tailwind-merge)

Clase `cn()` para combinar clases de Tailwind:

```typescript
// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Uso en componentes
<Button className={cn("px-4", isActive && "bg-primary")} />
```

---

### 3.14 Page Layout Wrapper Pattern

Componente wrapper para páginas:

```typescript
// src/components/layout/page-layout.tsx
export default function PageLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <Card className="flex h-full border-none rounded-none">
      <main className="flex-1 overflow-auto bg-muted/30 p-6 space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        {children}
      </main>
    </Card>
  );
}
```

---

## 4. Patrones de Negocio

### 4.1 Separation of Concerns

- **Actions**: Lógica demutación (Server Actions)
- **Schemas**: Validación de datos (Zod)
- **APIs**: Consumo de servicios externos
- **Components**: Presentación
- **Hooks**: Lógica de estado/comportamiento

### 4.2 Scream Architecture (Ports & Adapters)

Cada feature sigue los principios de Scream Architecture:

```
gestion-pasivos/
├── personal-jubilado/
│   └── registrar/
│       ├── actions/           # CASOS DE USO (Use Cases / Application Services)
│       │   ├── registerEmployeesActions.ts
│       │   └── formStepActions.ts
│       ├── api/               # PUERTOS SECUNDARIOS (Driven / Infrastructure)
│       │   └── getInfoPasive.ts
│       ├── schemas/           # CONTRATOS (Contracts / Input Ports)
│       │   ├── schemaRac.ts
│       │   └── schema-basic_info.ts
│       ├── forms/             # ADAPTADORES PRIMARIOS (Primary Adapters / UI)
│       │   ├── form-multi-steps.tsx
│       │   ├── form-basic-info.tsx
│       │   └── form-health_profile.tsx
│       ├── components/        # VISTAS (Views / Presenters)
│       │   └── loading/
│       └── page.tsx           # ENTRY POINT
```

#### Capas de Scream Architecture

| Capa                      | Propósito                          | Ejemplos en el proyecto      |
| ------------------------- | ---------------------------------- | ---------------------------- |
| **UI/Primary Adapters**   | Interfaz de usuario, formularios   | `forms/*.tsx`, `page.tsx`    |
| **Input Ports/Contracts** | Contratos de entrada (schemas)     | `schemas/*.ts`               |
| **Use Cases/Application** | Lógica de negocio                  | `actions/*.ts`               |
| **Output Ports**          | Interfaces para servicios externos | `api/*.ts`                   |
| **Driven Adapters**       | Implementaciones concretas         | `lib/utils.ts` (apiFetchGet) |

#### Flujo de Datos

```
Usuario → [UI/Form] → [Input Port/Zod Schema] → [Use Case/Action] → [Output Port/API] → Backend
```

---

### 4.3 Feature-Based Organization

Cada módulo de negocio es una **feature** autocontenida que agrupa todo lo necesario para esa funcionalidad:

```
gestion-pasivos/                              # FEATURE ROOT
├── personal-jubilado/                        # SUB-FEATURE
│   ├── registrar/                            # USE CASE
│   │   ├── actions/                         # Lógica de negocio
│   │   │   ├── registerEmployeesActions.ts
│   │   │   └── formStepActions.ts
│   │   ├── forms/                           # Componentes UI específicos
│   │   │   ├── form-multi-steps.tsx
│   │   │   ├── form-basic-info.tsx
│   │   │   └── form-health_profile.tsx
│   │   ├── schemas/                         # Contratos de validación
│   │   │   ├── schemaRac.ts
│   │   │   └── schema-basic_info.ts
│   │   ├── components/                      # Componentes del caso de uso
│   │   │   └── loading/
│   │   └── page.tsx                        # Entry point del caso de uso
│   ├── consultar/                          # Otro caso de uso
│   └── api/                                # Puertos de salida de la feature
├── movimientos/                             # SUB-FEATURE
│   ├── cambiar-pasivo/
│   └── cambiar-estatus/
├── reportes/                                # SUB-FEATURE
│   └── pasivos/
└── components/                              # Componentes compartidos de la feature
    ├── layout/
    ├── movimientos/
    └── pasive/
```

#### Principios Feature-Based

1. **Autocontención**: Cada feature tiene todo lo que necesita
2. **Bajo acoplamiento**: Features se comunican a través de interfaces (APIs)
3. **Alta cohesión**: Elementos relacionados están juntos
4. **Escalabilidad**: Agregar features no afecta existentes
5. **Testabilidad**: Cada capa puede probarse aisladamente

#### Mapeo de Carpetas a Capas

| Carpeta                                    | Capa Scream             | Propósito                                  |
| ------------------------------------------ | ----------------------- | ------------------------------------------ |
| `src/components/ui/`                       | UI Components           | Componentes base genéricos (reutilizables) |
| `src/components/layout/`                   | Layout Components       | Estructura de páginas                      |
| `src/app/(protected)/dashboard/[feature]/` | Primary Adapters        | Formularios y vistas                       |
| `[feature]/forms/`                         | Primary Adapters        | Formularios específicos                    |
| `[feature]/schemas/`                       | Input Ports             | Contratos de validación                    |
| `[feature]/actions/`                       | Application (Use Cases) | Lógica de negocio                          |
| `[feature]/api/`                           | Output Ports            | Interfaces para servicios externos         |
| `src/lib/utils.ts`                         | Infrastructure          | Utilidades (apiFetchGet)                   |
| `src/lib/types/`                           | Domain Types            | Tipos de dominio compartidos               |
| `src/app/types/`                           | Shared Types            | Tipos globales                             |

### 4.4 Multi-Step Registration Flow

```
BasicInfo → AcademicTraining → Background → Health → Physical → Dwelling → Family
    ↓            ↓                 ↓           ↓         ↓          ↓        ↓
  [Step 1]    [Step 2]          [Step 3]    [Step 4]   [Step 5]   [Step 6]  [Step 7]
```

---

## 5. Mapeo de Capas Scream Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  UI Components     │  │  Forms              │  │  Pages              │  │
│  │  (components/ui/*) │  │  (forms/*.tsx)      │  │  (page.tsx)        │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INPUT PORTS (CONTRACTS)                            │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Zod Schemas        │  │  Types               │  │  API Interfaces     │  │
│  │  (schemas/*.ts)     │  │  (types/types.ts)   │  │  (api/*.ts)         │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER (USE CASES)                        │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Server Actions     │  │  API Functions      │  │  Business Logic    │  │
│  │  (actions/*.ts)     │  │  (api/*.ts)         │  │  (lib/utils.ts)    │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OUTPUT PORTS (INTERFACES)                            │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  apiFetchGet        │  │  Repository Pattern │  │  File Upload       │  │
│  │  (lib/utils.ts)     │  │  (api/*.ts)          │  │  (Nest API)        │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────┐
│             INFRASTRUCTURE (DRIVEN ADAPTERS)         │
│  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │  Django REST API    │  │  NextAuth/JWT       │    │
│  │  (Backend)          │  │  (Auth)             │    │
│  └─────────────────────┘  └─────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## 6. Type Safety

### Shared Types (`src/app/types/types.ts`)

```typescript
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface EmployeeData {
  id: number;
  cedulaidentidad: string;
  nombres: string;
  apellidos: string;
  // ...
}

export interface UserSystem {
  id: number;
  cedula: string;
  rol: Role;
  departamento: Depart;
  // ...
}
```

### Domain Types (`src/lib/types/`)

```typescript
// src/lib/types/employee.ts
// src/lib/types/hr.ts
// src/lib/types/codigo.ts
```

---

## 7. API Integration

### Environment Variables

```
NEXT_PUBLIC_DJANGO_API_URL_SERVER=<backend-django>
NEXT_PUBLIC_NEST_API_URL_SERVER=<nest-api>
```

### Response Wrapper

```typescript
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
```

---

## 8. Mejores Prácticas Observadas

1. **Componentes pequeños y focused** - Cada archivo tiene una responsabilidad
2. **Nomenclatura consistente** - `columns.tsx`, `data-table.tsx`, `page.tsx`
3. **Tipado fuerte** - Zod schemas para validación, TypeScript para tipos
4. **Server Components** - Uso de `"use server"` y `"use client"` apropiado
5. **Separación UI/Lógica** - Componentes UI puros, lógica en hooks/actions
6. **Lazy Loading** - `useTransition` para operaciones asíncronas
7. **Error Handling** - Try/catch en Server Actions con mensajes de error

---

## 9. Dependencias Clave

| Categoría   | Librería            | Propósito                     |
| ----------- | ------------------- | ----------------------------- |
| Framework   | Next.js 16          | App Router, Server Components |
| Auth        | NextAuth v5         | JWT sessions                  |
| UI          | Radix UI            | Componentes accesibles        |
| Styling     | TailwindCSS 4       | Utility-first CSS             |
| Forms       | React Hook Form     | Formularios controlados       |
| Validation  | Zod                 | Esquemas de validación        |
| Tables      | TanStack Table      | Tablas con features           |
| Fetching    | SWR                 | Data fetching con cache       |
| PDF         | @react-pdf/renderer | Generación de PDFs            |
| Date        | date-fns            | Manipulación de fechas        |
| Forms Multi | @formity/react      | Formularios multi-paso        |

---

## 10. Diagramas de Flujo

### Flujo de Autenticación

```
Login → Server Action → NextAuth → JWT Token → Session → Dashboard
```

### Flujo de Registro de Empleado

```
BasicInfo → validate → NextStep
AcademicInfo → validate → NextStep
HealthInfo → validate → NextStep
...
Final → registerEmployee (Server Action) → Django API → Nest API (file upload)
```

---

_Documento generado automáticamente - Última actualización: Abril 2026_
