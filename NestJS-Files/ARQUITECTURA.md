# Arquitectura y Patrones de Diseño

## Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Patrones Específicos de NestJS](#patrones-específicos-de-nestjs)
5. [Flujo de Datos](#flujo-de-datos)
6. [Módulos](#módulos)
7. [Manejo de Errores](#manejo-de-errores)

---

## Estructura del Proyecto

```
src/
├── app.controller.ts              # Controlador principal
├── app.controller.spec.ts         # Test unitario
├── app.module.ts                   # Módulo raíz
├── app.service.ts                  # Servicio principal
├── main.ts                         # Punto de entrada
├── file-save/                      # Módulo de guardado de archivos
│   ├── file-save.controller.ts
│   ├── file-save.controller.spec.ts
│   ├── file-save.module.ts
│   ├── file-save.service.ts
│   ├── file-save.service.spec.ts
│   └── file-validation-pipe/
│       ├── file-validation-pipe.pipe.ts
│       └── file-validation-pipe.pipe.spec.ts
└── read-file/                      # Módulo de lectura de archivos
    ├── read-file.controller.ts
    ├── read-file.controller.spec.ts
    ├── read-file.module.ts
    ├── read-file.service.ts
    └── read-file.service.spec.ts
```

---

## Arquitectura General

### Arquitectura: Modular + Layered Simplificada

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Controllers  │  │ Interceptors │  │     Pipes        │  │
│  │ - AppCtrl    │  │ - FileInterc │  │ - FileValidation │  │
│  │ - FileSaveC  │  │              │  │                  │  │
│  │ - ReadFileC  │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ AppService   │  │FileSaveSvc   │  │  ReadFileSvc     │  │
│  │ (basic)      │  │ (business)   │  │  (business)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              File System (uploads/)                   │   │
│  │  - Multer (upload handling)                          │   │
│  │  - Sharp (image processing)                          │   │
│  │  - fs/promises (async file operations)               │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ NestFactory  │  │  Swagger     │  │  ServeStatic     │   │
│  │ (bootstrap)  │  │  (OpenAPI)   │  │  (static files)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Relación entre Componentes

```
Controller ──────> Service ──────> FileSystem (fs/promises)
     │                                    │
     └── Pipe (validación)               Sharp (imágenes)
```

---

## Patrones de Diseño

### 1. Module Pattern (Módulo NestJS)

Organización modular de la aplicación en unidades cohesivas.

```typescript
// src/file-save/file-save.module.ts
@Module({
  imports: [MulterModule.register({ dest: './uploads' })],
  controllers: [FileSaveController],
  providers: [FileSaveService],
})
export class FileSaveModule {}
```

### 2. Service Pattern (Servicio)

Contenedor de lógica de negocio reutilizable e inyectable.

```typescript
// src/file-save/file-save.service.ts
@Injectable()
export class FileSaveService {
  async saveOneFile(file: Express.Multer.File, folderId: string) {
    // Lógica de negocio
  }
}
```

### 3. Controller Pattern (Controlador)

Punto de entrada para manejar solicitudes HTTP y delegar a servicios.

```typescript
// src/file-save/file-save.controller.ts
@Controller('file-save')
export class FileSaveController {
  @Post('/upload/:folderId')
  @UseInterceptors(FileInterceptor('file', { storage: ... }))
  async saveOneFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('folderId') folderId: string
  ) {
    return this.fileSaveService.saveOneFile(file, folderId);
  }
}
```

### 4. Dependency Injection (Inyección de Dependencias)

NestJS resuelve automáticamente las dependencias en los constructores.

```typescript
// Constructor injection
constructor(private readonly fileSaveService: FileSaveService) {}
```

### 5. Factory Method (Método de Fábrica)

Configuración de Multer mediante `diskStorage`.

```typescript
// src/file-save/file-save.controller.ts
diskStorage({
  destination: './uploads/temp',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
```

### 6. Adapter Pattern (Adaptador)

`StreamableFile` adapta `ReadStream` para respuestas HTTP.

```typescript
// src/read-file/read-file.service.ts
const file = fs.createReadStream(directionFile);
return new StreamableFile(file, {
  type: mimetype,
  disposition: 'inline',
});
```

---

## Patrones Específicos de NestJS

### Pipes

**Pipe Personalizado - FileValidationPipePipe**

Valida tipos MIME y procesa imágenes con Sharp.

```typescript
// src/file-save/file-validation-pipe/file-validation-pipe.pipe.ts
@Injectable()
export class FileValidationPipePipe implements PipeTransform {
  constructor(
    private readonly allowed: string[] = [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ],
  ) {}

  async transform(
    value: Express.Multer.File | Express.Multer.File[],
    metadata: ArgumentMetadata,
  ) {
    if (Array.isArray(value)) {
      return Promise.all(value.map((file) => this.processFile(file)));
    }
    return await this.processFile(value);
  }

  private async processFile(file: Express.Multer.File) {
    if (!this.allowed.includes(file.mimetype)) {
      throw new UnprocessableEntityException('Tipo de archivo no permitido');
    }
    // Procesamiento con Sharp...
  }
}
```

### Interceptors

**FileInterceptor** - Intercepta y procesa uploads multipart.

```typescript
// src/file-save/file-save.controller.ts
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: `./uploads/temp`,
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      },
    }),
  }),
)
```

### Decoradores Utilizados

| Decorador            | Capa         | Uso                 |
| -------------------- | ------------ | ------------------- |
| `@Controller()`      | Presentación | Define ruta base    |
| `@Get()`, `@Post()`  | Presentación | Endpoints HTTP      |
| `@Param()`           | Presentación | Extraer path params |
| `@UploadedFile()`    | Presentación | Archivo subido      |
| `@UseInterceptors()` | Presentación | Aplicar interceptor |
| `@Injectable()`      | Servicio     | Hacer inyectable    |

---

## Flujo de Datos

### Upload de Archivo

```
HTTP Request (multipart/form-data)
    │
    ▼
┌─────────────────────┐
│  FileInterceptor    │ ────> Multer guarda en ./uploads/temp
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ FileValidationPipe  │ ────> Valida MIME
│                     │ ────> Procesa con Sharp
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ FileSaveService     │ ────> Mueve archivo a destino final
└─────────────────────┘
    │
    ▼
Response: { message: 'Archivo Guardado', status: 200 }
```

### Lectura de Archivo

```
HTTP Request GET /read-file/file/:folderId/:filename
    │
    ▼
┌─────────────────────┐
│ ReadFileService     │ ────> Busca archivo en filesystem
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ StreamableFile      │ ────> Adapta ReadStream
└─────────────────────┘
    │
    ▼
Response: Stream de archivo
```

---

## Módulos

### AppModule (Módulo Raíz)

```typescript
// src/app.module.ts
@Module({
  imports: [FileSaveModule, ReadFileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### FileSaveModule

Gestión de uploads de archivos.

```typescript
// src/file-save/file-save.module.ts
@Module({
  imports: [MulterModule.register({ dest: './uploads' })],
  controllers: [FileSaveController],
  providers: [FileSaveService],
})
export class FileSaveModule {}
```

### ReadFileModule

Lectura y streaming de archivos.

```typescript
// src/read-file/read-file.module.ts
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
    }),
  ],
  controllers: [ReadFileController],
  providers: [ReadFileService],
})
export class ReadFileModule {}
```

### Diagrama de Dependencias

```
AppModule
├── FileSaveModule
│   └── FileSaveService
└── ReadFileModule
    └── ReadFileService
