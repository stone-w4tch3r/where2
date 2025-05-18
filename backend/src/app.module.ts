import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { StationsModule } from "./stations/stations.module";
import { RoutesModule } from "./routes/routes.module";
import { ReachabilityModule } from "./reachability/reachability.module";
import { YandexModule } from "./yandex/yandex.module";
import { DataImporterModule } from "./data-importer/data-importer.module";
import { GeoRoutesModule } from "./geo-routes/geo-routes.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    StationsModule,
    RoutesModule,
    ReachabilityModule,
    YandexModule,
    DataImporterModule,
    GeoRoutesModule,
  ],
})
export class AppModule {}
