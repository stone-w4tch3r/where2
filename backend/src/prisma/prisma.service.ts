import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import spawn from "cross-spawn";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    const commands: [string, string[]][] = [["prisma", ["migrate", "deploy"]]];
    for (const [cmd, args] of commands) {
      const result = spawn.sync("pnpm", [cmd, ...args], { stdio: "inherit" });
      if (result.status !== 0) {
        this.logger.error(
          `Failed to run: pnpm ${cmd} ${(args as string[]).join(" ")}`,
        );
        process.exit(result.status || 1);
      }
    }
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
