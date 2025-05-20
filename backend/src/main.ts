import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe, Logger, LogLevel, LOG_LEVELS } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AppErrorMappingInterceptor } from "./utils/app-error-mapping.interceptor";
import { ResultUnwrapInterceptor } from "./utils/result-unwrap.interceptor";

function getLoggerLevel(): LogLevel[] {
  const logLevel = process.env.LOG_LEVEL;
  if (!logLevel || !LOG_LEVELS.includes(logLevel as LogLevel)) {
    return LOG_LEVELS;
  }
  const idx = LOG_LEVELS.indexOf(logLevel as LogLevel);
  return LOG_LEVELS.slice(idx);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: getLoggerLevel(),
  });

  Logger.log(`Logger level: ${getLoggerLevel().join(", ")}`, "Bootstrap");

  // Enable CORS
  // app.enableCors();

  // Setup validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Use Result interceptor globally
  app.useGlobalInterceptors(
    new ResultUnwrapInterceptor(),
    new AppErrorMappingInterceptor(),
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle("Where2 API")
    .setDescription(
      "API for the Where2 application, go to <a href='/swagger-yaml'>/swagger-yaml</a> to view the raw OpenAPI YAML",
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  // Start the server
  const port = process.env.PORT || 8080;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}`,
    "Bootstrap",
  );

  // Handle shutdown signals
  process.on("SIGTERM", async () => {
    Logger.log("SIGTERM received, shutting down gracefully", "Bootstrap");
    await app.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    Logger.log("SIGINT received, shutting down gracefully", "Bootstrap");
    await app.close();
    process.exit(0);
  });
}
bootstrap();
