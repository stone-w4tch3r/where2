import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "../app.module";
import { dump } from "js-yaml";
import { writeFileSync } from "fs";

async function generateSwagger(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Where2 API")
    .setDescription("API for the Where2 application")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Convert to YAML and write to file
  writeFileSync("swagger.yaml", dump(document));
  await app.close();
  // eslint-disable-next-line no-console
  console.log("Swagger YAML generated at swagger.yaml");
}

generateSwagger();
