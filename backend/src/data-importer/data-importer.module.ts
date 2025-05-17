import { Module } from "@nestjs/common";
import { DataImporterService } from "./data-importer.service";
import { PrismaModule } from "../prisma/prisma.module";
import { YandexModule } from "../yandex/yandex.module";
import { DataImporterController } from "./data-importer.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [PrismaModule, YandexModule, ConfigModule],
  providers: [DataImporterService],
  controllers: [DataImporterController],
  exports: [DataImporterService],
})
export class DataImporterModule {}
