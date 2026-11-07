import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, X-User-Id',
  });

  const config = new DocumentBuilder()
    .setTitle('Wayfarer API')
    .setDescription('Interactive testing documentation portal for Wayfarer endpoints')
    .setVersion('1.0')
    
    .build();

  const document = SwaggerModule.createDocument(app, config);
  

  SwaggerModule.setup('docs', app, document);

  await app.listen(3001);

}
bootstrap();
