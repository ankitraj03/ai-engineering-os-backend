import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    // Enable CORS for frontend integration (Next.js default port: 3000)
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global validation pipe for request DTO validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    const port = process.env.PORT || 4000;
    await app.listen(port);

    logger.log('================================================================');
    logger.log(`🚀 AI Engineering OS Backend is running!`);
    logger.log(`📍 Server URL:        http://localhost:${port}`);
    logger.log(`🏥 Health Check:      http://localhost:${port}/health`);
    logger.log(`🗄️ Database Health:   http://localhost:${port}/health/db`);
    logger.log('================================================================');
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('================================================================');
    logger.error(`❌ Fatal error during backend bootstrap: ${err?.message || String(error)}`);
    logger.error('================================================================');
    process.exit(1);
  }
}

bootstrap();
