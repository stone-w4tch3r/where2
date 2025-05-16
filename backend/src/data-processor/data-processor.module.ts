import { Module } from "@nestjs/common";
import { DataProcessorService } from "./data-processor.service";
import { PrismaModule } from "../prisma/prisma.module";
import { YandexModule } from "../yandex/yandex.module";
import { DataProcessorController } from "./data-processor.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [PrismaModule, YandexModule, ConfigModule],
  providers: [DataProcessorService],
  controllers: [DataProcessorController],
  exports: [DataProcessorService],
})
export class DataProcessorModule {}
