# File Manager - Documentación Completa

## Información General

- **Nombre del Proyecto**: File Manager
- **Versión**: 0.0.1
- **Framework**: NestJS v11.0.1
- **Lenguaje**: TypeScript
- **Runtime**: Node.js
- **Puerto por defecto**: 5000
- **Swagger**: Disponible en `/api`
- **Manejo de archivos**: Multer + Express + Sharp

## Descripción del Proyecto

File Manager es una API REST desarrollada con NestJS que permite la gestión de archivos (subida, almacenamiento y descarga) organizados por carpetas. El sistema está diseñado para manejar archivos PDF e imágenes de perfil de usuario.

## Arquitectura del Proyecto

```
src/
├── app.controller.ts          # Controlador principal
├── app.service.ts             # Servicio principal
├── app.module.ts              # Módulo raíz
├── main.ts                    # Punto de entrada de la aplicación
├── file-save/                 # Módulo para guardar archivos
│   ├── file-save.controller.ts
│   ├── file-save.service.ts
│   ├── file-save.module.ts
│   └── file-validation-pipe/
│       └── file-validation-pipe.pipe.ts
└── read-file/                 # Módulo para leer archivos
    ├── read-file.controller.ts
    ├── read-file.service.ts
    └── read-file.module.ts
```

## Estructura de Carpetas del Sistema de Archivos

```
uploads/
├── temp/                      # Carpeta temporal
│   └── {archivo_temporal}     # Archivos individuales temporales
└── {folderId}/               # Carpetas organizadas por ID
    ├── {archivo_principal}    # Archivo principal (PDF/imagen)
    └── profile/              # Carpeta para fotos de perfil
        └── {archivo_perfil}  # Imagen de perfil (PNG, JPG, JPEG)
```

## Configuración de la Aplicación

### main.ts

```typescript
// Puerto: 5000
// CORS habilitado para http://172.16.10.209:3000/
// Swagger disponible en /api
```

### Dependencias Principales

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1",
  "@nestjs/platform-express": "^11.0.1",
  "@nestjs/serve-static": "^5.0.3",
  "@nestjs/swagger": "^11.2.7",
  "multer": "integrado con platform-express",
  "sharp": "^0.34.4",
  "uuid": "^11.1.0",
  "date-fns": "^4.1.0",
  "helmet": "^8.1.0"
}
```

## API Endpoints

### 1. Endpoint Principal

**GET /**

- **Descripción**: Endpoint de bienvenida
- **Respuesta**: `"Hello World!"`

### 2. Módulo File-Save (Guardado de Archivos)

#### 2.1 Subir Archivo Único

**POST /file-save/upload/:folderId**

- **Descripción**: Sube un archivo individual (PDF o imagen) a una carpeta específica
- **Content-Type**: `multipart/form-data`
- **Parámetros**:
  - `folderId` (path): Identificador de la carpeta destino
  - `file` (form-data): Archivo a subir

**Proceso**:

1. Guarda temporalmente en `./uploads/temp/`
2. Valida el tipo de archivo
3. Crea la carpeta destino si no existe
4. Mueve el archivo a `./uploads/{folderId}/`

**Respuesta de éxito**: HTTP 200 - `{ message: "Archivo Guardado", status: 200 }`
**Respuesta de error**: HTTP 300 - `"Error Al Mover El Archivo"`

#### 2.2 Subir Foto de Perfil

**POST /file-save/upload/profile/:folderId**

- **Descripción**: Sube una imagen de perfil de usuario
- **Content-Type**: `multipart/form-data`
- **Parámetros**:
  - `folderId` (path): Identificador del usuario/carpeta destino
  - `file` (form-data): Imagen de perfil a subir

**Proceso**:

1. Guarda temporalmente en `./uploads/temp/`
2. Valida el tipo de archivo (PNG, JPG, JPEG)
3. Crea la estructura `./uploads/{folderId}/profile/`
4. Mueve el archivo a la carpeta de perfil

**Respuesta de éxito**: HTTP 200 - `{ message: "Archivo Guardado", status: 200 }`
**Respuesta de error**: HTTP 300 - `"Error Al Mover El Archivo"`

### 3. Módulo Read-File (Lectura de Archivos)

#### 3.1 Obtener Archivo Principal

**GET /read-file/:folderId**

- **Descripción**: Retorna el primer archivo PDF/imagen encontrado en la carpeta
- **Parámetros**: `folderId` (path): Identificador de la carpeta
- **Búsqueda**: En `./uploads/{folderId}/`
- **Filtros**: Archivos con extensión .pdf, .png, .jpg, .jpeg

**Respuesta exitosa**:

```typescript
StreamableFile {
  type: string,        // MIME type del archivo
  disposition: 'inline' // Para mostrar en el navegador
}
```

**Error**: HTTP 404 - "Archivo no encontrado"

#### 3.2 Obtener Foto de Perfil

**GET /read-file/profile/:folderId**

- **Descripción**: Retorna la imagen de perfil del usuario
- **Parámetros**: `folderId` (path): Identificador del usuario
- **Búsqueda**: En `./uploads/{folderId}/profile/`
- **Filtros**: Archivos con extensión .png, .jpg, .jpeg

**Respuesta exitosa**:

```typescript
StreamableFile {
  type: string,        // MIME type del archivo
  disposition: 'inline'
}
```

**Error**: HTTP 404 - "Archivo de imagen no encontrado"

### 4. Documentación API (Swagger)

**GET /api**

- **Descripción**: Interfaz Swagger para explorar y probar la API
- **Acceso**: Navegador web

## Validación de Archivos

El `FileValidationPipe` valida los archivos antes de procesarlos:

- **Tipos permitidos**: `.pdf`, `.png`, `.jpg`, `.jpeg`
- **Archivos rechazados**: Cualquier otro tipo de archivo retorna error 400

## Estados HTTP Utilizados

| Código | Estado                | Descripción                   |
| ------ | --------------------- | ----------------------------- |
| 200    | OK                    | Archivo guardado exitosamente |
| 300    | AMBIGUOUS             | Error al mover el archivo     |
| 400    | BAD_REQUEST           | Tipo de archivo inválido      |
| 404    | NOT_FOUND             | Archivo no encontrado         |
| 500    | INTERNAL_SERVER_ERROR | Error interno del servidor    |
