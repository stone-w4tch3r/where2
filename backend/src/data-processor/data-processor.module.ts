import { Module } from "@nestjs/common";
import { DataProcessorService } from "./data-processor.service";
import { PrismaModule } from "../prisma/prisma.module";
import { YandexModule } from "../yandex/yandex.module";

@Module({
  imports: [PrismaModule, YandexModule],
  providers: [DataProcessorService],
  exports: [DataProcessorService],
})
export class DataProcessorModule {}
