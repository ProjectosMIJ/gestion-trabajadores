# Stack Tecnológico - Sistema de Gestión de Trabajadores

## Visión General

Sistema distribuido con 3 componentes principales: API Django, microservicio NestJS y frontend NextJS.

---

## 1. Backend Principal (Django)

### Framework y Core
- **Python** 3.10+
- **Django** 5.2.7
- **Django REST Framework** 3.16.1
- **Simple JWT** - Autenticación JWT
- **Django Simple History** - Auditoría de cambios

### Base de Datos
- **PostgreSQL** (producción)
- **SQLite** (desarrollo local)
- **psycopg2** - Driver PostgreSQL

### APIs y Documentación
- **drf-spectacular** - Documentación OpenAPI
- **django-cors-headers** - Configuración CORS

### Tareas Asíncronas
- **Celery** 5.3.4 - Procesamiento de tareas en background
- **Redis** - Broker de mensajes (implied)

### Procesamiento de Datos
- **pandas** 2.3.3 - Manipulación de datos
- **numpy** 2.3.3 - Computación numérica
- **openpyxl** 3.1.5 - Lectura/escritura Excel

### Reportes y PDF
- **reportlab** 4.4.9 - Generación de PDFs

### Imagenes
- **Pillow** 12.1.0 - Procesamiento de imágenes

### Despliegue
- **Gunicorn** 23.0.0 - Servidor WSGI
- **Docker** - Contenedores

---

## 2. Microservicio (NestJS)

### Framework
- **Node.js** 18+
- **NestJS** 11.0.1
- **TypeScript** 5.7.3
- **RxJS** 7.8.1 - Programación reactiva

### API
- **Swagger** (@nestjs/swagger) - Documentación API
- **Helmet** 8.1.0 - Seguridad HTTP
- **serve-static** - Archivos estáticos

### Utilities
- **sharp** 0.34.4 - Procesamiento de imágenes
- **uuid** 11.1.0 - Generación de IDs
- **date-fns** 4.1.0 - Manipulación de fechas

### Testing
- **Jest** 29.7.0
- **Supertest** 7.0.0
- **ts-jest** 29.2.5

---

## 3. Frontend (NextJS)

### Framework
- **Next.js** 16.1.3
- **React** 19.2.3
- **TypeScript** 5.8.3
- **TailwindCSS** 4 - Estilos

### UI Components
- **Radix UI** - Componentes accesibles base
- **Class Variance Authority** - Variantes de componentes
- **Lucide React** - Iconos
- **SWR** - Fetching de datos

### Formularios y Validación
- **React Hook Form** 7.61.1
- **Zod** 3.25.56 - Esquemas de validación
- **@hookform/resolvers**

### Base de Datos ORM
- **Prisma** 6.5.0
- **@auth/prisma-adapter** - Adaptador NextAuth

### Autenticación
- **NextAuth.js** 5.0.0-beta.25

### PDF
- **@react-pdf/renderer** 4.3.0
- **pdfjs-dist** 5.3.31

### Visualización
- **Chart.js** 4.4.9
- **react-chartjs-2** 5.3.0
- **Recharts** 2.15.3

### Email
- **Resend** 4.2.0 - Servicio de emails

### UI Enhancements
- **Sonner** 2.0.5 - Notificaciones toast
- **cmdk** 1.1.1 - Command menu
- **Embla Carousel** 8.6.0 - Carruseles

---

## 4. DevOps y Herramientas

### Contenedores
- **Docker** / Docker Compose
- **wait-for-db.sh** / wait-for-postgres.py - Scripts de espera

### Linting y Formatting
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formateo de código
- **TypeScript ESLint**

### Control de Versiones
- **Git**

---

## 5. Habilidades Recomendadas por Rol

### Backend Developer
```
- Python / Django / DRF
- PostgreSQL / SQL
- REST APIs / JWT
- Celery / Redis
- Docker
- pandas / Excel
```

### Full Stack Developer
```
- Todo lo anterior +
- React / Next.js
- TypeScript
- TailwindCSS
- Prisma
- NextAuth
```

### DevOps
```
- Docker / Docker Compose
- PostgreSQL administration
- Redis
- Gunicorn / Nginx
- CI/CD basics
```

---

## Resumen de Tecnologías Clave

| Categoría | Tecnología |
|-----------|------------|
| Backend | Django, DRF, Python |
| Microservicio | NestJS, TypeScript, Node.js |
| Frontend | Next.js, React, TailwindCSS |
| Base de Datos | PostgreSQL, SQLite, Prisma |
| Auth | JWT, NextAuth |
| Tasks | Celery, Redis |
| Docs | Swagger/OpenAPI |
| Testing | Jest, pytest |
| DevOps | Docker, Gunicorn |
