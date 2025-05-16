import { Module } from "@nestjs/common";
import { YandexService } from "./yandex.service";

@Module({
  providers: [YandexService],
  exports: [YandexService],
})
export class YandexModule {}
