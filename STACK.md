# Stack Tecnológico - Sistema de Gestión de Trabajadores

## Resumen del Proyecto

Sistema full-stack para la gestión de trabajadores, con backend Django REST API y frontend Next.js.

---

## Backend

### Framework Principal
- **Python 3.10+**
- **Django 5.2** - Framework web principal
- **Django REST Framework** - API REST

### Base de Datos
- **PostgreSQL** - Base de datos relacional
- **SQLite** - Para desarrollo local
- **django-simple-history** - Auditoría de cambios

### Autenticación y Seguridad
- **djangorestframework-simplejwt** - Tokens JWT
- **django-cors-headers** - Control de CORS
- **PyJWT** - Manejo de tokens

### APIs y Documentación
- **drf-spectacular** - Documentación OpenAPI/Swagger
- **django-filter** - Filtrado de queries

### Procesamiento de Datos
- **pandas** - Manipulación de datos
- **numpy** - Computación numérica

### Tareas Asíncronas
- **Celery** - Cola de tareas asíncronas

### Generación de Documentos
- **reportlab** - Generación de PDFs
- **openpyxl** - Lectura/escritura de Excel

### Imagenes
- **Pillow** - Procesamiento de imágenes

### Utils
- **python-decouple** - Manejo de variables de entorno
- **python-dateutil** - Manejo de fechas

---

## Frontend

### Framework
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**

### Estilos
- **Tailwind CSS 4** - Framework de estilos
- **PostCSS** - Procesador de CSS

### UI Components
- **Radix UI** - Componentes base accesibles
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos

### Estado y Formularios
- **React Hook Form** - Formularios
- **Zod** - Validación de esquemas
- **@hookform/resolvers** - Integración Zod
- **SWR** - Fetching de datos

### Autenticación
- **NextAuth.js v5** - Autenticación
- **@auth/prisma-adapter** - Adaptador Prisma

### Base de Datos (Frontend)
- **Prisma** - ORM

### Tablas
- **TanStack Table** - Tablas avanzadas

### Gráficos
- **Recharts** - Gráficos
- **Chart.js** - Gráficos

### PDF
- **@react-pdf/renderer** - Renderizado de PDFs
- **pdfjs-dist** - Visor de PDFs
- **html2canvas** - Captura de HTML
- **html-to-image** - Conversión HTML a imagen

### Notificaciones
- **Sonner** - Toasts/notificaciones

### Validación
- **Zod** - Validación de datos

### Utils
- **date-fns** - Manipulación de fechas
- **date-fns-tz** - Fechas con timezone
- **clsx** / **tailwind-merge** - Clases condicionales
- **class-variance-authority** - Variantes de componentes
- **nanoid** - IDs únicos

---

## Herramientas de Desarrollo

### Linting
- **ESLint** - Linting de JavaScript/TypeScript

### Contenedores
- **Docker** - Contenedores
- **Gunicorn** - Servidor WSGI para producción

---

## Roadmap de Aprendizaje Sugerido

### Nivel 1 - Fundamentos Backend
1. Python (sintaxis, POO, decoradores)
2. Django (models, views, templates, ORM)
3. Django REST Framework (serializers, viewsets, routers)
4. PostgreSQL (SQL básico, relaciones)
5. Autenticación JWT

### Nivel 2 - Backend Avanzado
1. Django Filters y QuerySets optimizados
2. Tareas asíncronas con Celery
3. Documentación de APIs con drf-spectacular
4. Generación de PDFs con ReportLab
5. Manejo de archivos (imágenes, Excel)

### Nivel 3 - Fundamentos Frontend
1. TypeScript (tipos, generics, utility types)
2. React (componentes, hooks, context)
3. Next.js (App Router, server components)
4. Tailwind CSS
5. shadcn/ui y Radix UI

### Nivel 4 - Frontend Avanzado
1. React Hook Form + Zod
2. TanStack Table
3. Gráficos con Recharts
4. Autenticación con NextAuth
5. Prisma ORM

### Nivel 5 - Integración
1. Consumo de APIs REST
2. Manejo de estados (SWR)
3. Deploy con Docker
4. Buenas prácticas de seguridad

---

## Recursos Recomendados

### Django
- [Documentación oficial Django](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

### Next.js
- [Documentación Next.js](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### React
- [React Hooks](https://react.dev/reference/react)
- [TanStack Table](https://tanstack.com/table/latest/docs/)

### UI/UX
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
