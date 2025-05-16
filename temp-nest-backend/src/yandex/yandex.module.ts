import { Module } from "@nestjs/common";
import { YandexService } from "./yandex.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [YandexService],
  exports: [YandexService],
})
export class YandexModule {}
