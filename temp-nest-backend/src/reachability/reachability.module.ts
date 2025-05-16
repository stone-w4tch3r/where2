import { Module } from "@nestjs/common";
import { ReachabilityService } from "./reachability.service";
import { ReachabilityController } from "./reachability.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ReachabilityController],
  providers: [ReachabilityService],
  exports: [ReachabilityService],
})
export class ReachabilityModule {}
