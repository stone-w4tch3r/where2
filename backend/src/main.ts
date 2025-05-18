import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AppErrorMappingInterceptor } from "./utils/app-error-mapping.interceptor";
import { ResultUnwrapInterceptor } from "./utils/result-unwrap.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

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
    .setDescription("API for the Where2 application")
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