```

---

## Manejo de Errores

### Excepciones HTTP Utilizadas

| Excepción                      | Código HTTP | Ubicación                    | Caso de Uso               |
| ------------------------------ | ----------- | ---------------------------- | ------------------------- |
| `HttpException`                | 300         | file-save.service.ts         | Error al mover archivo    |
| `NotFoundException`            | 404         | read-file.service.ts         | Archivo no encontrado     |
| `NotFoundException`            | 404         | read-file.service.ts         | Directorio no encontrado  |
| `NotFoundException`            | 404         | read-file.service.ts         | Error al buscar perfil    |
| `UnprocessableEntityException` | 422         | file-validation-pipe.pipe.ts | Tipo archivo no permitido |

### Ejemplo de Manejo

```typescript
// src/file-save/file-save.service.ts
async saveOneFile(file: Express.Multer.File, folderId: string) {
  try {
    await fsPromise.rename(...);
  } catch (error) {
    throw new HttpException(
      'Error Al Mover El Archivo',
      HttpStatus.AMBIGUOUS,
    );
  }
  return { message: 'Archivo Guardado', status: HttpStatus.OK };
}
```

---

## Resumen

| Aspecto           | Estado              | Detalles                                           |
| ----------------- | ------------------- | -------------------------------------------------- |
| **Arquitectura**  | Modular Simple      | 4 capas (Presentation/Service/Data/Infrastructure) |
| **Patrones GoF**  | Mínimos             | Module, Service, Controller, Factory, Adapter      |
| **DTOs/Entities** | Ausentes            | No hay persistencia BD                             |
| **Base de Datos** | No hay              | Solo filesystem (uploads/)                         |
| **Guards**        | Ninguno             | Sin autenticación/autorización                     |
| **Interceptors**  | 1 (FileInterceptor) | Multer para uploads                                |
| **Pipes**         | 1 personalizado     | Validación de archivos                             |
| **Testing**       | Unitarios básicos   | 5 archivos spec.ts                                 |
| **Swagger**       | Configurado         | Disponible en `/api`                               |
