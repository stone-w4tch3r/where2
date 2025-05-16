import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { StationOrmService } from "./station-orm.service";
import { RouteOrmService } from "./route-orm.service";

@Module({
  providers: [PrismaService, StationOrmService, RouteOrmService],
  exports: [PrismaService, StationOrmService, RouteOrmService],
})
export class PrismaModule {}
