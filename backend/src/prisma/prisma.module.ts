import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { StationOrmService } from "./station-orm.service";
import { RouteOrmService } from "./route-orm.service";
import { DatabaseMaintenanceService } from "./database-maintenance.service";
import { DatabaseMaintenanceController } from "./database-maintenance.controller";

@Module({
  providers: [
    PrismaService,
    StationOrmService,
    RouteOrmService,
    DatabaseMaintenanceService,
  ],
  exports: [
    PrismaService,
    StationOrmService,
    RouteOrmService,
    DatabaseMaintenanceService,
  ],
  controllers: [DatabaseMaintenanceController],
})
export class PrismaModule {}
