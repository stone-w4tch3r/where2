import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { StationOrmService } from "./station-orm.service";
import { RouteOrmService } from "./route-orm.service";
import { DatabaseMaintenanceService } from "./database-maintenance.service";

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
})
export class PrismaModule {}
