import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { DatabaseMaintenanceService } from "./database-maintenance.service";

@Controller("admin/database-maintenance")
export class DatabaseMaintenanceController {
  constructor(
    private readonly maintenanceService: DatabaseMaintenanceService,
  ) {}

  @Post("run")
  @HttpCode(HttpStatus.OK)
  async runMaintenance(): Promise<{ success: boolean; message: string }> {
    const result = await this.maintenanceService.performMaintenance();
    if (result) {
      return {
        success: true,
        message: "Database maintenance completed successfully",
      };
    } else {
      return {
        success: false,
        message: "Database maintenance failed",
      };
    }
  }
}
