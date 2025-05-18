import { Module } from "@nestjs/common";
import { GeoRoutesController } from "./geo-routes.controller";
import { GeoRoutesService } from "./geo-routes.service";
import { StationsModule } from "../stations/stations.module";
import { RoutesModule } from "../routes/routes.module";

@Module({
  imports: [StationsModule, RoutesModule],
  controllers: [GeoRoutesController],
  providers: [GeoRoutesService],
})
export class GeoRoutesModule {}
