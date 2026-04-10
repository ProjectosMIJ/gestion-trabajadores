import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://172.16.10.209:3000/',
  });
  const config = new DocumentBuilder()
    .setTitle('Sistema De Archivos')
    .setDescription(
      'Actualmente Solo Se Pueden Subir Imagenes Para Perfil De Usuario',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
