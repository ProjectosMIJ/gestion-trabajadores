# Tecnologias del Proyecto

## Backend

### Framework y Runtime

- **NestJS** v11.0.1 - Framework de Node.js para construir aplicaciones server-side
- **TypeScript** v5.7.3 - Lenguaje tipado que compila a JavaScript
- **Node.js** - Runtime de JavaScript

### Dependencias Core

- **@nestjs/common** - Decoradores y utilities de NestJS
- **@nestjs/core** - Nucleo de NestJS
- **@nestjs/platform-express** - Adaptador de Express para NestJS
- **@nestjs/serve-static** - Servir archivos estaticos
- **@nestjs/swagger** v11.2.7 - Documentacion API con Swagger/OpenAPI
- **reflect-metadata** - Reflect metadata para decoradores
- **rxjs** - Programacion reactiva

### Manejo de Archivos

- **multer** - Middleware para subir archivos (multipart/form-data)
- **sharp** v0.34.4 - Procesamiento de imagenes
- **@types/multer** - Tipos TypeScript para multer

### Utilidades

- **uuid** v11.1.0 - Generacion de identificadores unicos
- **date-fns** v4.1.0 - Funciones de manipulacion de fechas
- **helmet** v8.1.0 - Seguridad de headers HTTP

### Desarrollo

- **@nestjs/cli** v11.0.0 - CLI de NestJS
- **@nestjs/schematics** - Schematics para NestJS
- **@nestjs/testing** - Herramientas de testing
- **jest** v29.7.0 - Framework de testing
- **ts-jest** - Transformador Jest para TypeScript
- **eslint** v9.18.0 - Linting de codigo
- **prettier** v3.4.2 - Formateador de codigo
- **typescript-eslint** - ESLint para TypeScript
- **ts-node** - Ejecutor TypeScript
- **ts-loader** - Loader de Webpack para TypeScript
- **supertest** - Testing de HTTP
- **@types/express**, **@types/node**, **@types/jest**, **@types/supertest** - Tipos

## Herramientas de Build

- **@swc/core** y **@swc/cli** - Compilador Rust para TypeScript (mas rapido que tsc)
- **tsconfig-paths** - Resolucion de paths en tsconfig

## Conceptos Clave a Dominar

### NestJS

- Modulos, Controladores, Servicios
- Inyeccion de dependencias
- Pipes y Guards
- Decoradores (@Controller, @Get, @Post, @UseInterceptors, etc.)

### TypeScript

- Tipos e interfaces
- Genericos
- Decoradores experimentales
- Mapped types

### Express (bajo NestJS)

- Middleware
- Routing
- Request/Response handling
- File uploads con multer

### Testing

- Jest (unit tests)
- Testing de servicios y controladores
- Mocks con jest.fn()

### API REST

- Metodos HTTP (GET, POST, PUT, DELETE)
- Status codes
- Headers (Content-Type, CORS)
- StreamableFile para respuestas de archivos
