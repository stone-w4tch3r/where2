import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import spawn from "cross-spawn";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    const commands: [string, string[]][] = [["prisma", ["migrate", "deploy"]]];
    for (const [cmd, args] of commands) {
      const result = spawn.sync("pnpm", [cmd, ...args], { stdio: "inherit" });
      if (result.status !== 0) {
        console.error(
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
